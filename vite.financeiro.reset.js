export default function financeiroReset(){
  return {
    name:'zoe-financeiro-reset-link',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      const needle=" const persistImp=next=>setImp(prev=>{const v=typeof next==='function'?next(prev):next;importacaoMemoria=v;if(v)salvarConciliacaoPendente(v).catch(()=>{});else limparConciliacaoPendente().catch(()=>{});return v});";
      if(!code.includes(needle)) throw new Error('Reset financeiro: ponto de injeção não encontrado');
      const injected=`${needle}\n useEffect(()=>{if(typeof window==='undefined')return;const u=new URL(window.location.href);if(u.searchParams.get('resetFinanceiro')!=='1')return;importacaoMemoria=null;setImp(null);limparConciliacaoPendente().catch(()=>{});atualiza(f=>({...f,transacoes:[],documentos:[],importacoesConciliadas:[],importacaoPendente:null}));setTela('resumo');u.searchParams.delete('resetFinanceiro');window.history.replaceState({},'',u.toString());setTimeout(()=>aviso('Histórico financeiro e conciliações foram zerados. Metas, ativos e investimentos foram preservados.'),50)},[]);`;
      return {code:code.replace(needle,injected),map:null};
    }
  };
}
