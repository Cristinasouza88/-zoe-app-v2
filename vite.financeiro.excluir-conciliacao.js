export default function financeiroExcluirConciliacao(){
  return {
    name:'zoe-financeiro-excluir-conciliacao',
    enforce:'post',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;

      const stateAnchor='[sheet,setSheet]=useState(null)';
      const fnAnchor=' const concluirImportacao=';
      const headerAnchor="<b>Conciliação • {mesLabel(mesImp.mes)}</b>{chip(`${pend.length} pendências`,pend.length?'#FEF3C7':'#DCFCE7',pend.length?'#92400E':'#166534')}";
      const sheetAnchor='<Sheet aberto={!!sheet}';

      // Nunca derruba o build se outra transformação mudar a estrutura.
      const faltando=[];
      if(!code.includes(stateAnchor)) faltando.push('estado');
      if(!code.includes(fnAnchor)) faltando.push('funcoes');
      if(!code.includes(headerAnchor)) faltando.push('cabecalho');
      if(!code.includes(sheetAnchor)) faltando.push('sheet');
      if(faltando.length){
        console.warn('[zoe-financeiro-excluir-conciliacao] pontos de injecao ausentes: '+faltando.join(', ')+' — plugin ignorado sem interromper o build.');
        return null;
      }

      let out=code;
      out=out.replace(stateAnchor,stateAnchor+",[confirmarExclusao,setConfirmarExclusao]=useState(false),[textoExclusao,setTextoExclusao]=useState('')");

      const fn=` const abrirExcluirConciliacao=()=>{setTextoExclusao('');setConfirmarExclusao(true)};\n const excluirConciliacao=async()=>{if(textoExclusao.trim().toUpperCase()!=='EXCLUIR AGORA')return aviso('Digite EXCLUIR AGORA para confirmar.');if(!imp&&!importacaoMemoria)return;importacaoMemoria=null;setImp(null);try{await limparConciliacaoPendente()}catch(e){console.warn('ZOE: falha ao limpar conciliação',e)}atualiza(f=>({...f,importacaoPendente:null}));setConfirmarExclusao(false);setTextoExclusao('');setTela('resumo');aviso('Conciliação pendente excluída. Os lançamentos já enviados foram preservados.')};\n`;
      out=out.replace(fnAnchor,fn+fnAnchor);

      const headerNovo=`<b>Conciliação • {mesLabel(mesImp.mes)}</b><div style={{display:'flex',alignItems:'center',gap:6}}>{chip(\`${'${'}pend.length} pendências\`,pend.length?'#FEF3C7':'#DCFCE7',pend.length?'#92400E':'#166534')}<button onClick={abrirExcluirConciliacao} style={{border:'1px solid #FECACA',background:'#FEF2F2',color:'#B91C1C',borderRadius:9,padding:'5px 8px',fontSize:10,fontWeight:800}}>Excluir</button></div>`;
      out=out.replace(headerAnchor,headerNovo);

      const modal=`{confirmarExclusao&&<Sheet aberto={confirmarExclusao} fechar={()=>{setConfirmarExclusao(false);setTextoExclusao('')}} titulo="Excluir conciliação"><div style={{padding:'4px 0 10px'}}><div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:14,padding:14,color:'#7F1D1D',fontSize:12,lineHeight:1.45}}>Esta ação remove a conciliação que ainda está pendente. Os lançamentos já enviados ao Financeiro serão mantidos.</div><div style={{fontSize:13,fontWeight:700,color:C.ink,marginTop:14,marginBottom:7}}>Se deseja excluir, digite <b>EXCLUIR AGORA</b> na caixa abaixo.</div><input value={textoExclusao} onChange={e=>setTextoExclusao(e.target.value)} autoCapitalize="characters" placeholder="EXCLUIR AGORA" style={{width:'100%',boxSizing:'border-box',padding:'13px 14px',borderRadius:12,border:textoExclusao.trim().toUpperCase()==='EXCLUIR AGORA'?'1.5px solid #DC2626':'1.5px solid #E5E7EB',fontWeight:700,color:C.ink,background:'#fff'}}/><button onClick={excluirConciliacao} disabled={textoExclusao.trim().toUpperCase()!=='EXCLUIR AGORA'} style={{width:'100%',marginTop:12,border:0,borderRadius:12,padding:'13px 14px',fontWeight:800,background:textoExclusao.trim().toUpperCase()==='EXCLUIR AGORA'?'#B91C1C':'#E5E7EB',color:textoExclusao.trim().toUpperCase()==='EXCLUIR AGORA'?'#fff':'#9CA3AF'}}>Excluir conciliação definitivamente</button></div></Sheet>}`;
      out=out.replace(sheetAnchor,modal+sheetAnchor);

      return {code:out,map:null};
    }
  };
}
