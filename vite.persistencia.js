export default function persistenciaZoe(){
  return {
    name:'zoe-persistencia-funcional',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/App.jsx')&&!id.endsWith('App.jsx')) return null;
      const antigo="  const salvar = n => { setD(n); if (usuario) store.set(`zoe:dados:${usuario.email}`, n); };\n  const up = fn => salvar(fn(d));";
      if(!code.includes(antigo)){
        console.warn('[zoe-persistencia-funcional] ponto de persistencia nao encontrado');
        return null;
      }
      const novo="  const salvar = n => { setD(n); if (usuario) store.set(`zoe:dados:${usuario.email}`, n).catch?.(()=>{}); };\n  const up = fn => setD(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; if (usuario) store.set(`zoe:dados:${usuario.email}`, next).catch?.(()=>{}); return next; });";
      return {code:code.replace(antigo,novo),map:null};
    }
  };
}
