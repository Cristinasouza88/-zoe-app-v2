export default function financeiroPagamentoFatura(){
  return {
    name:'zoe-financeiro-pagamento-fatura-manual',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      const old=" const resolver=(id,categoria)=>{let deveEnviar=false;persistImp(o=>({...o,meses:o.meses.map((m,i)=>i!==o.indice?m:{...m,itens:m.itens.map(t=>{if(t.id!==id)return t;const z=regras({...t,categoria,confianca:'CONFIRMADO_MANUAL'}),final={...z,revisar:Boolean(z.possivelDuplicado)||Boolean(z.possivelPagamentoFatura)||z.categoria==='Outros'};deveEnviar=!final.revisar&&!final.duplicado;return final})})}));if(deveEnviar)setTimeout(()=>enviarItemResolvido(id),0)};";
      if(!code.includes(old)) return null;
      const next=" const resolver=(id,categoria)=>{let deveEnviar=false;persistImp(o=>({...o,meses:o.meses.map((m,i)=>i!==o.indice?m:{...m,itens:m.itens.map(t=>{if(t.id!==id)return t;if(categoria==='Pagamento de fatura'){const final={...t,categoria:'Pagamento de fatura',natureza:'PAGAMENTO_FATURA',impactoReceita:0,impactoDespesa:0,ignorarResumo:true,pagamentoFatura:true,possivelPagamentoFatura:false,confianca:'CONFIRMADO_MANUAL',revisar:false};deveEnviar=!final.duplicado;return final}const z=regras({...t,categoria,confianca:'CONFIRMADO_MANUAL'}),final={...z,revisar:Boolean(z.possivelDuplicado)||Boolean(z.possivelPagamentoFatura)||z.categoria==='Outros'};deveEnviar=!final.revisar&&!final.duplicado;return final})})}));if(deveEnviar)setTimeout(()=>enviarItemResolvido(id),0)};";
      return {code:code.replace(old,next),map:null};
    }
  };
}
