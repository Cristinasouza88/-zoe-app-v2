export default function financeiroReceitaClick(){
  return {
    name:'zoe-financeiro-receita-click',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      if(code.includes("todasEntradas:true")&&/onClick=\{\(\)=>setSheet\(\{tipo:'categoriaDetalhe'/.test(code)) return null;

      const rx=/<Card([^>]*)>\s*<small>Receita<\/small>\s*<h3>\{formatoMoeda\(receita\)\}<\/h3>\s*<\/Card>/;
      if(!rx.test(code)){
        console.warn('[zoe-financeiro-receita-click] card Receita não encontrado');
        return null;
      }

      const novo=`<Card onClick={()=>setSheet({tipo:'categoriaDetalhe',categoria:'Receitas do mês',filtroTipo:'entrada',todasEntradas:true})} style={{background:C.mint,cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div><small>Receita</small><h3>{formatoMoeda(receita)}</h3></div><ChevronRight size={18} color={C.ink3}/></div></Card>`;
      return {code:code.replace(rx,novo),map:null};
    }
  };
}
