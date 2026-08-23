export default function financeiroExcluirConciliacao(){
  return {
    name:'zoe-financeiro-excluir-conciliacao',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code;
      const importAnchor="const importacao=()=> <>{header('Importar extrato',()=>setTela('resumo'))}";
      if(!out.includes(importAnchor)){
        console.warn('[zoe-financeiro-excluir-conciliacao] tela de importacao nao encontrada');
        return null;
      }
      if(out.includes('data-zoe-excluir-conciliacao')) return null;

      const acao=`<div data-zoe-excluir-conciliacao="true" style={{display:'flex',justifyContent:'flex-end',alignItems:'center',minHeight:42,margin:'-6px 0 10px'}}><button onClick={async()=>{let pendente=imp||importacaoMemoria;try{if(!pendente)pendente=await carregarConciliacaoPendente()}catch(e){console.warn('ZOE: falha ao consultar conciliação',e)}if(!pendente)return aviso('Não há conciliação pendente para excluir.');const confirmacao=window.prompt('Para excluir esta conciliação, digite EXCLUIR AGORA');if(String(confirmacao||'').trim().toUpperCase()!=='EXCLUIR AGORA')return aviso('Exclusão cancelada. Digite exatamente EXCLUIR AGORA para confirmar.');importacaoMemoria=null;setImp(null);try{await limparConciliacaoPendente()}catch(e){console.warn('ZOE: falha ao limpar conciliação',e)}atualiza(f=>({...f,importacaoPendente:null}));setTela('resumo');aviso('Conciliação pendente excluída. Os lançamentos já enviados foram preservados.')}} aria-label="Excluir conciliação" title="Excluir conciliação" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,height:36,border:'1px solid #FCA5A5',background:'#fff',color:'#B91C1C',borderRadius:10,padding:'0 10px',fontSize:11,fontWeight:800,lineHeight:1,cursor:'pointer',boxSizing:'border-box'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg><span>Excluir conciliação</span></button></div>`;

      out=out.replace(importAnchor,importAnchor+acao);
      return {code:out,map:null};
    }
  };
}
