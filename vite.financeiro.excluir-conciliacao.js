export default function financeiroExcluirConciliacao(){
  return {
    name:'zoe-financeiro-excluir-conciliacao',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      const importAnchor="const importacao=()=> <>{header('Importar extrato',()=>setTela('resumo'))}";
      if(out.includes(importAnchor)&&!out.includes('data-zoe-excluir-conciliacao')){
        const acao=`<div data-zoe-excluir-conciliacao="true" style={{display:'flex',justifyContent:'flex-end',alignItems:'center',minHeight:42,margin:'-6px 0 10px'}}><button onClick={async()=>{let pendente=imp||importacaoMemoria;try{if(!pendente)pendente=await carregarConciliacaoPendente()}catch(e){console.warn('ZOE: falha ao consultar conciliação',e)}if(!pendente)return aviso('Não há conciliação pendente para excluir.');const confirmacao=window.prompt('Isso exclui TODOS os meses ainda pendentes desta conciliação. Para confirmar, digite EXCLUIR AGORA');if(String(confirmacao||'').trim().toUpperCase()!=='EXCLUIR AGORA')return aviso('Exclusão cancelada. Digite exatamente EXCLUIR AGORA para confirmar.');importacaoMemoria=null;setImp(null);try{await limparConciliacaoPendente()}catch(e){console.warn('ZOE: falha ao limpar conciliação',e)}atualiza(f=>({...f,importacaoPendente:null}));setTela('resumo');aviso('Toda a conciliação pendente foi excluída. Os lançamentos já enviados ao Financeiro foram preservados.')}} aria-label="Excluir toda conciliação" title="Excluir toda conciliação" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,height:36,border:'1px solid #FCA5A5',background:'#fff',color:'#B91C1C',borderRadius:10,padding:'0 10px',fontSize:11,fontWeight:800,lineHeight:1,cursor:'pointer',boxSizing:'border-box'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg><span>Excluir tudo</span></button></div>`;
        out=out.replace(importAnchor,importAnchor+acao);changed=true;
      }

      const monthStatus="{m.status==='concluido'?chip('Concluído','#DCFCE7','#166534'):chip('Aguardando')}";
      if(out.includes(monthStatus)&&!out.includes('data-zoe-excluir-mes')){
        const monthAction=`<div style={{display:'flex',alignItems:'center',gap:8}}>{m.status==='concluido'?chip('Concluído','#DCFCE7','#166534'):<><span>{chip('Aguardando')}</span><button data-zoe-excluir-mes="true" onClick={async e=>{e.stopPropagation();const nomeMes=mesLabel(m.mes);const confirmacao=window.prompt(\`Excluir somente ${'${'}nomeMes} desta conciliação? Para confirmar, digite EXCLUIR AGORA\`);if(String(confirmacao||'').trim().toUpperCase()!=='EXCLUIR AGORA')return aviso('Exclusão cancelada.');const restantes=(imp?.meses||[]).filter((_,idx)=>idx!==i);if(!restantes.length){importacaoMemoria=null;setImp(null);try{await limparConciliacaoPendente()}catch(err){console.warn('ZOE: falha ao limpar conciliação',err)}setTela('resumo');return aviso(\`${'${'}nomeMes} excluído. Não restaram meses pendentes.\`)}const prox=Math.max(0,restantes.findIndex(x=>x.status!=='concluido'));const novo={...imp,meses:restantes,indice:prox,etapa:'meses'};importacaoMemoria=novo;setImp(novo);try{await salvarConciliacaoPendente(novo)}catch(err){console.warn('ZOE: falha ao salvar conciliação',err)}aviso(\`${'${'}nomeMes} foi excluído da conciliação.\`)}} aria-label={\`Excluir ${'${'}mesLabel(m.mes)}\`} title={\`Excluir ${'${'}mesLabel(m.mes)}\`} style={{width:32,height:32,display:'grid',placeItems:'center',border:'1px solid #FECACA',background:'#FFF',color:'#B91C1C',borderRadius:9,padding:0,cursor:'pointer',flex:'0 0 auto'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg></button></>}</div>`;
        out=out.replace(monthStatus,monthAction);changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-excluir-conciliacao] pontos de interface nao encontrados');
      return changed?{code:out,map:null}:null;
    }
  };
}
