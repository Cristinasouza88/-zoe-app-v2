export default function financeiroCategoriasDetalhe(){
  return {
    name:'zoe-financeiro-categorias-detalhe',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      const state='[sheet,setSheet]=useState(null)';
      if(out.includes(state)&&!out.includes('[categoriaAberta,setCategoriaAberta]')){
        out=out.replace(state,state+",[categoriaAberta,setCategoriaAberta]=useState(null)");
        changed=true;
      }

      const marker=' async function preparar(file)';
      if(out.includes(marker)&&!out.includes('const editarLancamentoCategoria=')){
        const helpers=` const editarLancamentoCategoria=(id,categoria,subcategoria)=>atualiza(f=>({...f,transacoes:(f.transacoes||[]).map(t=>t.id===id?regras({...t,categoria:categoria||t.categoria,subcategoria:subcategoria??t.subcategoria,confianca:'CONFIRMADO_MANUAL',revisar:false}):t)}));\n const excluirLancamentoCategoria=id=>{const t=(fin.transacoes||[]).find(x=>x.id===id);if(!t)return;const ok=window.confirm('Excluir este lançamento do Financeiro? Esta ação remove somente esta linha.');if(!ok)return;atualiza(f=>({...f,transacoes:(f.transacoes||[]).filter(x=>x.id!==id)}));aviso('Lançamento excluído.');};\n`;
        out=out.replace(marker,helpers+marker);changed=true;
      }

      const row="<div key={c} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.line}`}}><span>{c}</span><b>{formatoMoeda(v)}</b></div>";
      if(out.includes(row)&&out.includes('[categoriaAberta,setCategoriaAberta]')){
        const next="<button key={c} onClick={()=>setCategoriaAberta(c)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',border:0,borderBottom:'1px solid '+C.line,background:'transparent',color:C.ink,textAlign:'left',cursor:'pointer'}}><span><span style={{fontSize:14}}>{c}</span><span style={{display:'block',fontSize:10,color:C.ink3,marginTop:2}}>{doMes.filter(t=>t.categoria===c&&!t.ignorarResumo).length} lançamento(s) • toque para detalhar</span></span><span style={{display:'flex',alignItems:'center',gap:8}}><b style={{fontSize:14}}>{formatoMoeda(v)}</b><ChevronRight size={17} color={C.ink3}/></span></button>";
        out=out.replace(row,next);changed=true;
      }

      const returnMarker="return <div style={{padding:'18px 16px 96px',maxWidth:560,margin:'0 auto'}}>{body}<Sheet";
      if(out.includes(returnMarker)&&out.includes('const editarLancamentoCategoria=')&&!out.includes('data-zoe-categoria-detalhe')){
        const modal=`return <div style={{padding:'18px 16px 96px',maxWidth:560,margin:'0 auto'}}>{body}{categoriaAberta&&<Sheet aberto={!!categoriaAberta} fechar={()=>setCategoriaAberta(null)} titulo={categoriaAberta}><div data-zoe-categoria-detalhe="true"><div style={{fontSize:11,color:C.ink3,marginBottom:12}}>Confira cada lançamento desta categoria. Você pode corrigir a categoria, detalhar a subcategoria ou excluir uma linha.</div>{doMes.filter(t=>t.categoria===categoriaAberta&&!t.ignorarResumo).length===0?<div style={{padding:18,textAlign:'center',color:C.ink3}}>Nenhum lançamento nesta categoria.</div>:doMes.filter(t=>t.categoria===categoriaAberta&&!t.ignorarResumo).map(t=><Card key={t.id} style={{marginBottom:9}}><div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-start'}}><div style={{minWidth:0,flex:1}}><b style={{fontSize:12,display:'block',overflow:'hidden',textOverflow:'ellipsis'}}>{t.descricao}</b><div style={{fontSize:10,color:C.ink3,marginTop:3}}>{fmtData(t.data)} • {t.conta}</div><div style={{fontSize:9,color:C.ink3,marginTop:2}}>{t.natureza||'DESPESA'}</div></div><b style={{whiteSpace:'nowrap',fontSize:13}}>{formatoMoeda(t.valor)}</b></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:10}}><select value={t.categoria||'Outros'} onChange={e=>editarLancamentoCategoria(t.id,e.target.value,t.subcategoria)} style={{minWidth:0,width:'100%',padding:'9px 7px',borderRadius:9,border:'1px solid '+C.line,background:'#fff',color:C.ink}}>{[...new Set([...(t.tipo==='entrada'?CATEGORIAS_RECEITA:CATEGORIAS_DESPESA),'Outros'])].map(x=><option key={x} value={x}>{x}</option>)}</select><input value={t.subcategoria||''} onChange={e=>editarLancamentoCategoria(t.id,t.categoria,e.target.value)} placeholder="Subcategoria" style={{minWidth:0,width:'100%',boxSizing:'border-box',padding:'9px 7px',borderRadius:9,border:'1px solid '+C.line,color:C.ink}}/></div><div style={{display:'flex',justifyContent:'flex-end',marginTop:9}}><button onClick={()=>excluirLancamentoCategoria(t.id)} style={{display:'inline-flex',alignItems:'center',gap:5,border:'1px solid #FECACA',background:'#FEF2F2',color:'#B91C1C',borderRadius:9,padding:'7px 9px',fontSize:10,fontWeight:800}}><span aria-hidden="true">🗑</span> Excluir</button></div></Card>)}</div></Sheet>}<Sheet`;
        out=out.replace(returnMarker,modal);changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-categorias-detalhe] nenhum ponto de injecao encontrado; build mantido.');
      return changed?{code:out,map:null}:null;
    }
  };
}
