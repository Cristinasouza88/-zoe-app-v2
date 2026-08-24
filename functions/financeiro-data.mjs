import { getStore } from '@netlify/blobs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sfunjjpmrnijumeihctz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_gwGUFgU477xP0-zFBLZ-gw__why1S1L';
const NO_CACHE = { 'Cache-Control':'no-store, no-cache, must-revalidate, max-age=0' };

async function getUser(req) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_KEY }
  });
  if (!r.ok) return null;
  return r.json();
}

const json = (body, init = {}) => Response.json(body, {
  ...init,
  headers: { ...NO_CACHE, ...(init.headers || {}) }
});

export default async (req) => {
  try {
    const user = await getUser(req);
    if (!user?.id) return json({ ok:false, error:'unauthorized' }, { status:401 });

    // Financeiro precisa de read-after-write consistente. O modelo eventual pode
    // devolver a versao anterior por ate ~60s e foi uma fonte real de regressao no F5.
    const store = getStore({ name:'zoe-financeiro-v1', consistency:'strong' });
    const key = `user/${user.id}/financeiro`;

    if (req.method === 'GET') {
      const payload = await store.get(key, { type:'json', consistency:'strong' });
      return json({
        ok:true,
        data:payload?.data ?? null,
        updatedAt:payload?.updatedAt ?? null,
        transacoes:Array.isArray(payload?.data?.transacoes) ? payload.data.transacoes.length : 0
      });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await req.json();
      if (!body?.data || typeof body.data !== 'object') {
        return json({ ok:false, error:'invalid_body' }, { status:400 });
      }

      const expected = Array.isArray(body.data.transacoes) ? body.data.transacoes.length : 0;
      const payload = { data:body.data, updatedAt:new Date().toISOString() };
      await store.setJSON(key, payload);

      // Nao responde sucesso apenas porque setJSON resolveu. Rele a mesma chave com
      // consistencia forte e confirma a quantidade efetivamente persistida.
      const confirmado = await store.get(key, { type:'json', consistency:'strong' });
      const persisted = Array.isArray(confirmado?.data?.transacoes) ? confirmado.data.transacoes.length : 0;
      if (!confirmado || persisted !== expected) {
        return json({
          ok:false,
          error:'write_not_confirmed',
          expected,
          persisted
        }, { status:500 });
      }

      return json({
        ok:true,
        updatedAt:confirmado.updatedAt || payload.updatedAt,
        transacoes:persisted
      });
    }

    return new Response('Method Not Allowed', { status:405, headers:NO_CACHE });
  } catch (e) {
    console.error('financeiro-data', e);
    return json({ ok:false, error:e?.message || 'server_error' }, { status:500 });
  }
};
