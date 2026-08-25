export default function persistenciaNIIL(){
  return {
    name:'niil-persistencia-funcional',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/App.jsx')&&!id.endsWith('App.jsx')) return null;
      let out=code,changed=false;

      // Atualizacoes de estado sempre usam o valor mais recente do React.
      const antigo="  const salvar = n => { setD(n); if (usuario) store.set(`niil:dados:${usuario.email}`, n); };\n  const up = fn => salvar(fn(d));";
      if(out.includes(antigo)){
        const novo="  const salvar = n => { setD(n); if (usuario) store.set(`niil:dados:${usuario.email}`, n).catch?.(()=>{}); };\n  const up = fn => setD(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; if (usuario) store.set(`niil:dados:${usuario.email}`, next).catch?.(()=>{}); return next; });";
        out=out.replace(antigo,novo);changed=true;
      }

      // Nao monta o aplicativo com `d` vazio para depois carregar o storage. Esse intervalo
      // permitia que o Financeiro inicializasse vazio e gravasse/recuperasse o snapshot errado.
      const sessaoAntiga=`      // Atualiza a tela imediatamente. A leitura dos dados locais acontece depois,\n      // fora do callback do Supabase, para não bloquear o retorno do OAuth.\n      if (ativo) {\n        setUsuario(perfil);\n        setCarregando(false);\n      }\n      store.get(\`niil:dados:\${perfil.email}\`).then(dd => {\n        if (!ativo) return;\n        setD(dd ? { ...inicial, ...dd } : {\n          ...inicial,\n          perfil: { ...inicial.perfil, nome: perfil.nome, email: perfil.email }\n        });\n      });`;
      if(out.includes(sessaoAntiga)){
        const sessaoNova=`      // Primeiro restaura o estado persistido; so depois libera a interface.\n      // Isso elimina a janela em que os modulos montavam com estado vazio no F5.\n      if (ativo) setUsuario(perfil);\n      store.get(\`niil:dados:\${perfil.email}\`).then(dd => {\n        if (!ativo) return;\n        setD(dd ? {\n          ...inicial,\n          ...dd,\n          perfil: { ...inicial.perfil, ...(dd.perfil || {}), nome: dd.perfil?.nome || perfil.nome, email: perfil.email }\n        } : {\n          ...inicial,\n          perfil: { ...inicial.perfil, nome: perfil.nome, email: perfil.email }\n        });\n        setCarregando(false);\n      }).catch(() => {\n        if (!ativo) return;\n        setD({ ...inicial, perfil: { ...inicial.perfil, nome: perfil.nome, email: perfil.email } });\n        setCarregando(false);\n      });`;
        out=out.replace(sessaoAntiga,sessaoNova);changed=true;
      }

      // Login por e-mail tambem deve carregar os dados antes de trocar para a tela principal.
      const entrarAntigo=`  const entrar = async u => {\n    setUsuario(u);\n    const dd = await store.get(\`niil:dados:\${u.email}\`);\n    setD(dd ? { ...inicial, ...dd } : { ...inicial, perfil: { ...inicial.perfil, nome: u.nome, email: u.email } });\n  };`;
      if(out.includes(entrarAntigo)){
        const entrarNovo=`  const entrar = async u => {\n    const dd = await store.get(\`niil:dados:\${u.email}\`);\n    setD(dd ? { ...inicial, ...dd, perfil: { ...inicial.perfil, ...(dd.perfil || {}), nome: dd.perfil?.nome || u.nome, email: u.email } } : { ...inicial, perfil: { ...inicial.perfil, nome: u.nome, email: u.email } });\n    setUsuario(u);\n  };`;
        out=out.replace(entrarAntigo,entrarNovo);changed=true;
      }

      if(!changed)console.warn('[niil-persistencia-funcional] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
