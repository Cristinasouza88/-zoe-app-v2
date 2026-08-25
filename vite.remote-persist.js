export default function remotePersist(){
  return {
    name:'niil-remote-persist',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/App.jsx')&&!id.endsWith('App.jsx')) return null;
      let out=code,changed=false;
      if(!out.includes("from './niil.remote-store.js'")){
        out=out.replace("import { supabase } from './supabase.js';","import { supabase } from './supabase.js';\nimport { carregarRemoto, salvarRemoto } from './niil.remote-store.js';");
        changed=true;
      }
      const load="      store.get(`niil:dados:${perfil.email}`).then(dd => {\n        if (!ativo) return;\n        setD(dd ? { ...inicial, ...dd } : {\n          ...inicial,\n          perfil: { ...inicial.perfil, nome: perfil.nome, email: perfil.email }\n        });\n      });";
      if(out.includes(load)){
        const novo="      Promise.all([store.get(`niil:dados:${perfil.email}`), carregarRemoto()]).then(([local, remoto]) => {\n        if (!ativo) return;\n        const dd = remoto || local;\n        const next = dd ? { ...inicial, ...dd } : { ...inicial, perfil: { ...inicial.perfil, nome: perfil.nome, email: perfil.email } };\n        setD(next);\n        if (remoto) store.set(`niil:dados:${perfil.email}`, remoto).catch?.(()=>{});\n      });";
        out=out.replace(load,novo);changed=true;
      }
      const persist="  const salvar = n => { setD(n); if (usuario) store.set(`niil:dados:${usuario.email}`, n); };\n  const up = fn => salvar(fn(d));";
      if(out.includes(persist)){
        const novo="  const salvar = n => { setD(n); if (usuario) { store.set(`niil:dados:${usuario.email}`, n).catch?.(()=>{}); salvarRemoto(n); } };\n  const up = fn => setD(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; if (usuario) { store.set(`niil:dados:${usuario.email}`, next).catch?.(()=>{}); salvarRemoto(next); } return next; });";
        out=out.replace(persist,novo);changed=true;
      }
      const entrar="    const dd = await store.get(`niil:dados:${u.email}`);\n    setD(dd ? { ...inicial, ...dd } : { ...inicial, perfil: { ...inicial.perfil, nome: u.nome, email: u.email } });";
      if(out.includes(entrar)){
        const novo="    const [local, remoto] = await Promise.all([store.get(`niil:dados:${u.email}`), carregarRemoto()]);\n    const dd = remoto || local;\n    setD(dd ? { ...inicial, ...dd } : { ...inicial, perfil: { ...inicial.perfil, nome: u.nome, email: u.email } });";
        out=out.replace(entrar,novo);changed=true;
      }
      if(!changed)console.warn('[niil-remote-persist] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
