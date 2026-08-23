export default function financeiroReceitas(){
  return {
    name:'zoe-financeiro-receitas-conciliacao',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      const marker="<Barra v={mesImp.itens.length-pend.length} max={mesImp.itens.length} cor={C.roxo}/>";
      // O fluxo novo envia receitas reconhecidas automaticamente para o Financeiro.
      // Se a UI antiga de conciliação não tiver mais este ponto, apenas pulamos a injeção.
      if(!code.includes(marker)) return null;
      const bloco=`${marker}{mesImp.itens.some(t=>t.tipo==='entrada'&&!t.duplicado)&&<Card style={{marginTop:10,background:'#F0FDF4',border:'1px solid #BBF7D0'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}><div><b style={{color:'#166534'}}>Receitas identificadas</b><div style={{fontSize:11,color:C.ink3,marginTop:2}}>Entradas reconhecidas neste mês também fazem parte da conciliação.</div></div><b style={{color:'#166534'}}>{formatoMoeda(mesImp.itens.filter(t=>t.tipo==='entrada'&&!t.duplicado&&!t.ignorarResumo).reduce((a,t)=>a+Number(t.impactoReceita??t.valor??0),0))}</b></div>{mesImp.itens.filter(t=>t.tipo==='entrada'&&!t.duplicado).map(t=><div key={t.id} style={{display:'flex',justifyContent:'space-between',gap:8,padding:'8px 0',borderTop:'1px solid #DCFCE7'}}><div><b style={{fontSize:12.5,color:C.ink}}>{t.descricao}</b><div style={{fontSize:10,color:C.ink3,marginTop:2}}>{fmtData(t.data)} • {t.conta} • {t.categoria||'Receita'}</div></div><b style={{fontSize:12.5,color:'#166534',whiteSpace:'nowrap'}}>+ {formatoMoeda(t.impactoReceita??t.valor??0)}</b></div>)}</Card>}`;
      return {code:code.replace(marker,bloco),map:null};
    }
  };
}
