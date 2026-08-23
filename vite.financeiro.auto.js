export default function financeiroAuto(){
  return {
    name:'zoe-financeiro-auto-classificacao',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      const stateMarker='[sheet,setSheet]=useState(null)';
      if(out.includes(stateMarker)&&!out.includes('[categoriaAberta,setCategoriaAberta]')){
        out=out.replace(stateMarker,stateMarker+",[categoriaAberta,setCategoriaAberta]=useState(null)");
        changed=true;
      }

      const beforePrepare=' async function preparar(file)';
      if(out.includes(beforePrepare)&&!out.includes('const subcategoriaAuto=')){
        const helpers=` const subcategoriaAuto=t=>{const d=norm(t?.descricao||'');const c=t?.categoria||'';const mapas={
  'Compras':[['Roupas',/zara|renner|riachuelo|cea|c&a|shein|roupa|moda|calcado|tenis|sapato/],['Casa',/tok stok|leroy|telhanorte|casa|decor|moveis|utilidades/],['Eletrônicos',/apple|samsung|eletron|magalu|fast shop|kabum/],['Marketplace',/amazon|mercado livre|shopee/],['Beleza',/sephora|boticario|natura|beauty|cosmet/],['Presentes',/presente|gift/]],
  'Alimentação':[['Delivery',/ifood|rappi|delivery/],['Restaurante',/restaurante|outback|madero|burger|pizza|sushi|grill/],['Café e Padaria',/cafe|coffee|padaria|starbucks/],['Fast-food',/mcdonald|mc donald|burger king|subway/]],
  'Educação e Carreira':[['Curso',/curso|hotmart|udemy|alura|eslen/],['Inglês',/ingles|english/],['Livros',/livro|kindle/],['Faculdade',/faculdade|universidade|espm/]],
  'Transporte':[['Aplicativos',/uber|99 /],['Combustível',/posto|combust|shell|ipiranga/],['Pedágio',/pedagio/],['Estacionamento',/estacion/],['Manutenção',/oficina|pneu|mecanica|revisao/]],
  'Saúde e Cuidados':[['Farmácia',/farmacia|drogaria|drogasil|droga raia/],['Consulta',/consulta|medic|clinica/],['Exames',/laborat|exame/]],
  'Viagens':[['Hospedagem',/hotel|airbnb|booking/],['Passagem',/latam|azul|gol linhas|passagem/],['Passeios',/tour|passeio|ingresso/]],
  'Moradia':[['Aluguel',/aluguel/],['Condomínio',/condominio/],['Energia',/enel|energia/],['Água',/sabesp|agua/],['Internet',/internet|vivo fibra|claro net/]],
  'Impostos':[['DARF',/darf/],['DAS / Simples Nacional',/das |simples nacional/],['IRPF / IRPJ',/irpf|irpj/],['INSS',/inss/],['ISS',/iss /],['IPTU',/iptu/]]
};return mapas[c]?.find(([,rx])=>rx.test(d))?.[0]||t?.subcategoria||'Outros'};
 const marcarSubcategoria=t=>({...t,subcategoria:t?.subcategoria&&t.subcategoria!=='Outros'?t.subcategoria:subcategoriaAuto(t)});
 const diasEntre=(a,b)=>{const x=new Date(String(a||'')+'T12:00:00'),y=new Date(String(b||'')+'T12:00:00');return Number.isFinite(+x)&&Number.isFinite(+y)?Math.abs((x-y)/86400000):999};
 const bancoFatura=t=>{const s=norm((t?.descricao||'')+' '+(t?.conta||''));if(/c6|banco c6/.test(s))return'C6';if(/inter|banco inter/.test(s))return'INTER';if(/nubank|nu pagamentos/.test(s))return'NUBANK';if(/itau/.test(s))return'ITAU';if(/bradesco/.test(s))return'BRADESCO';if(/santander/.test(s))return'SANTANDER';return''};
 const reconciliarFaturas=itens=>{const base=(itens||[]).map(t=>({...t}));const pagamentos=base.filter(t=>t?.natureza==='PAGAMENTO_FATURA'||t?.pagamentoFatura===true||/pagamento.*fatura|fatura.*pagamento|pagamento cartao/.test(norm(t?.descricao||'')));return base.map(t=>{if(t?.tipo!=='saida')return t;const s=norm((t?.descricao||'')+' '+(t?.conta||''));if(t?.natureza==='PAGAMENTO_FATURA'||t?.pagamentoFatura===true)return{...t,natureza:'PAGAMENTO_FATURA',categoria:'Pagamento de fatura',impactoReceita:0,impactoDespesa:0,ignorarResumo:true,revisar:false,confianca:'CONFIRMADO'};const explicita=/retirada.*fatura|transferencia.*fatura|pix.*fatura|para pagar.*fatura|pagamento.*cartao/.test(s);const banco=bancoFatura(t);const candidato=(explicita||Boolean(banco))&&/pix|transfer|ted|doc|pagamento|retirada|c6|inter|nubank|itau|bradesco|santander/.test(s);if(!candidato)return t;const match=pagamentos.find(p=>p.id!==t.id&&diasEntre(t.data,p.data)<=10&&Math.abs(Number(t.valor||0)-Number(p.valor||0))<=Math.max(10,Number(p.valor||0)*0.02)&&( !banco||!bancoFatura(p)||banco===bancoFatura(p)));if(explicita||match)return{...t,natureza:'TRANSFERENCIA_PARA_FATURA',categoria:'Pagamento de fatura',impactoReceita:0,impactoDespesa:0,ignorarResumo:true,pagamentoFatura:true,transferenciaParaFatura:true,possivelPagamentoFatura:false,revisar:false,confianca:match?'CONFIRMADO_CRUZADO':'CONFIRMADO_TEXTO'};return t});};
 const lancamentoAutoOk=t=>!t?.revisar&&!t?.duplicado&&!t?.possivelDuplicado&&!t?.possivelPagamentoFatura&&t?.categoria&&t.categoria!=='Outros';
 const gravarAutomaticos=(itens,arquivo)=>{if(!itens?.length)return;atualiza(f=>{const existentes=new Set((f.transacoes||[]).map(chave));const novas=itens.map(marcarSubcategoria).filter(t=>{const k=chave(t);if(existentes.has(k))return false;existentes.add(k);return true});if(!novas.length)return f;return{...f,transacoes:[...(f.transacoes||[]),...novas],documentos:[...(f.documentos||[]),{id:uid('doc-auto'),nome:arquivo,mes:'auto',itens:novas.length,data:hoje(),automatico:true}],importacoesConciliadas:[...(f.importacoesConciliadas||[]),{arquivo,mes:'auto',itens:novas.length,data:hoje(),automatico:true}]}})};
 const alterarLancamento=(id,categoria,subcategoria)=>atualiza(f=>({...f,transacoes:(f.transacoes||[]).map(t=>t.id===id?regras({...t,categoria:categoria||t.categoria,subcategoria:subcategoria??t.subcategoria,confianca:'CONFIRMADO_MANUAL',revisar:false}):t)}));
`;
        out=out.replace(beforePrepare,helpers+beforePrepare);changed=true;
      }

      const trecho="const meses=agrupa(itens);if(!meses.length)throw Error('Nenhum lançamento válido.');const draft={arquivo:file.name,meses,indice:0,etapa:'meses'};importacaoMemoria=draft;setImp(draft);await salvarConciliacaoPendente(draft);atualiza(f=>({...f,importacaoPendente:null}));setTela('importacao')";
      if(out.includes(trecho)&&out.includes('const lancamentoAutoOk=')){
        const novo=`itens=reconciliarFaturas(itens);const automaticos=itens.filter(lancamentoAutoOk);const pendentes=itens.filter(t=>!t.duplicado&&!lancamentoAutoOk(t));gravarAutomaticos(automaticos,file.name);const meses=agrupa(pendentes);if(!meses.length){importacaoMemoria=null;setImp(null);await limparConciliacaoPendente();setTela('resumo');aviso(automaticos.length?\`A ZOE classificou e lançou automaticamente ${'${'}automaticos.length} lançamento(s). Não ficou nenhuma pendência.\`:'Nenhum lançamento novo para conciliar.');return}const draft={arquivo:file.name,meses,indice:0,etapa:'meses',automaticos:automaticos.length};importacaoMemoria=draft;setImp(draft);await salvarConciliacaoPendente(draft);atualiza(f=>({...f,importacaoPendente:null}));setTela('importacao');aviso(automaticos.length?\`${'${'}automaticos.length} lançamento(s) já foram classificados automaticamente. Ficaram ${'${'}pendentes.length} para sua revisão.\`:'Apenas os lançamentos incertos foram enviados para conciliação.')`;
        out=out.replace(trecho,novo);changed=true;
      }

      const catRow="<div key={c} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.line}`}}><span>{c}</span><b>{formatoMoeda(v)}</b></div>";
      if(out.includes(catRow)&&out.includes('[categoriaAberta,setCategoriaAberta]')){
        out=out.replace(catRow,"<div key={c} onClick={()=>setCategoriaAberta(c)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid '+C.line,cursor:'pointer'}}><span><b style={{fontSize:13}}>{c}</b><span style={{fontSize:11,color:C.ink3,display:'block',marginTop:2}}>{doMes.filter(t=>t.categoria===c&&!t.ignorarResumo).length} lançamento(s) • toque para ver</span></span><span style={{display:'flex',alignItems:'center',gap:8}}><b>{formatoMoeda(v)}</b><ChevronRight size={16} color={C.ink3}/></span></div>");changed=true;
      }

      const returnMarker="return <div style={{padding:'18px 16px 96px',maxWidth:560,margin:'0 auto'}}>{body}<Sheet";
      if(out.includes(returnMarker)&&out.includes('const alterarLancamento=')&&out.includes('[categoriaAberta,setCategoriaAberta]')){
        const detalhe=`return <div style={{padding:'18px 16px 96px',maxWidth:560,margin:'0 auto'}}>{body}{categoriaAberta&&<Sheet aberto={!!categoriaAberta} fechar={()=>setCategoriaAberta(null)} titulo={categoriaAberta}><div style={{fontSize:12,color:C.ink3,marginBottom:10}}>Itens classificados automaticamente aparecem com ✓. Toque nos campos para corrigir categoria ou detalhar a subcategoria.</div>{doMes.filter(t=>t.categoria===categoriaAberta&&!t.ignorarResumo).map(t=><Card key={t.id} style={{marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><div style={{minWidth:0}}><b style={{fontSize:13}}>{t.descricao}</b><div style={{fontSize:10,color:C.ink3,marginTop:2}}>{fmtData(t.data)} • {t.conta}</div></div><div style={{textAlign:'right'}}><b style={{whiteSpace:'nowrap'}}>{formatoMoeda(t.valor)}</b><div style={{fontSize:11,color:'#15803D',fontWeight:800,marginTop:3}}>✓ certo</div></div></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}><select value={t.categoria||'Outros'} onChange={e=>alterarLancamento(t.id,e.target.value,t.subcategoria)} style={{width:'100%',padding:9,borderRadius:10,border:'1px solid '+C.line}}>{CATEGORIAS_DESPESA.map(x=><option key={x}>{x}</option>)}</select><input value={t.subcategoria||subcategoriaAuto(t)||''} onChange={e=>alterarLancamento(t.id,t.categoria,e.target.value)} placeholder="Subcategoria" style={{width:'100%',padding:9,borderRadius:10,border:'1px solid '+C.line,boxSizing:'border-box'}}/></div></Card>)}</Sheet>}<Sheet`;
        out=out.replace(returnMarker,detalhe);changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-auto-classificacao] nenhuma melhoria aplicável encontrada; build mantido.');
      return changed?{code:out,map:null}:null;
    }
  };
}
