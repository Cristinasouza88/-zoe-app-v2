import { getStore } from '@netlify/blobs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sfunjjpmrnijumeihctz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_gwGUFgU477xP0-zFBLZ-gw__why1S1L';

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

export default async (req) => {
  try {
    const user = await getUser(req);
    if (!user?.id) return Response.json({ ok:false, error:'unauthorized' }, { status:401 });

    const store = getStore('zoe-financeiro-v1');
    const key = `user/${user.id}/financeiro`;

    if (req.method === 'GET') {
      const payload = await store.get(key, { type:'json' });
      return Response.json({ ok:true, data:payload?.data || null, updatedAt:payload?.updatedAt || null });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await req.json();
      if (!body?.data || typeof body.data !== 'object') {
        return Response.json({ ok:false, error:'invalid_body' }, { status:400 });
      }
      const payload = { data:body.data, updatedAt:new Date().toISOString() };
      await store.setJSON(key, payload);
      return Response.json({ ok:true, updatedAt:payload.updatedAt, transacoes:Array.isArray(body.data.transacoes)?body.data.transacoes.length:0 });
    }

    return new Response('Method Not Allowed', { status:405 });
  } catch (e) {
    console.error('financeiro-data', e);
    return Response.json({ ok:false, error:e?.message || 'server_error' }, { status:500 });
  }
};
