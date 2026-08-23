export default function financeiroUxFinal(){
  return {
    name:'zoe-financeiro-ux-final',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      const persist=" const persistImp=next=>setImp(prev=>{const v=typeof next==='function'?next(prev):next;importacaoMemoria=v;if(v)salvarConciliacaoPendente(v).catch(()=>{});else limparConciliacaoPendente().catch(()=>{});return v});";
      if(out.includes(persist)&&!out.includes('zoe-fin-reset-v2')){
        const reset=`${persist}\n useEffect(()=>{if(typeof window==='undefined')return;const k='zoe-fin-reset-v2';if(localStorage.getItem(k)==='1')return;importacaoMemoria=null;setImp(null);limparConciliacaoPendente().catch(()=>{});atualiza(f=>({...f,transacoes:[],investimentos:[],ativos:[],compromissos:[],documentos:[],importacoesConciliadas:[],importacaoPendente:null,movimentosPatrimoniais:[],liquidezAtual:0,pontosFinanceiros:0}));localStorage.setItem(k,'1');setTela('resumo');setTimeout(()=>aviso('Financeiro zerado para uma nova importação.'),80)},[]);`;
        out=out.replace(persist,reset);changed=true;
      }

      const receitaCard="<Card style={{background:C.mint}}><small>Receita</small><h3>{formatoMoeda(receita)}</h3></Card>";
      if(out.includes(receitaCard)){
        out=out.replace(receitaCard,"<Card onClick={()=>setSheet({tipo:'categoriaDetalhe',categoria:'Receitas do mês',filtroTipo:'entrada',todasEntradas:true})} style={{background:C.mint,cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div><small>Receita</small><h3>{formatoMoeda(receita)}</h3></div><ChevronRight size={18} color={C.ink3}/></div></Card>");changed=true;
      }

      const filtro="(!sheet.filtroTipo||t.tipo===sheet.filtroTipo)&&t.categoria===sheet.categoria&&!t.ignorarResumo";
      if(out.includes(filtro)){
        out=out.split(filtro).join("(sheet.todasEntradas?t.tipo==='entrada':((!sheet.filtroTipo||t.tipo===sheet.filtroTipo)&&t.categoria===sheet.categoria))&&!t.ignorarResumo");changed=true;
      }

      const filtroSome="(!sheet.filtroTipo||t.tipo===sheet.filtroTipo)&&t.categoria===sheet.categoria&&!t.ignorarResumo";
      if(out.includes(filtroSome)){
        out=out.split(filtroSome).join("(sheet.todasEntradas?t.tipo==='entrada':((!sheet.filtroTipo||t.tipo===sheet.filtroTipo)&&t.categoria===sheet.categoria))&&!t.ignorarResumo");changed=true;
      }

      const oldImport=/\{imp\?'Continuar conciliação':'Importar'\}<\/b><small>\{imp\?`\$\{pendMeses\} mês\(es\) pendente\(s\)`:'Conciliação mês a mês'\}<\/small>/;
      if(oldImport.test(out)){
        out=out.replace(oldImport,"Importar</b><small>Preenchimento automático por mês</small>");changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-ux-final] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
