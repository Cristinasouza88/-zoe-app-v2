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

      const bloco=`{imp&&<Card data-zoe-excluir-conciliacao="true" style={{marginBottom:12,background:'#FFF7F7',border:'1px solid #FECACA'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}><div><b style={{fontSize:13,color:'#991B1B'}}>Conciliação pendente</b><div style={{fontSize:11,color:C.ink3,marginTop:3}}>{imp.arquivo||'Arquivo importado'} • toque na lixeira para excluir</div></div><button onClick={async()=>{const confirmacao=window.prompt('Para excluir esta conciliação, digite EXCLUIR AGORA');if(String(confirmacao||'').trim().toUpperCase()!=='EXCLUIR AGORA')return aviso('Exclusão cancelada. Digite exatamente EXCLUIR AGORA para confirmar.');importacaoMemoria=null;setImp(null);try{await limparConciliacaoPendente()}catch(e){console.warn('ZOE: falha ao limpar conciliação',e)}atualiza(f=>({...f,importacaoPendente:null}));setTela('resumo');aviso('Conciliação pendente excluída. Os lançamentos já enviados foram preservados.')}} aria-label="Excluir conciliação" title="Excluir conciliação" style={{width:40,height:40,display:'grid',placeItems:'center',border:'1px solid #FCA5A5',background:'#fff',color:'#B91C1C',borderRadius:10,padding:0,cursor:'pointer',flex:'0 0 auto'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg></button></div></Card>}`;

      out=out.replace(importAnchor,importAnchor+bloco);
      return {code:out,map:null};
    }
  };
}
