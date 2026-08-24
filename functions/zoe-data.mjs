import { getStore } from '@netlify/blobs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sfunjjpmrnijumeihctz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_gwGUFgU477xP0-zFBLZ-gw__why1S1L';

async function usuarioDaRequisicao(req) {
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
    const user = await usuarioDaRequisicao(req);
    if (!user?.id) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });

    const dados = getStore({ name: 'zoe-user-data', consistency: 'strong' });
    const key = `user/${user.id}/app-state-v1`;

    if (req.method === 'GET') {
      const value = await dados.get(key, { type: 'json', consistency: 'strong' });
      return Response.json({ ok: true, data: value || null });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = await req.json();
      if (!body || typeof body !== 'object' || !body.data) {
        return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });
      }
      await dados.setJSON(key, body.data, {
        metadata: { updatedAt: new Date().toISOString(), email: user.email || '' }
      });
      return Response.json({ ok: true, updatedAt: new Date().toISOString() });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (e) {
    console.error('zoe-data', e);
    return Response.json({ ok: false, error: e?.message || 'server_error' }, { status: 500 });
  }
};
