export default function financeiroExcluirConciliacao(){
  return {
    name:'zoe-financeiro-excluir-conciliacao',
    enforce:'post',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code;
      const stateMarker=" const[tela,setTela]=useState('resumo'),[mesRef,setMesRef]=useState(hoje().slice(0,7)),[sheet,setSheet]=useState(null),[categoriaAberta,setCategoriaAberta]=useState(null)";
      if(!out.includes(stateMarker)) throw new Error('Excluir conciliacao: estado principal nao encontrado');
      out=out.replace(stateMarker," const[tela,setTela]=useState('resumo'),[mesRef,setMesRef]=useState(hoje().slice(0,7)),[sheet,setSheet]=useState(null),[categoriaAberta,setCategoriaAberta]=useState(null),[confirmarExclusao,setConfirmarExclusao]=useState(false),[textoExclusao,setTextoExclusao]=useState('')");

      const marker=' const concluirImportacao=';
      if(!out.includes(marker)) throw new Error('Excluir conciliacao: funcoes nao encontradas');
      const fn=` const abrirExcluirConciliacao=()=>{setTextoExclusao('');setConfirmarExclusao(true)};\n const excluirConciliacao=async()=>{if(textoExclusao.trim().toUpperCase()!=='EXCLUIR AGORA')return aviso('Digite EXCLUIR AGORA para confirmar.');if(!imp&&!importacaoMemoria)return;importacaoMemoria=null;setImp(null);try{await limparConciliacaoPendente()}catch(e){console.warn('ZOE: falha ao limpar conciliação',e)}atualiza(f=>({...f,importacaoPendente:null}));setConfirmarExclusao(false);setTextoExclusao('');setTela('resumo');aviso('Conciliação pendente excluída. Os lançamentos já enviados foram preservados.')};\n`;
      out=out.replace(marker,fn+marker);

      const title="<h2 style={{fontSize:18,margin:'0 0 3px'}}>Conciliação inteligente</h2>";
      if(!out.includes(title)) throw new Error('Excluir conciliacao: titulo nao encontrado');
      out=out.replace(title,`<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,marginBottom:3}}><h2 style={{fontSize:18,margin:0}}>Conciliação inteligente</h2>{imp&&<button onClick={abrirExcluirConciliacao} style={{border:'1px solid #FECACA',background:'#FEF2F2',color:'#B91C1C',borderRadius:10,padding:'7px 10px',fontSize:11,fontWeight:800}}>Excluir conciliação</button>}</div>`);

      const returnMarker="return <div style={{padding:'18px 16px 96px',maxWidth:560,margin:'0 auto'}}>{body}";
      if(!out.includes(returnMarker)) throw new Error('Excluir conciliacao: retorno principal nao encontrado');
      const modal=`return <div style={{padding:'18px 16px 96px',maxWidth:560,margin:'0 auto'}}>{body}{confirmarExclusao&&<Sheet aberto={confirmarExclusao} fechar={()=>{setConfirmarExclusao(false);setTextoExclusao('')}} titulo="Excluir conciliação"><div style={{padding:'4px 0 10px'}}><div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:14,padding:14,color:'#7F1D1D',fontSize:12,lineHeight:1.45}}>Esta ação remove a conciliação que ainda está pendente. Os lançamentos que já foram enviados ao Financeiro serão mantidos.</div><div style={{fontSize:13,fontWeight:700,color:C.ink,marginTop:14,marginBottom:7}}>Se deseja excluir, digite <b>EXCLUIR AGORA</b> na caixa abaixo.</div><input value={textoExclusao} onChange={e=>setTextoExclusao(e.target.value)} autoCapitalize="characters" placeholder="EXCLUIR AGORA" style={{width:'100%',boxSizing:'border-box',padding:'13px 14px',borderRadius:12,border:\`1.5px solid ${'${'}textoExclusao.trim().toUpperCase()==='EXCLUIR AGORA'?'#DC2626':C.line}\`,fontWeight:700,color:C.ink,background:'#fff'}}/><button onClick={excluirConciliacao} disabled={textoExclusao.trim().toUpperCase()!=='EXCLUIR AGORA'} style={{width:'100%',marginTop:12,border:0,borderRadius:12,padding:'13px 14px',fontWeight:800,background:textoExclusao.trim().toUpperCase()==='EXCLUIR AGORA'?'#B91C1C':'#E5E7EB',color:textoExclusao.trim().toUpperCase()==='EXCLUIR AGORA'?'#fff':'#9CA3AF'}}>Excluir conciliação definitivamente</button></div></Sheet>}`;
      out=out.replace(returnMarker,modal);
      return {code:out,map:null};
    }
  };
}
