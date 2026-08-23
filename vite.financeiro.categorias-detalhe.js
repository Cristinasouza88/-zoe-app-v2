export default function financeiroCategoriasDetalhe(){
  return {
    name:'zoe-financeiro-categorias-detalhe',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      const preparar=' async function preparar(file)';
      if(out.includes(preparar)&&!out.includes('const editarLancamentoCategoria=')){
        const helpers=` const editarLancamentoCategoria=(id,categoria,subcategoria)=>atualiza(f=>({...f,transacoes:(f.transacoes||[]).map(t=>t.id===id?regras({...t,categoria:categoria||t.categoria,subcategoria:subcategoria??t.subcategoria,confianca:'CONFIRMADO_MANUAL',revisar:false}):t)}));\n const excluirLancamentoCategoria=id=>{if(!window.confirm('Excluir este lançamento do Financeiro?'))return;atualiza(f=>({...f,transacoes:(f.transacoes||[]).filter(x=>x.id!==id)}));aviso('Lançamento excluído.');};\n const marcarConciliacaoLancamento=(id,status)=>atualiza(f=>({...f,transacoes:(f.transacoes||[]).map(t=>t.id===id?{...t,statusConciliacao:status,conciliadoManual:status==='conciliado'}:t)}));\n const dadosCategoriasMes=()=>[...new Set([...CATEGORIAS_DESPESA,'Outros'])].map(c=>{const itens=doMes.filter(t=>t.tipo==='saida'&&t.categoria===c&&!t.ignorarResumo);return{categoria:c,valor:itens.reduce((a,t)=>a+Number(t.impactoDespesa??t.valor??0),0),itens:itens.length}}).filter(x=>x.valor>0).sort((a,b)=>b.valor-a.valor);\n`;
        out=out.replace(preparar,helpers+preparar);changed=true;
      }

      const receitaCard='<Card style={{background:C.mint}}><small>Receita</small><h3>{formatoMoeda(receita)}</h3></Card>';
      if(out.includes(receitaCard)){
        out=out.replace(receitaCard,"<Card onClick={()=>setSheet({tipo:'lancamentos',modo:'entrada',titulo:'Receitas do mês'})} style={{background:C.mint,cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><small>Receita</small><h3>{formatoMoeda(receita)}</h3></div><ChevronRight size={18} color={C.ink3}/></div></Card>");changed=true;
      }

      const despesaCard='<Card style={{background:C.limaSuave}}><small>Despesas</small><h3>{formatoMoeda(despesa)}</h3></Card>';
      if(out.includes(despesaCard)){
        out=out.replace(despesaCard,"<Card onClick={()=>setSheet({tipo:'despesasResumo',titulo:'Despesas do mês'})} style={{background:C.limaSuave,cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><small>Despesas</small><h3>{formatoMoeda(despesa)}</h3></div><ChevronRight size={18} color={C.ink3}/></div></Card>");changed=true;
      }

      const blocoCategorias=/\{title\('Categorias do mês'\)\}<Card>\{CATEGORIAS_DESPESA\.map\(c=>\{const v=doMes\.filter\(t=>t\.categoria===c&&!t\.ignorarResumo\)\.reduce\(\(a,t\)=>a\+Number\(t\.impactoDespesa\?\?t\.valor\?\?0\),0\);return v>0\?<div key=\{c\}[\s\S]*?<\/Card>/;
      if(blocoCategorias.test(out)){
        const grafico=`{title('Despesas por categoria')}{dadosCategoriasMes().length?<Card><div style={{fontSize:10,color:C.ink3,marginBottom:10}}>Toque em uma barra para ver, corrigir ou conciliar os lançamentos.</div>{(()=>{const dados=dadosCategoriasMes(),max=Math.max(...dados.map(x=>x.valor),1);return dados.map((x,i)=><button key={x.categoria} onClick={()=>setSheet({tipo:'lancamentos',modo:'saida',categoria:x.categoria,titulo:x.categoria})} style={{width:'100%',border:0,background:'transparent',padding:'8px 0',textAlign:'left',cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}><b style={{fontSize:11}}>{x.categoria}</b><span style={{display:'flex',alignItems:'center',gap:5}}><b style={{fontSize:11}}>{formatoMoeda(x.valor)}</b><ChevronRight size={14} color={C.ink3}/></span></div><div style={{height:9,borderRadius:99,background:'#EEF0F2',overflow:'hidden'}}><div style={{height:'100%',width:Math.max(4,x.valor/max*100)+'%',borderRadius:99,background:i===0?C.roxo:i===1?C.green:'#8BB8FF'}}/></div><div style={{fontSize:9,color:C.ink3,marginTop:3}}>{despesa?Math.round(x.valor/despesa*100):0}% • {x.itens} lançamento(s)</div></button>)})()}</Card>:<Card><small>Nenhuma despesa neste mês.</small></Card>}`;
        out=out.replace(blocoCategorias,grafico);changed=true;
      }

      const titulo="sheet?.tipo==='detalheAtivo'?sheet?.ativo?.nome:''";
      if(out.includes(titulo)){out=out.replace(titulo,"sheet?.tipo==='detalheAtivo'?sheet?.ativo?.nome:(sheet?.tipo==='lancamentos'||sheet?.tipo==='despesasResumo')?sheet?.titulo:''");changed=true;}

      const ancora="</>}{sheet?.tipo==='detalheAtivo'&&<><Card>";
      if(out.includes(ancora)&&!out.includes("sheet?.tipo==='despesasResumo'&&")){
        const detalhe=`</>}{sheet?.tipo==='despesasResumo'&&<>{dadosCategoriasMes().length?(()=>{const dados=dadosCategoriasMes(),max=Math.max(...dados.map(x=>x.valor),1);return <><div style={{fontSize:11,color:C.ink3,marginBottom:10}}>Toque em uma categoria para abrir os lançamentos e fazer a conciliação.</div>{dados.map((x,i)=><button key={x.categoria} onClick={()=>setSheet({tipo:'lancamentos',modo:'saida',categoria:x.categoria,titulo:x.categoria})} style={{width:'100%',border:0,background:'#fff',padding:'12px 0',textAlign:'left',cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}><b style={{fontSize:12}}>{x.categoria}</b><span style={{display:'flex',alignItems:'center',gap:5}}><b style={{fontSize:12}}>{formatoMoeda(x.valor)}</b><ChevronRight size={14} color={C.ink3}/></span></div><div style={{height:10,borderRadius:99,background:'#EEF0F2',overflow:'hidden'}}><div style={{height:'100%',width:Math.max(4,x.valor/max*100)+'%',borderRadius:99,background:i===0?C.roxo:i===1?C.green:'#8BB8FF'}}/></div><div style={{fontSize:9,color:C.ink3,marginTop:4}}>{despesa?Math.round(x.valor/despesa*100):0}% das despesas • {x.itens} lançamento(s)</div></button>)}</>}):<div style={{padding:20,textAlign:'center',color:C.ink3}}>Nenhuma despesa neste mês.</div>}</>}{sheet?.tipo==='lancamentos'&&<>{(()=>{const itens=doMes.filter(t=>!t.ignorarResumo&&t.tipo===sheet.modo&&(!sheet.categoria||t.categoria===sheet.categoria));return <><div style={{fontSize:11,color:C.ink3,marginBottom:10}}>{itens.length} lançamento(s) • confira, corrija e concilie quando quiser.</div>{itens.map(t=><Card key={t.id} style={{marginBottom:9,border:t.statusConciliacao==='conciliado'?'1px solid #BBF7D0':undefined}}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><div style={{minWidth:0}}><b style={{fontSize:12}}>{t.descricao}</b><div style={{fontSize:10,color:C.ink3,marginTop:3}}>{fmtData(t.data)} • {t.conta}</div></div><b style={{fontSize:12,whiteSpace:'nowrap',color:t.tipo==='entrada'?'#15803D':C.ink}}>{formatoMoeda(t.tipo==='entrada'?(t.impactoReceita||t.valor):(t.impactoDespesa||t.valor))}</b></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:10}}><select value={t.categoria||'Outros'} onChange={e=>editarLancamentoCategoria(t.id,e.target.value,t.subcategoria)} style={{width:'100%',minWidth:0,padding:9,borderRadius:9,border:'1px solid '+C.line,background:'#fff'}}>{[...new Set([...(t.tipo==='entrada'?CATEGORIAS_RECEITA:CATEGORIAS_DESPESA),'Outros'])].map(x=><option key={x}>{x}</option>)}</select><input value={t.subcategoria||''} onChange={e=>editarLancamentoCategoria(t.id,t.categoria,e.target.value)} placeholder="Subcategoria" style={{width:'100%',minWidth:0,boxSizing:'border-box',padding:9,borderRadius:9,border:'1px solid '+C.line}}/></div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:9}}><button onClick={()=>marcarConciliacaoLancamento(t.id,'conciliado')} style={{border:'1px solid #BBF7D0',background:t.statusConciliacao==='conciliado'?'#DCFCE7':'#F0FDF4',color:'#166534',borderRadius:9,padding:'8px 10px',fontSize:10,fontWeight:800}}>{t.statusConciliacao==='conciliado'?'✓ Conciliado':'✓ Conciliar'}</button><button onClick={()=>excluirLancamentoCategoria(t.id)} style={{border:'1px solid #FECACA',background:'#FEF2F2',color:'#B91C1C',borderRadius:9,padding:'8px 10px',fontSize:10,fontWeight:800}}>Excluir</button></div></Card>)}{!itens.length&&<div style={{padding:20,textAlign:'center',color:C.ink3}}>Nenhum lançamento neste mês.</div>}</>})()}</>}{sheet?.tipo==='detalheAtivo'&&<><Card>`;
        out=out.replace(ancora,detalhe);changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-categorias-detalhe] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
