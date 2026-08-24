export default function financeiroPatrimonioItens(){
  return {
    name:'zoe-financeiro-patrimonio-itens',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      // Mantém os itens estruturados dentro do plano financeiro.
      const draftAnchor="metaNome:fin.planoFinanceiro?.metaNome||'Reserva e patrimônio'";
      if(out.includes(draftAnchor)&&!out.includes('patrimonios:fin.planoFinanceiro?.patrimonios||[]')){
        out=out.replace(draftAnchor,"patrimonios:fin.planoFinanceiro?.patrimonios||[],"+draftAnchor);
        changed=true;
      }

      // Estado temporário para cadastrar um item por vez durante a trilha.
      const moedaAnchor=" const moedaBase=planoDraft?.moeda||fin.planoFinanceiro?.moeda||'BRL';";
      if(out.includes(moedaAnchor)&&!out.includes('patrimonioDraft,setPatrimonioDraft')){
        out=out.replace(moedaAnchor,` const [patrimonioDraft,setPatrimonioDraft]=useState({tipo:'Consórcio',nome:'',instituicao:'',valorAtual:'',saldoDevedor:'',parcela:'',parcelasRestantes:''});\n${moedaAnchor}`);
        changed=true;
      }

      // Helpers para incluir/remover itens e manter os totais agregados do ponto zero.
      const prepAnchor='async function preparar(file){';
      if(out.includes(prepAnchor)&&!out.includes('adicionarPatrimonioPlano')){
        const helper=` const recalcularPatrimonioPlano=itens=>{const pa=(itens||[]).reduce((a,x)=>a+valorPlano(x.valorAtual),0),di=(itens||[]).reduce((a,x)=>a+valorPlano(x.saldoDevedor),0);return{patrimonioAtual:String(pa||''),dividasAtuais:String(di||'')}};\n const adicionarPatrimonioPlano=()=>{const nome=String(patrimonioDraft.nome||'').trim(),tipo=patrimonioDraft.tipo||'Outro';if(!nome)return aviso('Dê um nome para este patrimônio ou compromisso.');const item={id:uid('pat'),tipo,nome,instituicao:String(patrimonioDraft.instituicao||'').trim(),valorAtual:valorPlano(patrimonioDraft.valorAtual),saldoDevedor:valorPlano(patrimonioDraft.saldoDevedor),parcela:valorPlano(patrimonioDraft.parcela),parcelasRestantes:Math.max(0,Math.round(Number(String(patrimonioDraft.parcelasRestantes||'').replace(/[^0-9]/g,''))||0))};const itens=[...(planoDraft.patrimonios||[]),item],tot=recalcularPatrimonioPlano(itens);setPlanoDraft({...planoDraft,patrimonios:itens,...tot});setPatrimonioDraft({tipo:'Consórcio',nome:'',instituicao:'',valorAtual:'',saldoDevedor:'',parcela:'',parcelasRestantes:''});};\n const removerPatrimonioPlano=id=>{const itens=(planoDraft.patrimonios||[]).filter(x=>x.id!==id),tot=recalcularPatrimonioPlano(itens);setPlanoDraft({...planoDraft,patrimonios:itens,...tot})};\n `;
        out=out.replace(prepAnchor,helper+prepAnchor);
        changed=true;
      }

      // Etapa 5 passa de dois totais soltos para cadastro estruturado.
      const ini=out.indexOf("if(passoPlano===5)return <Card");
      const fim=ini>=0?out.indexOf("if(passoPlano===6)return",ini):-1;
      if(ini>=0&&fim>ini){
        const novo=`if(passoPlano===5)return <Card style={{marginTop:14}}><b style={{display:'block',marginBottom:6}}>5. Patrimônio e dívidas</b><div style={{fontSize:11,color:C.ink3,marginBottom:12}}>Cadastre cada patrimônio ou compromisso separadamente. A ZOE soma os bens e as dívidas para montar seu ponto zero.</div><Select label="Tipo" value={patrimonioDraft.tipo} onChange={e=>setPatrimonioDraft({...patrimonioDraft,tipo:e.target.value})}>{['Consórcio','Financiamento','Imóvel / casa','Veículo / carro','Terreno','Empréstimo / dívida','Outro patrimônio'].map(x=><option key={x} value={x}>{x}</option>)}</Select><Campo label="O que é?" placeholder={patrimonioDraft.tipo==='Veículo / carro'?'Ex.: Meu carro':patrimonioDraft.tipo==='Imóvel / casa'?'Ex.: Apartamento':'Ex.: Consórcio da casa'} value={patrimonioDraft.nome} onChange={e=>setPatrimonioDraft({...patrimonioDraft,nome:e.target.value})}/><Campo label="Instituição / empresa" placeholder="Ex.: Caixa, Porto, Klubi..." value={patrimonioDraft.instituicao} onChange={e=>setPatrimonioDraft({...patrimonioDraft,instituicao:e.target.value})}/><Campo label="Valor atual / já formado" prefixoMoeda={moedaBase} type="text" inputMode="decimal" autoComplete="off" value={patrimonioDraft.valorAtual} onChange={e=>setPatrimonioDraft({...patrimonioDraft,valorAtual:e.target.value.replace(/[^0-9,.-]/g,'')})}/><Campo label="Saldo devedor / falta quitar" prefixoMoeda={moedaBase} type="text" inputMode="decimal" autoComplete="off" value={patrimonioDraft.saldoDevedor} onChange={e=>setPatrimonioDraft({...patrimonioDraft,saldoDevedor:e.target.value.replace(/[^0-9,.-]/g,'')})}/>{['Consórcio','Financiamento'].includes(patrimonioDraft.tipo)&&<><Campo label="Valor da parcela" prefixoMoeda={moedaBase} type="text" inputMode="decimal" autoComplete="off" value={patrimonioDraft.parcela} onChange={e=>setPatrimonioDraft({...patrimonioDraft,parcela:e.target.value.replace(/[^0-9,.-]/g,'')})}/><Campo label="Parcelas restantes" type="text" inputMode="numeric" autoComplete="off" value={patrimonioDraft.parcelasRestantes} onChange={e=>setPatrimonioDraft({...patrimonioDraft,parcelasRestantes:e.target.value.replace(/[^0-9]/g,'')})}/></>}<Btn variante="outline" onClick={adicionarPatrimonioPlano} style={{width:'100%',marginBottom:10}}>+ Adicionar patrimônio</Btn>{(planoDraft.patrimonios||[]).length>0&&<div style={{display:'grid',gap:7,margin:'3px 0 12px'}}>{planoDraft.patrimonios.map(x=><div key={x.id} style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',padding:'10px 11px',borderRadius:13,background:'#F8FAF9',border:'1px solid #E6E9EC',textAlign:'left'}}><div><b style={{fontSize:11.5,color:C.petroleo}}>{x.nome}</b><div style={{fontSize:9.5,color:C.ink3,marginTop:2}}>{x.tipo}{x.instituicao?' • '+x.instituicao:''}</div><div style={{fontSize:9.5,color:C.ink2,marginTop:3}}>Valor: {formatoValor(x.valorAtual)}{Number(x.saldoDevedor)>0?' • dívida: '+formatoValor(x.saldoDevedor):''}</div></div><button onClick={()=>removerPatrimonioPlano(x.id)} style={{border:0,background:'transparent',color:'#B42318',fontSize:16,padding:4}}>×</button></div>)}</div>}<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}><div style={{padding:10,borderRadius:12,background:'#F0FDF4',textAlign:'left'}}><small style={{color:C.ink3}}>Patrimônio informado</small><b style={{display:'block',fontSize:13,color:'#166534',marginTop:2}}>{formatoValor(valorPlano(planoDraft.patrimonioAtual))}</b></div><div style={{padding:10,borderRadius:12,background:'#FFF7ED',textAlign:'left'}}><small style={{color:C.ink3}}>Dívidas informadas</small><b style={{display:'block',fontSize:13,color:'#9A3412',marginTop:2}}>{formatoValor(valorPlano(planoDraft.dividasAtuais))}</b></div></div><Btn onClick={()=>salvarEtapaPlanoFinanceiro(6)} style={{width:'100%'}}>Continuar</Btn></Card>;`;
        out=out.slice(0,ini)+novo+out.slice(fim);
        changed=true;
      }

      return changed?{code:out,map:null}:null;
    }
  };
}
