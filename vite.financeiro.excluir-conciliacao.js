export default function financeiroExcluirConciliacao(){
  return {
    name:'zoe-financeiro-excluir-conciliacao',
    enforce:'post',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code;
      const marker=' const concluirImportacao=';
      if(!out.includes(marker)) throw new Error('Excluir conciliacao: funcoes nao encontradas');
      const fn=` const excluirConciliacao=async()=>{if(!imp&&!importacaoMemoria)return;const nome=(importacaoMemoria||imp)?.arquivo||'esta importação';if(typeof window!=='undefined'&&!window.confirm(\`Excluir a conciliação pendente de ${'${'}nome}? Os lançamentos que já foram enviados ao Financeiro serão mantidos.\`))return;importacaoMemoria=null;setImp(null);try{await limparConciliacaoPendente()}catch(e){console.warn('ZOE: falha ao limpar conciliação',e)}atualiza(f=>({...f,importacaoPendente:null}));setTela('resumo');aviso('Conciliação pendente excluída. Os lançamentos já enviados foram preservados.')};\n`;
      out=out.replace(marker,fn+marker);
      const title="<h2 style={{fontSize:18,margin:'0 0 3px'}}>Conciliação inteligente</h2>";
      if(!out.includes(title)) throw new Error('Excluir conciliacao: titulo nao encontrado');
      out=out.replace(title,`<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,marginBottom:3}}><h2 style={{fontSize:18,margin:0}}>Conciliação inteligente</h2>{imp&&<button onClick={excluirConciliacao} style={{border:'1px solid #FECACA',background:'#FEF2F2',color:'#B91C1C',borderRadius:10,padding:'7px 10px',fontSize:11,fontWeight:800}}>Excluir conciliação</button>}</div>`);
      return {code:out,map:null};
    }
  };
}
