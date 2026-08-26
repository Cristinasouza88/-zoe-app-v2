import { supabase } from './supabase.js';
import { store } from './ui.jsx';

const pendentes = new Map();
const DELAY_SYNC = 350;

const chaveDados = user => `niil:dados:${user?.email || 'anon'}`;
const chaveMeta = user => `niil:dados-meta:${user?.email || 'anon'}`;
const agora = () => new Date().toISOString();

const perfilNoEstado = (base, state, user) => ({
  ...base,
  ...(state || {}),
  perfil: {
    ...(base?.perfil || {}),
    ...(state?.perfil || {}),
    nome: state?.perfil?.nome || user?.nome || base?.perfil?.nome || '',
    email: user?.email || state?.perfil?.email || base?.perfil?.email || ''
  }
});

const tabelaIndisponivel = error => {
  const code = String(error?.code || '');
  const msg = String(error?.message || '');
  return code === '42P01' || code === 'PGRST205' || /niil_user_state|relation .* does not exist/i.test(msg);
};

const comTimeout = (promise, ms = 2200) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('NIIL_CLOUD_TIMEOUT')), ms))
]);

async function salvarNaNuvem(user, state, updatedAt = agora()) {
  if (!user?.id) return false;
  const { error } = await supabase
    .from('niil_user_state')
    .upsert({ user_id: user.id, state, updated_at: updatedAt }, { onConflict: 'user_id' });

  if (error) {
    if (!tabelaIndisponivel(error)) console.warn('NIIL: falha ao sincronizar estado na nuvem', error);
    return false;
  }
  return true;
}

export async function carregarEstadoUsuario(user, base) {
  const local = await store.get(chaveDados(user));
  const metaLocal = await store.get(chaveMeta(user));
  const fallback = perfilNoEstado(base, local, user);

  if (!user?.id) return fallback;

  try {
    const resposta = await comTimeout(
      supabase
        .from('niil_user_state')
        .select('state, updated_at')
        .eq('user_id', user.id)
        .maybeSingle()
    );

    if (resposta?.error) throw resposta.error;
    const remoto = resposta?.data;

    if (remoto?.state) {
      const tCloud = Date.parse(remoto.updated_at || 0) || 0;
      const tLocal = Date.parse(metaLocal?.updatedAt || 0) || 0;

      // Se este navegador tiver uma alteração realmente mais nova, preserva e envia para a nuvem.
      if (local && tLocal > tCloud) {
        salvarNaNuvem(user, local, metaLocal.updatedAt).catch(() => {});
        return fallback;
      }

      await store.set(chaveDados(user), remoto.state);
      await store.set(chaveMeta(user), { updatedAt: remoto.updated_at || agora(), source: 'cloud' });
      return perfilNoEstado(base, remoto.state, user);
    }

    // Primeira migração: o estado que já existe no aparelho vira a primeira cópia na nuvem.
    if (local) {
      const updatedAt = metaLocal?.updatedAt || agora();
      await salvarNaNuvem(user, local, updatedAt);
      await store.set(chaveMeta(user), { updatedAt, source: 'local-migrated' });
      return fallback;
    }

    const novo = perfilNoEstado(base, null, user);
    const updatedAt = agora();
    await salvarNaNuvem(user, novo, updatedAt);
    await store.set(chaveDados(user), novo);
    await store.set(chaveMeta(user), { updatedAt, source: 'new' });
    return novo;
  } catch (error) {
    if (error?.message !== 'NIIL_CLOUD_TIMEOUT' && !tabelaIndisponivel(error)) {
      console.warn('NIIL: usando cópia local porque a nuvem não respondeu', error);
    }
    return fallback;
  }
}

export async function persistirEstadoUsuario(user, state) {
  if (!user) return false;
  const updatedAt = agora();

  // Cache local primeiro: o app continua rápido e funciona mesmo sem internet.
  const [ok] = await Promise.all([
    store.set(chaveDados(user), state),
    store.set(chaveMeta(user), { updatedAt, source: 'local' })
  ]);

  if (!user.id) return ok;

  const anterior = pendentes.get(user.id);
  if (anterior?.timer) clearTimeout(anterior.timer);

  const item = { user, state, updatedAt, timer: null };
  item.timer = setTimeout(async () => {
    pendentes.delete(user.id);
    await salvarNaNuvem(user, state, updatedAt);
  }, DELAY_SYNC);
  pendentes.set(user.id, item);

  return ok;
}

export async function flushEstadoUsuario(user) {
  if (!user?.id) return;
  const item = pendentes.get(user.id);
  if (!item) return;
  clearTimeout(item.timer);
  pendentes.delete(user.id);
  await salvarNaNuvem(item.user, item.state, item.updatedAt);
}
