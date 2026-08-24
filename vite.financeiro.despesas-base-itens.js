export default function financeiroDespesasBaseItens(){
  return {
    name:'zoe-financeiro-despesas-base-itens',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      // Persiste a lista estruturada de despesas dentro do plano financeiro.
      const draftAnchor="metaNome:fin.planoFinanceiro?.metaNome||'Reserva e patrimônio'";
      if(out.includes(draftAnchor)&&!out.includes('despesasBase:fin.planoFinanceiro?.despesasBase||[]')){
        out=out.replace(draftAnchor,"despesasBase:fin.planoFinanceiro?.despesasBase||[],"+draftAnchor);
        changed=true;
      }

      // Substitui diretamente a etapa 3 já gerada pela trilha visual.
      const ini=out.indexOf("if(passoPlano===3)return <Card");
      const fim=ini>=0?out.indexOf("if(passoPlano===4)return",ini):-1;
      if(ini>=0&&fim>ini){
        const novo=`if(passoPlano===3)return <Card style={{marginTop:14}}><b style={{display:'block',marginBottom:6}}>3. Suas despesas base</b><div style={{fontSize:11,color:C.ink3,marginBottom:12}}>Cadastre as despesas que normalmente fazem parte do seu mês. Use o + para adicionar quantas precisar.</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><Select label="Categoria" value={planoDraft.despesaBaseCategoria||'Moradia'} onChange={e=>setPlanoDraft({...planoDraft,despesaBaseCategoria:e.target.value})}>{CATEGORIAS_DESPESA.map(x=><option key={x} value={x}>{x}</option>)}</Select><Select label="Tipo" value={planoDraft.despesaBaseTipo||'Fixa'} onChange={e=>setPlanoDraft({...planoDraft,despesaBaseTipo:e.target.value})}>{['Fixa','Variável','Assinatura','Parcelada'].map(x=><option key={x} value={x}>{x}</option>)}</Select></div><div style={{display:'grid',gridTemplateColumns:'1fr 54px',gap:8,alignItems:'end'}}><Campo label="Valor" prefixoMoeda={moedaBase} type="text" inputMode="decimal" autoComplete="off" value={planoDraft.despesaBaseValor||''} onChange={e=>setPlanoDraft({...planoDraft,despesaBaseValor:e.target.value.replace(/[^0-9,.-]/g,'')})}/><button type="button" aria-label="Adicionar outra despesa" onClick={()=>{const v=valorPlano(planoDraft.despesaBaseValor);if(v<=0)return aviso('Informe o valor da despesa.');const item={id:uid('desp-base'),categoria:planoDraft.despesaBaseCategoria||'Moradia',tipo:planoDraft.despesaBaseTipo||'Fixa',valor:v},itens=[...(planoDraft.despesasBase||[]),item],total=itens.reduce((a,x)=>a+Number(x.valor||0),0);setPlanoDraft({...planoDraft,despesasBase:itens,despesaFixaReferencia:String(total),despesaBaseValor:'',despesaBaseCategoria:planoDraft.despesaBaseCategoria||'Moradia',despesaBaseTipo:planoDraft.despesaBaseTipo||'Fixa'})}} style={{height:47,marginBottom:12,border:0,borderRadius:14,background:C.petroleo,color:'#fff',fontSize:27,fontWeight:500,lineHeight:1,cursor:'pointer'}}>+</button></div>{(planoDraft.despesasBase||[]).length>0&&<div style={{display:'grid',gap:7,margin:'0 0 12px'}}>{planoDraft.despesasBase.map(x=><div key={x.id} style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',padding:'10px 11px',borderRadius:13,background:'#F8FAF9',border:'1px solid #E6E9EC',textAlign:'left'}}><div><b style={{fontSize:11.5,color:C.petroleo}}>{x.categoria}</b><div style={{fontSize:9.5,color:C.ink3,marginTop:2}}>{x.tipo}</div></div><div style={{display:'flex',alignItems:'center',gap:8}}><b style={{fontSize:12,color:C.ink}}>{formatoValor(x.valor)}</b><button type="button" aria-label="Remover despesa" onClick={()=>{const itens=(planoDraft.despesasBase||[]).filter(i=>i.id!==x.id),total=itens.reduce((a,i)=>a+Number(i.valor||0),0);setPlanoDraft({...planoDraft,despesasBase:itens,despesaFixaReferencia:String(total)})}} style={{border:0,background:'transparent',color:'#B42318',fontSize:17,padding:3}}>×</button></div></div>)}</div>}<div style={{padding:11,borderRadius:13,background:'#F0FDF4',marginBottom:12,textAlign:'left'}}><small style={{color:C.ink3}}>Total das despesas base</small><b style={{display:'block',fontSize:15,color:'#166534',marginTop:2}}>{formatoValor(valorPlano(planoDraft.despesaFixaReferencia))}</b></div><div style={{fontSize:10,color:C.ink3,margin:'-2px 0 12px'}}>Depois, os lançamentos reais vão ajustando essa referência automaticamente.</div><Btn onClick={()=>salvarEtapaPlanoFinanceiro(4)} style={{width:'100%'}}>Continuar</Btn></Card>;`;
        out=out.slice(0,ini)+novo+out.slice(fim);
        changed=true;
      } else {
        console.warn('[zoe-financeiro-despesas-base-itens] etapa 3 nao encontrada');
      }

      return changed?{code:out,map:null}:null;
    }
  };
}
