import { supabase } from './supabase.js';
import { store } from './ui.jsx';

// Intercepta somente o estado principal do NIIL. Fotos e demais blobs continuam
// no armazenamento atual e podem ser migrados separadamente depois.
const originalGet = store.get.bind(store);
const originalSet = store.set.bind(store);
const timers = new Map();
let usuarioAtual = null;

const isMainStateKey = key => /^niil:dados:.+/.test(String(key || ''));
const metaKey = key => `${key}:meta`;
const nowIso = () => new Date().toISOString();
const sameEmail = (key, user) => {
  const emailKey = String(key).replace(/^niil:dados:/, '').trim().toLowerCase();
  return !!user?.id && !!user?.email && emailKey === String(user.email).trim().toLowerCase();
};
const tableMissing = error => {
  const code = String(error?.code || '');
  const msg = String(error?.message || '');
  return code === '42P01' || code === 'PGRST205' || /niil_user_state|relation .* does not exist/i.test(msg);
};
const withTimeout = (promise, ms = 2200) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('NIIL_CLOUD_TIMEOUT')), ms))
]);

async function getAuthUser() {
  if (usuarioAtual?.id) return usuarioAtual;
  try {
    const { data } = await supabase.auth.getSession();
    usuarioAtual = data?.session?.user || null;
  } catch {}
  return usuarioAtual;
}

async function upsertCloud(user, state, updatedAt) {
  if (!user?.id) return false;
  const { error } = await supabase
    .from('niil_user_state')
    .upsert({ user_id: user.id, state, updated_at: updatedAt }, { onConflict: 'user_id' });
  if (error) {
    if (!tableMissing(error)) console.warn('NIIL: falha ao sincronizar estado na nuvem', error);
    return false;
  }
  return true;
}

function scheduleCloud(key, user, state, updatedAt) {
  const id = user?.id;
  if (!id) return;
  const prior = timers.get(id);
  if (prior) clearTimeout(prior);
  const timer = setTimeout(() => {
    timers.delete(id);
    upsertCloud(user, state, updatedAt).catch(() => {});
  }, 350);
  timers.set(id, timer);
}

store.get = async function cloudAwareGet(key) {
  if (!isMainStateKey(key)) return originalGet(key);

  const local = await originalGet(key);
  const localMeta = await originalGet(metaKey(key));
  const user = await getAuthUser();
  if (!sameEmail(key, user)) return local;

  try {
    const result = await withTimeout(
      supabase
        .from('niil_user_state')
        .select('state, updated_at')
        .eq('user_id', user.id)
        .maybeSingle()
    );
    if (result?.error) throw result.error;
    const cloud = result?.data;

    if (cloud?.state) {
      const cloudTs = Date.parse(cloud.updated_at || 0) || 0;
      const localTs = Date.parse(localMeta?.updatedAt || 0) || 0;

      if (local && localTs > cloudTs) {
        scheduleCloud(key, user, local, localMeta.updatedAt || nowIso());
        return local;
      }

      await originalSet(key, cloud.state);
      await originalSet(metaKey(key), { updatedAt: cloud.updated_at || nowIso(), source: 'cloud' });
      return cloud.state;
    }

    // Primeira vez depois da migração: sobe automaticamente o que já estava no aparelho.
    if (local) {
      const updatedAt = localMeta?.updatedAt || nowIso();
      scheduleCloud(key, user, local, updatedAt);
      await originalSet(metaKey(key), { updatedAt, source: 'local-migrated' });
    }
    return local;
  } catch (error) {
    if (error?.message !== 'NIIL_CLOUD_TIMEOUT' && !tableMissing(error)) {
      console.warn('NIIL: nuvem indisponível; usando cache local', error);
    }
    return local;
  }
};

store.set = async function cloudAwareSet(key, value) {
  if (!isMainStateKey(key)) return originalSet(key, value);

  const updatedAt = nowIso();
  const ok = await originalSet(key, value);
  await originalSet(metaKey(key), { updatedAt, source: 'local' });

  const user = await getAuthUser();
  if (sameEmail(key, user)) scheduleCloud(key, user, value, updatedAt);
  return ok;
};

supabase.auth.getSession().then(({ data }) => {
  usuarioAtual = data?.session?.user || null;
}).catch(() => {});

supabase.auth.onAuthStateChange((_event, session) => {
  usuarioAtual = session?.user || null;
});
