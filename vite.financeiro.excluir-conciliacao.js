export default function financeiroExcluirConciliacao(){
  return {
    name:'zoe-financeiro-excluir-conciliacao',
    enforce:'post',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      const stateAnchor='[sheet,setSheet]=useState(null)';
      if(out.includes(stateAnchor)&&!out.includes('[confirmarExclusao,setConfirmarExclusao]')){
        out=out.replace(stateAnchor,stateAnchor+",[confirmarExclusao,setConfirmarExclusao]=useState(false),[textoExclusao,setTextoExclusao]=useState('')");
        changed=true;
      }

      const fnAnchor=' const concluirImportacao=';
      if(out.includes(fnAnchor)&&!out.includes('const excluirConciliacao=async')){
        const fn=` const abrirExcluirConciliacao=()=>{setTextoExclusao('');setConfirmarExclusao(true)};\n const excluirConciliacao=async()=>{if(textoExclusao.trim().toUpperCase()!=='EXCLUIR AGORA')return aviso('Digite EXCLUIR AGORA para confirmar.');if(!imp&&!importacaoMemoria)return;importacaoMemoria=null;setImp(null);try{await limparConciliacaoPendente()}catch(e){console.warn('ZOE: falha ao limpar conciliação',e)}atualiza(f=>({...f,importacaoPendente:null}));setConfirmarExclusao(false);setTextoExclusao('');setTela('resumo');aviso('Conciliação pendente excluída. Os lançamentos já enviados foram preservados.')};\n`;
        out=out.replace(fnAnchor,fn+fnAnchor);changed=true;
      }

      const importAnchor="const importacao=()=> <>{header('Importar extrato',()=>setTela('resumo'))}";
      if(out.includes(importAnchor)&&out.includes('abrirExcluirConciliacao')){
        const novo=importAnchor+`{imp&&<Card style={{marginBottom:12,background:'#FFF7F7',border:'1px solid #FECACA'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}><div><b style={{fontSize:13,color:'#991B1B'}}>Conciliação pendente</b><div style={{fontSize:11,color:C.ink3,marginTop:3}}>{imp.arquivo||'Arquivo importado'} • você pode excluir e começar novamente</div></div><button onClick={abrirExcluirConciliacao} aria-label="Excluir conciliação" title="Excluir conciliação" style={{width:38,height:38,display:'grid',placeItems:'center',border:'1px solid #FCA5A5',background:'#fff',color:'#B91C1C',borderRadius:10,padding:0,cursor:'pointer'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg></button></div></Card>}`;
        out=out.replace(importAnchor,novo);changed=true;
      }

      const sheetAnchor='<Sheet aberto={!!sheet}';
      if(out.includes(sheetAnchor)&&out.includes('[confirmarExclusao,setConfirmarExclusao]')&&!out.includes('Excluir conciliação definitivamente')){
        const modal=`{confirmarExclusao&&<Sheet aberto={confirmarExclusao} fechar={()=>{setConfirmarExclusao(false);setTextoExclusao('')}} titulo="Excluir conciliação"><div style={{padding:'4px 0 10px'}}><div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:14,padding:14,color:'#7F1D1D',fontSize:12,lineHeight:1.45}}>Esta ação remove toda a conciliação que ainda está pendente. Os lançamentos já enviados ao Financeiro serão mantidos.</div><div style={{fontSize:13,fontWeight:700,color:C.ink,marginTop:14,marginBottom:7}}>Se deseja excluir, digite <b>EXCLUIR AGORA</b> na caixa abaixo.</div><input value={textoExclusao} onChange={e=>setTextoExclusao(e.target.value)} autoCapitalize="characters" placeholder="EXCLUIR AGORA" style={{width:'100%',boxSizing:'border-box',padding:'13px 14px',borderRadius:12,border:textoExclusao.trim().toUpperCase()==='EXCLUIR AGORA'?'1.5px solid #DC2626':'1.5px solid #E5E7EB',fontWeight:700,color:C.ink,background:'#fff'}}/><button onClick={excluirConciliacao} disabled={textoExclusao.trim().toUpperCase()!=='EXCLUIR AGORA'} style={{width:'100%',marginTop:12,border:0,borderRadius:12,padding:'13px 14px',fontWeight:800,background:textoExclusao.trim().toUpperCase()==='EXCLUIR AGORA'?'#B91C1C':'#E5E7EB',color:textoExclusao.trim().toUpperCase()==='EXCLUIR AGORA'?'#fff':'#9CA3AF'}}>Excluir conciliação definitivamente</button></div></Sheet>}`;
        out=out.replace(sheetAnchor,modal+sheetAnchor);changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-excluir-conciliacao] nenhuma injecao aplicada.');
      return changed?{code:out,map:null}:null;
    }
  };
}
