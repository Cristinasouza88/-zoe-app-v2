export default function financeiroCategoriasDetalhe(){
  return {
    name:'zoe-financeiro-categorias-detalhe',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      const preparar=' async function preparar(file)';
      if(out.includes(preparar)&&!out.includes('const editarLancamentoCategoria=')){
        const helpers=` const editarLancamentoCategoria=(id,categoria,subcategoria)=>atualiza(f=>({...f,transacoes:(f.transacoes||[]).map(t=>t.id===id?regras({...t,categoria:categoria||t.categoria,subcategoria:subcategoria??t.subcategoria,confianca:'CONFIRMADO_MANUAL',revisar:false}):t)}));\n const excluirLancamentoCategoria=id=>{const ok=window.confirm('Excluir este lançamento do Financeiro? Esta ação remove somente esta linha.');if(!ok)return;atualiza(f=>({...f,transacoes:(f.transacoes||[]).filter(x=>x.id!==id)}));aviso('Lançamento excluído.');};\n const dadosCategoriasMes=()=>CATEGORIAS_DESPESA.map(c=>{const itens=doMes.filter(t=>t.categoria===c&&!t.ignorarResumo);const valor=itens.reduce((a,t)=>a+Number(t.impactoDespesa??t.valor??0),0);return{categoria:c,valor,itens:itens.length}}).filter(x=>x.valor>0).sort((a,b)=>b.valor-a.valor);\n`;
        out=out.replace(preparar,helpers+preparar);changed=true;
      }

      const categoriasTitle="{title('Categorias do mês')}<Card>";
      if(out.includes(categoriasTitle)&&out.includes('const dadosCategoriasMes=')){
        const grafico=`{title('Categorias do mês')}{dadosCategoriasMes().length>0&&<Card style={{marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:10}}><div><b style={{fontSize:13}}>Comparativo de gastos</b><div style={{fontSize:10,color:C.ink3,marginTop:2}}>Barras proporcionais ao maior gasto do mês</div></div><b style={{fontSize:11,color:C.ink2}}>{formatoMoeda(despesa)}</b></div>{(()=>{const dados=dadosCategoriasMes(),max=Math.max(...dados.map(x=>x.valor),1);return dados.map((x,i)=><button key={x.categoria} onClick={()=>setSheet({tipo:'categoriaDetalhe',categoria:x.categoria})} style={{width:'100%',border:0,background:'transparent',padding:'7px 0',textAlign:'left',cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center',marginBottom:5}}><span style={{fontSize:11,fontWeight:700,color:C.ink,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{x.categoria}</span><span style={{fontSize:11,fontWeight:800,color:C.ink,whiteSpace:'nowrap'}}>{formatoMoeda(x.valor)}</span></div><div style={{height:9,borderRadius:99,background:'#EEF0F2',overflow:'hidden'}}><div style={{height:'100%',width:Math.max(4,(x.valor/max)*100)+'%',borderRadius:99,background:i===0?C.roxo:i===1?C.green:'#8BB8FF',transition:'width .25s ease'}}/></div><div style={{fontSize:9,color:C.ink3,marginTop:3}}>{despesa>0?Math.round(x.valor/despesa*100):0}% das despesas • {x.itens} lançamento(s)</div></button>)})()}</Card>}<Card>`;
        out=out.replace(categoriasTitle,grafico);changed=true;
      }

      const row="<div key={c} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.line}`}}><span>{c}</span><b>{formatoMoeda(v)}</b></div>";
      if(out.includes(row)){
        const next="<button key={c} onClick={()=>setSheet({tipo:'categoriaDetalhe',categoria:c})} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',border:0,borderBottom:'1px solid '+C.line,background:'transparent',color:C.ink,textAlign:'left',cursor:'pointer'}}><span><span style={{fontSize:14}}>{c}</span><span style={{display:'block',fontSize:10,color:C.ink3,marginTop:2}}>{doMes.filter(t=>t.categoria===c&&!t.ignorarResumo).length} lançamento(s) • toque para ver</span></span><span style={{display:'flex',alignItems:'center',gap:8}}><b style={{fontSize:14}}>{formatoMoeda(v)}</b><ChevronRight size={17} color={C.ink3}/></span></button>";
        out=out.replace(row,next);changed=true;
      }

      const tituloAntigo="sheet?.tipo==='detalheAtivo'?sheet?.ativo?.nome:''";
      if(out.includes(tituloAntigo)){
        out=out.replace(tituloAntigo,"sheet?.tipo==='detalheAtivo'?sheet?.ativo?.nome:sheet?.tipo==='categoriaDetalhe'?sheet?.categoria:''");changed=true;
      }

      const fecharSheet='</>}{sheet?.tipo===\'detalheAtivo\'&&<><Card>';
      if(out.includes(fecharSheet)&&!out.includes("sheet?.tipo==='categoriaDetalhe'&&")){
        const detalhe=`</>}{sheet?.tipo==='categoriaDetalhe'&&<><div style={{fontSize:11,color:C.ink3,marginBottom:12}}>Veja tudo que compõe esta categoria. Você pode editar categoria, subcategoria ou excluir somente uma linha.</div>{doMes.filter(t=>t.categoria===sheet.categoria&&!t.ignorarResumo).map(t=><Card key={t.id} style={{marginBottom:9}}><div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-start'}}><div style={{minWidth:0,flex:1}}><b style={{fontSize:12,display:'block'}}>{t.descricao}</b><div style={{fontSize:10,color:C.ink3,marginTop:3}}>{fmtData(t.data)} • {t.conta}</div><div style={{fontSize:9,color:C.ink3,marginTop:2}}>{t.natureza||'DESPESA'}</div></div><b style={{whiteSpace:'nowrap',fontSize:13}}>{formatoMoeda(t.valor)}</b></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:10}}><select value={t.categoria||'Outros'} onChange={e=>editarLancamentoCategoria(t.id,e.target.value,t.subcategoria)} style={{minWidth:0,width:'100%',padding:'9px 7px',borderRadius:9,border:'1px solid '+C.line,background:'#fff',color:C.ink}}>{[...new Set([...(t.tipo==='entrada'?CATEGORIAS_RECEITA:CATEGORIAS_DESPESA),'Outros'])].map(x=><option key={x} value={x}>{x}</option>)}</select><input value={t.subcategoria||''} onChange={e=>editarLancamentoCategoria(t.id,t.categoria,e.target.value)} placeholder="Subcategoria" style={{minWidth:0,width:'100%',boxSizing:'border-box',padding:'9px 7px',borderRadius:9,border:'1px solid '+C.line,color:C.ink}}/></div><div style={{display:'flex',justifyContent:'flex-end',marginTop:9}}><button onClick={()=>excluirLancamentoCategoria(t.id)} style={{display:'inline-flex',alignItems:'center',gap:5,border:'1px solid #FECACA',background:'#FEF2F2',color:'#B91C1C',borderRadius:9,padding:'7px 9px',fontSize:10,fontWeight:800}}>🗑 Excluir</button></div></Card>)}{!doMes.some(t=>t.categoria===sheet.categoria&&!t.ignorarResumo)&&<div style={{padding:18,textAlign:'center',color:C.ink3}}>Nenhum lançamento nesta categoria.</div>}</>}{sheet?.tipo==='detalheAtivo'&&<><Card>`;
        out=out.replace(fecharSheet,detalhe);changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-categorias-detalhe] nenhum ponto de injecao encontrado');
      return changed?{code:out,map:null}:null;
    }
  };
}
