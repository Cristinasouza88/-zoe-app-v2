export default function financeiroPatrimonioStep5V2(){
  return {
    name:'zoe-financeiro-patrimonio-step5-v2',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code;
      const ini=out.indexOf("if(passoPlano===5)return <Card");
      const fim=ini>=0?out.indexOf("if(passoPlano===6)return",ini):-1;
      if(ini<0||fim<=ini){
        console.warn('[zoe-financeiro-patrimonio-step5-v2] etapa 5 nao encontrada');
        return null;
      }
      const novo=`if(passoPlano===5)return <Card style={{marginTop:14}}><b style={{display:'block',marginBottom:6}}>5. Patrimônio e dívidas</b><div style={{fontSize:11,color:C.ink3,marginBottom:12}}>Cadastre o principal bem, consórcio, financiamento ou dívida que já faz parte do seu ponto de partida. Você poderá adicionar outros depois no Financeiro.</div><Select label="Tipo" value={planoDraft.patrimonioTipo||'Consórcio'} onChange={e=>setPlanoDraft({...planoDraft,patrimonioTipo:e.target.value})}>{['Consórcio','Financiamento','Imóvel / casa','Veículo / carro','Terreno','Empréstimo / dívida','Outro patrimônio'].map(x=><option key={x} value={x}>{x}</option>)}</Select><Campo label="O que é?" placeholder={(planoDraft.patrimonioTipo||'Consórcio')==='Veículo / carro'?'Ex.: Meu carro':(planoDraft.patrimonioTipo||'Consórcio')==='Imóvel / casa'?'Ex.: Minha casa':'Ex.: Consórcio da casa'} value={planoDraft.patrimonioNome||''} onChange={e=>setPlanoDraft({...planoDraft,patrimonioNome:e.target.value})}/><Campo label="Instituição / empresa" placeholder="Ex.: Caixa, Porto, Klubi..." value={planoDraft.patrimonioInstituicao||''} onChange={e=>setPlanoDraft({...planoDraft,patrimonioInstituicao:e.target.value})}/><Campo label="Valor atual / valor do bem" prefixoMoeda={moedaBase} type="text" inputMode="decimal" autoComplete="off" value={planoDraft.patrimonioAtual} onChange={e=>setPlanoDraft({...planoDraft,patrimonioAtual:e.target.value.replace(/[^0-9,.-]/g,'')})}/><Campo label="Saldo devedor / falta quitar" prefixoMoeda={moedaBase} type="text" inputMode="decimal" autoComplete="off" value={planoDraft.dividasAtuais} onChange={e=>setPlanoDraft({...planoDraft,dividasAtuais:e.target.value.replace(/[^0-9,.-]/g,'')})}/>{['Consórcio','Financiamento'].includes(planoDraft.patrimonioTipo||'Consórcio')&&<><Campo label="Valor da parcela" prefixoMoeda={moedaBase} type="text" inputMode="decimal" autoComplete="off" value={planoDraft.patrimonioParcela||''} onChange={e=>setPlanoDraft({...planoDraft,patrimonioParcela:e.target.value.replace(/[^0-9,.-]/g,'')})}/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><Campo label="Total de parcelas" type="text" inputMode="numeric" autoComplete="off" value={planoDraft.patrimonioParcelasTotal||''} onChange={e=>setPlanoDraft({...planoDraft,patrimonioParcelasTotal:e.target.value.replace(/[^0-9]/g,'')})}/><Campo label="Parcelas já pagas" type="text" inputMode="numeric" autoComplete="off" value={planoDraft.patrimonioParcelasPagas||''} onChange={e=>setPlanoDraft({...planoDraft,patrimonioParcelasPagas:e.target.value.replace(/[^0-9]/g,'')})}/></div></>}<div style={{fontSize:10,color:C.ink3,margin:'0 0 12px'}}>Depois da trilha, você poderá cadastrar outros bens separadamente, como outro carro, imóvel, terreno ou contrato.</div><Btn onClick={()=>salvarEtapaPlanoFinanceiro(6)} style={{width:'100%'}}>Continuar</Btn></Card>;`;
      out=out.slice(0,ini)+novo+out.slice(fim);
      return {code:out,map:null};
    }
  };
}
