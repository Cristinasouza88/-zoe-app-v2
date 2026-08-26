from pathlib import Path

p = Path('NiilAppCore.jsx')
s = p.read_text()

old = "import { supabase } from './supabase.js';"
new = "import { supabase } from './supabase.js';\nimport { carregarEstadoUsuario, persistirEstadoUsuario, flushEstadoUsuario } from './cloudState.js';"
if old not in s:
    raise SystemExit('import supabase não encontrado')
s = s.replace(old, new, 1)

old = "    const aplicarSessao = (session) => {"
new = "    const aplicarSessao = async (session) => {"
if old not in s:
    raise SystemExit('aplicarSessao não encontrado')
s = s.replace(old, new, 1)

old = """      // Atualiza a tela imediatamente. A leitura dos dados locais acontece depois,
      // fora do callback do Supabase, para não bloquear o retorno do OAuth.
      if (ativo) {
        setUsuario(perfil);
        setCarregando(false);
      }
      store.get(`niil:dados:${perfil.email}`).then(dd => {
        if (!ativo) return;
        setD(dd ? { ...inicial, ...dd } : {
          ...inicial,
          perfil: { ...inicial.perfil, nome: perfil.nome, email: perfil.email }
        });
      });"""
new = """      // O login identifica a pessoa; o estado principal vem da nuvem quando disponível.
      // localStorage permanece como cache offline e também é a fonte da primeira migração.
      if (ativo) setUsuario(perfil);
      const dd = await carregarEstadoUsuario(perfil, inicial);
      if (!ativo) return;
      setD(dd);
      setCarregando(false);"""
if old not in s:
    raise SystemExit('bloco de carga local não encontrado')
s = s.replace(old, new, 1)

old = """  const salvar = n => { setD(n); if (usuario) store.set(`niil:dados:${usuario.email}`, n).catch?.(()=>{}); };
  const up = fn => setD(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; if (usuario) store.set(`niil:dados:${usuario.email}`, next).catch?.(()=>{}); return next; });"""
new = """  const salvar = n => { setD(n); if (usuario) persistirEstadoUsuario(usuario, n).catch?.(()=>{}); };
  const up = fn => setD(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; if (usuario) persistirEstadoUsuario(usuario, next).catch?.(()=>{}); return next; });"""
if old not in s:
    raise SystemExit('salvar/up não encontrado')
s = s.replace(old, new, 1)

old = """  const entrar = async u => {
    setUsuario(u);
    const dd = await store.get(`niil:dados:${u.email}`);
    setD(dd ? { ...inicial, ...dd } : { ...inicial, perfil: { ...inicial.perfil, nome: u.nome, email: u.email } });
  };
  const sair = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    setD(inicial);
  };"""
new = """  const entrar = async u => {
    setUsuario(u);
    setCarregando(true);
    const dd = await carregarEstadoUsuario(u, inicial);
    setD(dd);
    setCarregando(false);
  };
  const sair = async () => {
    await flushEstadoUsuario(usuario).catch?.(()=>{});
    await supabase.auth.signOut();
    setUsuario(null);
    setD(inicial);
  };"""
if old not in s:
    raise SystemExit('entrar/sair não encontrado')
s = s.replace(old, new, 1)

p.write_text(s)
