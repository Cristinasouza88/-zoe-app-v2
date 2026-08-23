import React, { useMemo, useRef, useState } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, FileClock, Plus, ShieldCheck,
  ChevronLeft, ChevronRight, Upload, HelpCircle, Landmark, PenLine, FileText,
  Target, Sparkles, PiggyBank, CheckCircle2, AlertTriangle, ArrowRightLeft,
  CreditCard, RotateCcw
} from 'lucide-react';
import { C, Card, Btn, Campo, Area, Barra, Sheet, hoje } from './ui.jsx';
import {
  CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, CONTAS_PADRAO, MESES_LBL,
  formatoMoeda, FINANCEIRO_REFERENCIA
} from './financeiro.data';
import { parseTransacao, classificarDescricoesCsv } from './ia.jsx';

const vazio = {
  transacoes: [], contas: CONTAS_PADRAO, metas: [], dividas: [], investimentos: [],
  pendenciasClassificacao: [], documentos: [], importacoesConciliadas: []
};

const normalizarTexto = (v='') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

const valorCsv = (v='') => {
  const s=String(v).replace(/R\$|\s/g,'');
  if(!s)return 0;
  const n=Number((s.includes(',')?s.replace(/\./g,'').replace(',','.') : s).replace(/[^0-9.-]/g,''));
  return Number.isFinite(n)?n:0;
};

const dataCsv = (v='') => {
  const s=String(v).trim();
  const br=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if(br){const a=br[3].length===2?`20${br[3]}`:br[3];return `${a}-${br[2].padStart(2,'0')}-${br[1].padStart(2,'0')}`;}
  const iso=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(iso)return `${iso[1]}-${iso[2].padStart(2,'0')}-${iso[3].padStart(2,'0')}`;
  const excel=Number(s.replace(',','.'));
  if(Number.isFinite(excel)&&excel>25000&&excel<80000){const dt=new Date(Date.UTC(1899,11,30)+excel*86400000);return dt.toISOString().slice(0,10);}
  return '';
};

const separarLinha = (linha, delim) => {
  const out=[]; let atual=''; let aspas=false;
  for(let i=0;i<linha.length;i++){
    const ch=linha[i];
    if(ch==='"'){ if(aspas&&linha[i+1]==='"'){atual+='"';i++;} else aspas=!aspas; }
    else if(ch===delim&&!aspas){out.push(atual.trim());atual='';}
    else atual+=ch;
  }
  out.push(atual.trim()); return out;
};

const chaveTransacao = (t={}) => [
  t.data||'', Number(t.valor||0).toFixed(2), t.tipo||'',
  normalizarTexto(t.conta||t.instituicao||''), normalizarTexto(t.descricao||'')
].join('|');

const categoriaLocal = (descricao, tipo) => {
  const d=normalizarTexto(descricao);
  if(tipo==='entrada'){
    if(/raio de sol marketing/.test(d)) return 'Salário PJ';
    if(/wish|intermares|reserva paulista|thermas da mata/.test(d)) return 'Receita de Trabalho';
    if(/reembolso|estorno/.test(d)) return 'Reembolso';
    if(/rendimento|juros|cdb|remuneracao/.test(d)) return 'Rendimentos';
    return 'Outros';
  }
  const regras=[
    ['Moradia',/aluguel|condominio|sabesp|enel|energia|iptu|habitacao caixa/],
    ['Mercado',/mercado|supermerc|pao de acucar|mini extra|carrefour|pirueta/],
    ['Alimentação',/ifood|restaurante|padaria|sukiya|jin jin|food to save|cafe|pizza|burger/],
    ['Transporte',/uber|99 |posto|combust|estacion|pedagio|sem parar|detran/],
    ['Saúde e Cuidados',/farmacia|drogaria|hospital|clinica|laborat|medic|odonto/],
    ['Saúde e Fitness',/academia|gym|treino|htm eslenrd/],
    ['Educação e Carreira',/espm|curso|faculdade|udemy|hotmart|livro/],
    ['Assinaturas e Serviços',/adobe|semrush|netflix|spotify|apple com|google one|assinatura|duo gourmet/],
    ['Compras',/shein|shopee|amazon|glambox|moda mundial|prego tambore/],
    ['Viagens',/decolar|hotel|airbnb|booking|azul|latam|gol linhas/],
    ['Seguros e Proteções',/seguro|infini/],
    ['Impostos e Taxas',/simples nacional|secretaria do tesouro|imposto|taxa/],
    ['Consórcio',/consorcio|klubi|servopa/],
    ['Financiamento',/financiamento|habitacao caixa/],
  ];
  return regras.find(([,r])=>r.test(d))?.[0]||'Outros';
};

const aplicarRegras = (t) => {
  const desc=normalizarTexto(t.descricao);
  const tipo=t.tipo==='entrada'?'entrada':'saida';
  let natureza='MOVIMENTO'; let categoria=t.categoria||categoriaLocal(desc,tipo);
  let ignorarResumo=false, impactoReceita=0, impactoDespesa=0, confianca='INFERIDO';

  if(/reserva por gastos rendimento|dinheiro reservado rendimento|dinheiro retirado rendimento/.test(desc)){
    natureza='TRANSFERENCIA_INTERNA'; categoria='Investimentos'; ignorarResumo=true; confianca='CONFIRMADO';
  } else if(/pagamento.*fatura|fatura.*pagamento|pagamento cartao|debito automatico.*cartao/.test(desc)){
    natureza='PAGAMENTO_FATURA'; categoria='Assinaturas e Serviços'; ignorarResumo=true; confianca='INFERIDO';
  } else if(/estorno|reembolso|devolucao/.test(desc) && tipo==='entrada'){
    natureza='ESTORNO_REEMBOLSO'; categoria='Reembolso'; impactoDespesa=-Math.abs(Number(t.valor||0)); confianca='INFERIDO';
  } else if(tipo==='entrada' && /raio de sol marketing/.test(desc)){
    natureza='RECEITA_TRABALHO'; categoria='Salário PJ'; impactoReceita=Math.abs(Number(t.valor||0)); confianca='CONFIRMADO';
  } else if(tipo==='entrada'){
    natureza='RECEITA'; impactoReceita=Math.abs(Number(t.valor||0));
  } else {
    natureza='DESPESA'; impactoDespesa=Math.abs(Number(t.valor||0));
  }

  const revisar = categoria==='Outros' || (!desc && !ignorarResumo);
  if(revisar) confianca='A_REVISAR';
  return {
    ...t, tipo, categoria, natureza, ignorarResumo, impactoReceita, impactoDespesa,
    competenciaAnalitica:(t.data||'').slice(0,7), confianca, revisar,
    subcategoria:t.subcategoria||'', contraparte:t.contraparte||''
  };
};

const transacoesDeCsv = async (file) => {
  const txt=(await file.text()).replace(/^\uFEFF/,'');
  const linhas=txt.split(/\r?\n/).filter(x=>x.trim());
  if(linhas.length<2) throw new Error('CSV vazio ou sem linhas suficientes.');
  const candidatos=[',',';','\t'];
  const amostra=linhas.slice(0,15);
  const delim=candidatos.sort((a,b)=>Math.max(...amostra.map(l=>separarLinha(l,b).length))-Math.max(...amostra.map(l=>separarLinha(l,a).length)))[0];
  const idxCab=linhas.findIndex((l,i)=>i<15&&/data|date|valor|amount|debito|credito|descri|historico/i.test(normalizarTexto(l)));
  if(idxCab<0) throw new Error('Não encontrei cabeçalho com data e valor.');
  const h=separarLinha(linhas[idxCab],delim).map(normalizarTexto);
  const ix=(...n)=>h.findIndex(x=>n.some(y=>x===y||x.includes(y)));
  const iData=ix('data','date','dt'), iDesc=ix('descricao','description','historico','estabelecimento','titulo','memo');
  const iValor=ix('valor','amount','quantia'), iDeb=ix('debito','saida','despesa'), iCred=ix('credito','entrada','receita');
  const iTipo=ix('tipo','type','natureza'), iCat=ix('categoria','category'), iConta=ix('conta','account','banco','cartao');
  if(iValor<0&&iDeb<0&&iCred<0) throw new Error('Não encontrei coluna de valor.');
  const out=linhas.slice(idxCab+1).map((linha,i)=>{
    const c=separarLinha(linha,delim); const deb=iDeb>=0?Math.abs(valorCsv(c[iDeb])):0; const cred=iCred>=0?Math.abs(valorCsv(c[iCred])):0;
    const bruto=iValor>=0?valorCsv(c[iValor]):(cred||-deb); const tp=iTipo>=0?normalizarTexto(c[iTipo]):'';
    const tipo=cred>0||bruto>0||/entrada|credito|receita/.test(tp)?'entrada':'saida'; const valor=Math.abs(bruto||deb||cred);
    if(!valor)return null;
    return {id:`imp-${Date.now()}-${i}`,tipo,valor,data:iData>=0?dataCsv(c[iData]):'',descricao:iDesc>=0?c[iDesc]||'Sem descrição':'Sem descrição',categoria:iCat>=0?c[iCat]||'Outros':'Outros',conta:iConta>=0?c[iConta]||'Conta corrente':'Conta corrente',origemDocumento:file.name,pendente:false};
  }).filter(Boolean);
  if(out.some(t=>!t.data)) throw new Error('Há datas que não foram reconhecidas. Nada foi importado.');
  return out;
};

const agruparMeses = (transacoes=[]) => Object.entries(transacoes.reduce((acc,t)=>{
  const mes=(t.data||'').slice(0,7)||'sem-mes'; (acc[mes] ||= []).push(t); return acc;
},{})).sort(([a],[b])=>a.localeCompare(b)).map(([mes,itens])=>({mes,itens}));

export default function Financeiro({ d, up, aviso }) {
  const fin={...vazio,...d.financeiro};
  const [mesRef,setMesRef]=useState(()=>hoje().slice(0,7));
  const [sheet,setSheet]=useState(null);
  const [rascunho,setRascunho]=useState({tipo:'saida',valor:'',categoria:'Outros',conta:CONTAS_PADRAO[0],data:hoje(),descricao:'',pendente:false});
  const [processando,setProcessando]=useState(false);
  const [importacao,setImportacao]=useState(null);
  const inputRef=useRef(null);

  const atualizar=fn=>up(s=>({...s,financeiro:fn({...vazio,...s.financeiro})}));
  const transacoes=useMemo(()=>{
    const seen=new Set(); return (fin.transacoes||[]).filter(t=>{const k=chaveTransacao(t);if(seen.has(k))return false;seen.add(k);return true;});
  },[fin.transacoes]);

  const doMes=useMemo(()=>transacoes.filter(t=>(t.competenciaAnalitica||(t.data||'').slice(0,7))===mesRef),[transacoes,mesRef]);
  const receita=doMes.reduce((a,t)=>a+Number(t.impactoReceita ?? (!t.ignorarResumo&&t.tipo==='entrada'?t.valor:0)),0);
  const despesaBruta=doMes.reduce((a,t)=>a+Number(t.impactoDespesa ?? (!t.ignorarResumo&&t.tipo==='saida'?t.valor:0)),0);
  const despesa=Math.max(0,despesaBruta);
  const saldo=receita-despesa;
  const contasAPagar=doMes.filter(t=>t.tipo==='saida'&&t.pendente).reduce((a,t)=>a+Number(t.valor||0),0);
  const liquidezAtual=Number(fin.liquidezAtual ?? FINANCEIRO_REFERENCIA.liquidezAtual);
  const metaLiquidez=Number(fin.metaLiquidez ?? FINANCEIRO_REFERENCIA.metaLiquidez);
  const progresso=Math.max(0,Math.min(100,Math.round(liquidezAtual/metaLiquidez*100)));

  const categorias=useMemo(()=>CATEGORIAS_DESPESA.map(c=>({categoria:c,total:doMes.filter(t=>t.categoria===c).reduce((a,t)=>a+Math.max(0,Number(t.impactoDespesa ?? (t.tipo==='saida'&&!t.ignorarResumo?t.valor:0))),0)})).filter(x=>x.total>0).sort((a,b)=>b.total-a.total),[doMes]);

  const trocarMes=dlt=>{const [a,m]=mesRef.split('-').map(Number);const x=new Date(a,m-1+dlt,1);setMesRef(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`);};

  const classificarComIA = async (lista) => {
    const alvos=[...new Set(lista.filter(t=>t.categoria==='Outros').map(t=>normalizarTexto(t.descricao)).filter(Boolean))].slice(0,200);
    if(!alvos.length)return lista;
    try{
      const r=await classificarDescricoesCsv(alvos);
      if(!r.ok||!Array.isArray(r.dados?.categorias))return lista;
      const mapa=new Map(r.dados.categorias.filter(x=>Number(x.confianca||0)>=.7).map(x=>[alvos[x.id],x.categoria]));
      return lista.map(t=>{const cat=mapa.get(normalizarTexto(t.descricao));return cat?aplicarRegras({...t,categoria:cat,confianca:'INFERIDO'}):t;});
    }catch{return lista;}
  };

  const prepararImportacao = async (file) => {
    setProcessando(true);
    try{
      let extraidas;
      const csv=/\.csv$/i.test(file.name)||/text\/csv|application\/csv|application\/vnd\.ms-excel/.test(file.type);
      if(csv) extraidas=await transacoesDeCsv(file);
      else {
        const base64=await new Promise((res,rej)=>{const rd=new FileReader();rd.onerror=rej;rd.onload=()=>res(String(rd.result).split(',')[1]);rd.readAsDataURL(file);});
        const r=await parseTransacao({imagemBase64:base64,mimeType:file.type});
        if(!r.ok||!Array.isArray(r.dados?.transacoes)) throw new Error(r.erro||'Não encontrei movimentações neste documento.');
        extraidas=r.dados.transacoes.filter(t=>Number(t.valor||0)>0).map((t,i)=>({id:`doc-${Date.now()}-${i}`,tipo:t.tipo==='entrada'?'entrada':'saida',valor:Number(t.valor),data:t.data||'',descricao:t.descricao||file.name,categoria:t.categoria||'Outros',conta:t.conta||'Conta corrente',origemDocumento:file.name,pendente:false}));
        if(extraidas.some(t=>!t.data)) throw new Error('O documento tem lançamentos sem data. Corrija ou envie um extrato mensal mais claro.');
      }
      let tratadas=extraidas.map(aplicarRegras);
      tratadas=await classificarComIA(tratadas);
      const existentes=new Set(transacoes.map(chaveTransacao)); const dentro=new Set();
      tratadas=tratadas.map(t=>{const k=chaveTransacao(t);const duplicado=existentes.has(k)||dentro.has(k);dentro.add(k);return {...t,duplicado,revisar:t.revisar&&!duplicado};});
      const meses=agruparMeses(tratadas);
      if(!meses.length) throw new Error('Nenhuma movimentação válida encontrada.');
      setImportacao({arquivo:file.name,meses,indice:0}); setSheet('conciliacao');
    }catch(e){aviso(e?.message||'Não consegui preparar a conciliação.');}
    finally{setProcessando(false);}
  };

  const selecionarArquivo=e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;if(f.size>4.5*1024*1024)return aviso('Envie um arquivo de até 4,5 MB.');prepararImportacao(f);};

  const mesAtual=importacao?.meses?.[importacao.indice];
  const pendentesMes=mesAtual?.itens?.filter(t=>t.revisar&&!t.duplicado)||[];
  const resumoConciliacao=useMemo(()=>{
    if(!mesAtual)return {validos:0,duplicados:0,internas:0,faturas:0,estornos:0};
    return {
      validos:mesAtual.itens.filter(t=>!t.duplicado).length,
      duplicados:mesAtual.itens.filter(t=>t.duplicado).length,
      internas:mesAtual.itens.filter(t=>t.natureza==='TRANSFERENCIA_INTERNA').length,
      faturas:mesAtual.itens.filter(t=>t.natureza==='PAGAMENTO_FATURA').length,
      estornos:mesAtual.itens.filter(t=>t.natureza==='ESTORNO_REEMBOLSO').length
    };
  },[mesAtual]);

  const resolver=(id,categoria,natureza) => setImportacao(old=>({...old,meses:old.meses.map((m,mi)=>mi!==old.indice?m:{...m,itens:m.itens.map(t=>t.id!==id?t:aplicarRegras({...t,categoria,natureza:natureza||t.natureza,revisar:false,confianca:'CONFIRMADO_MANUAL'}))})}));

  const confirmarMes=()=>{
    if(!mesAtual)return;
    if(pendentesMes.length)return aviso(`Resolva ${pendentesMes.length} item(ns) antes de confirmar.`);
    const novas=mesAtual.itens.filter(t=>!t.duplicado);
    atualizar(fx=>({...fx,transacoes:[...(fx.transacoes||[]),...novas],documentos:[...(fx.documentos||[]),{id:`doc-${Date.now()}`,nome:importacao.arquivo,mes:mesAtual.mes,itens:novas.length,conciliado:true,data:hoje()}],importacoesConciliadas:[...(fx.importacoesConciliadas||[]),{arquivo:importacao.arquivo,mes:mesAtual.mes,itens:novas.length,data:hoje()}]}));
    if(importacao.indice<importacao.meses.length-1){setImportacao(x=>({...x,indice:x.indice+1}));aviso(`${mesAtual.mes} conciliado. Agora revise o próximo mês.`);}
    else {setImportacao(null);setSheet(null);aviso('Importação conciliada e salva sem duplicar movimentações.');}
  };

  const salvarManual=async()=>{
    const valor=Number(String(rascunho.valor).replace(',','.')); if(!valor)return aviso('Informe um valor válido.');
    let t=aplicarRegras({id:`manual-${Date.now()}`,...rascunho,valor,origemDocumento:'Lançamento manual'});
    if(t.categoria==='Outros'&&t.descricao){const [classificada]=await classificarComIA([t]);t=classificada||t;}
    if(t.revisar){setImportacao({arquivo:'Lançamento manual',meses:[{mes:t.data.slice(0,7),itens:[t]}],indice:0});setSheet('conciliacao');return;}
    if(transacoes.some(x=>chaveTransacao(x)===chaveTransacao(t)))return aviso('Este lançamento já existe.');
    atualizar(fx=>({...fx,transacoes:[...(fx.transacoes||[]),t]}));setSheet(null);aviso('Lançamento salvo e classificado.');
  };

  return <div style={{padding:'20px 16px 110px',maxWidth:540,margin:'0 auto'}}>
    <div style={{display:'flex',alignItems:'center',gap:9}}><Wallet size={23} color={C.green}/><h1 style={{fontSize:25,color:C.ink,margin:0}}>Financeiro</h1></div>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',margin:'12px 0 18px'}}>
      <button onClick={()=>trocarMes(-1)} style={{border:0,background:'transparent',color:C.ink2}}><ChevronLeft/></button>
      <strong style={{fontSize:13,color:C.ink2}}>{MESES_LBL[Number(mesRef.slice(5,7))-1]} de {mesRef.slice(0,4)}</strong>
      <button onClick={()=>trocarMes(1)} style={{border:0,background:'transparent',color:C.ink2}}><ChevronRight/></button>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      <Card style={{background:C.mint}}><div style={{fontSize:11,color:C.ink2,fontWeight:800}}><TrendingUp size={14}/> Receita</div><strong style={{fontSize:19,color:C.ink}}>{formatoMoeda(receita)}</strong></Card>
      <Card style={{background:C.limaSuave}}><div style={{fontSize:11,color:C.ink2,fontWeight:800}}><TrendingDown size={14}/> Despesas</div><strong style={{fontSize:19,color:C.ink}}>{formatoMoeda(despesa)}</strong></Card>
      <Card><div style={{fontSize:11,color:C.ink2,fontWeight:800}}>Resultado do mês</div><strong style={{fontSize:19,color:saldo>=0?C.green:C.coral}}>{formatoMoeda(saldo)}</strong></Card>
      <Card><div style={{fontSize:11,color:C.ink2,fontWeight:800}}><FileClock size={14}/> A pagar</div><strong style={{fontSize:19,color:C.ink}}>{formatoMoeda(contasAPagar)}</strong></Card>
    </div>

    <div style={{margin:'24px 2px 10px'}}><div style={{fontSize:10,fontWeight:900,color:C.roxo,letterSpacing:1.1,textTransform:'uppercase'}}>Investimentos e reservas</div><h2 style={{fontSize:20,color:C.ink,margin:'4px 0'}}>Sua liquidez em construção</h2></div>
    <Card style={{marginBottom:12,textAlign:'center',padding:'22px 16px'}}>
      <div style={{fontSize:12,color:C.ink2}}>Meta {formatoMoeda(metaLiquidez)} até 31/12/2026</div>
      <div style={{width:220,height:220,borderRadius:'50%',margin:'18px auto 8px',background:`conic-gradient(${C.roxo} ${progresso}%, #ECECEF ${progresso}% 100%)`,padding:15,display:'grid',placeItems:'center'}}>
        <div style={{width:'100%',height:'100%',borderRadius:'50%',background:'#fff',display:'grid',placeItems:'center'}}>
          <div><PiggyBank size={72} color={C.coral}/><div style={{fontSize:10,color:C.ink3,marginTop:6}}>LIQUIDEZ ATUAL</div></div>
        </div>
      </div>
      <strong style={{display:'block',fontSize:30,color:C.ink}}>{formatoMoeda(liquidezAtual)}</strong>
      <div style={{fontSize:12,fontWeight:800,color:C.green,marginTop:4}}>{progresso}% da meta</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:16}}>
        <div style={{background:'#F6F7FF',borderRadius:16,padding:12,textAlign:'left'}}><div style={{fontSize:10,color:C.ink3}}>Reserva mensal</div><strong style={{fontSize:16,color:C.ink}}>{formatoMoeda(FINANCEIRO_REFERENCIA.reservaAutomaticaMensal)}</strong></div>
        <div style={{background:'#F6F7FF',borderRadius:16,padding:12,textAlign:'left'}}><div style={{fontSize:10,color:C.ink3}}>Reserva por gasto</div><strong style={{fontSize:16,color:C.ink}}>{formatoMoeda(FINANCEIRO_REFERENCIA.reservaPorGasto)}</strong></div>
      </div>
    </Card>

    {(fin.dividas||[]).length>0&&<><div style={{display:'flex',alignItems:'center',gap:7,margin:'18px 2px 10px',fontWeight:850,color:C.ink}}><Landmark size={18} color={C.roxo}/>Consórcios e financiamentos</div>{fin.dividas.map(x=><Card key={x.id} style={{marginBottom:9}}><strong style={{fontSize:13,color:C.ink}}>{x.nome||x.instituicao||x.tipo}</strong><div style={{display:'flex',justifyContent:'space-between',fontSize:10.5,color:C.ink3,margin:'8px 0'}}><span>Pago {formatoMoeda(x.valor_pago||0)}</span><span>Falta {formatoMoeda(x.saldo_restante||0)}</span></div><Barra v={Number(x.valor_pago||0)} max={Number(x.valor_total||0)||1} cor={C.roxo}/></Card>)}</>}

    <div style={{margin:'20px 2px 10px'}}><strong style={{color:C.ink}}>Para onde foi seu dinheiro</strong><div style={{fontSize:11,color:C.ink3}}>Somente despesas conciliadas; transferências e pagamento de fatura ficam fora.</div></div>
    <Card style={{marginBottom:16}}>{categorias.length?categorias.slice(0,8).map(x=><div key={x.categoria} style={{marginBottom:11}}><div style={{display:'flex',justifyContent:'space-between',fontSize:11.5}}><span style={{color:C.ink2}}>{x.categoria}</span><strong style={{color:C.ink}}>{formatoMoeda(x.total)}</strong></div><Barra v={x.total} max={Math.max(...categorias.map(y=>y.total),1)} cor={C.green} h={6}/></div>):<div style={{fontSize:12,color:C.ink3,textAlign:'center',padding:14}}>Nenhum gasto conciliado neste mês.</div>}</Card>

    <Card style={{background:'#F5FAF8',marginBottom:14}}><div style={{display:'flex',gap:10}}><ShieldCheck size={20} color={C.green}/><div><strong style={{fontSize:13,color:C.ink}}>Consolidação protegida</strong><div style={{fontSize:10.7,color:C.ink3,lineHeight:1.45,marginTop:3}}>A ZOE não joga o arquivo direto no dashboard. Primeiro separa por mês, remove duplicidades, neutraliza transferências e faturas e abre a conciliação para tudo que a IA não tiver certeza.</div></div></div></Card>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
      <Btn onClick={()=>setSheet('adicionar')}><Plus size={15}/> Adicionar</Btn>
      <Btn variante="outline" onClick={()=>{setSheet('documento');setTimeout(()=>inputRef.current?.click(),80)}}><Upload size={15}/> Importar mês</Btn>
    </div>

    <input ref={inputRef} type="file" accept=".csv,text/csv,application/csv,application/vnd.ms-excel,image/*,application/pdf" style={{display:'none'}} onChange={selecionarArquivo}/>

    <Sheet aberto={sheet==='adicionar'} fechar={()=>setSheet(null)} titulo="Adicionar movimentação">
      <div style={{display:'flex',gap:8,marginBottom:12}}>{[['saida','Saída'],['entrada','Entrada']].map(([v,l])=><button key={v} onClick={()=>setRascunho(r=>({...r,tipo:v,categoria:'Outros'}))} style={{flex:1,padding:10,borderRadius:12,border:`1px solid ${rascunho.tipo===v?C.green:C.line}`,background:rascunho.tipo===v?C.green:'#fff',color:rascunho.tipo===v?'#fff':C.ink}}>{l}</button>)}</div>
      <Campo label="Valor" type="number" value={rascunho.valor} onChange={e=>setRascunho(r=>({...r,valor:e.target.value}))}/>
      <Campo label="Data" type="date" value={rascunho.data} onChange={e=>setRascunho(r=>({...r,data:e.target.value}))}/>
      <Area label="Descrição" placeholder="Ex.: mercado, salário, transferência para reserva" value={rascunho.descricao} onChange={e=>setRascunho(r=>({...r,descricao:e.target.value}))}/>
      <div style={{fontSize:11,color:C.ink3,margin:'-3px 0 13px'}}>A ZOE tentará reconhecer automaticamente natureza e categoria antes de salvar.</div>
      <Btn onClick={salvarManual} style={{width:'100%'}}>Analisar e salvar</Btn>
    </Sheet>

    <Sheet aberto={sheet==='documento'} fechar={()=>setSheet(null)} titulo="Importar documento mensal">
      <div style={{textAlign:'center',padding:'4px 0 12px'}}><FileText size={36} color={C.roxo}/><h3 style={{color:C.ink,margin:'9px 0 5px'}}>Um mês de cada vez</h3><p style={{fontSize:11.5,lineHeight:1.5,color:C.ink3}}>Prefira extrato ou fatura fechada de um único mês. Se um CSV tiver vários meses, a ZOE divide internamente e obriga a conciliação mês a mês antes de consolidar.</p><Btn disabled={processando} onClick={()=>inputRef.current?.click()} style={{width:'100%'}}>{processando?'Lendo e conciliando…':'Escolher CSV, PDF ou imagem'}</Btn></div>
    </Sheet>

    <Sheet aberto={sheet==='conciliacao'&&!!mesAtual} fechar={()=>{setSheet(null);setImportacao(null)}} titulo={`Conciliação · ${mesAtual?.mes||''}`}>
      {mesAtual&&<>
        <div style={{background:'#F4F1FA',borderRadius:16,padding:13,marginBottom:12}}><div style={{fontSize:10,color:C.ink3}}>Arquivo</div><strong style={{fontSize:12,color:C.ink}}>{importacao.arquivo}</strong><div style={{fontSize:10.5,color:C.ink3,marginTop:5}}>Mês {importacao.indice+1} de {importacao.meses.length} · {resumoConciliacao.validos} válidos · {resumoConciliacao.duplicados} duplicados ignorados</div></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginBottom:12}}>
          <div style={{background:C.mint,borderRadius:12,padding:9,textAlign:'center'}}><ArrowRightLeft size={16} color={C.green}/><strong style={{display:'block',fontSize:14,color:C.ink}}>{resumoConciliacao.internas}</strong><span style={{fontSize:8.5,color:C.ink3}}>transferências</span></div>
          <div style={{background:'#F4F1FA',borderRadius:12,padding:9,textAlign:'center'}}><CreditCard size={16} color={C.roxo}/><strong style={{display:'block',fontSize:14,color:C.ink}}>{resumoConciliacao.faturas}</strong><span style={{fontSize:8.5,color:C.ink3}}>pag. fatura</span></div>
          <div style={{background:'#FFF5ED',borderRadius:12,padding:9,textAlign:'center'}}><RotateCcw size={16} color={C.coral}/><strong style={{display:'block',fontSize:14,color:C.ink}}>{resumoConciliacao.estornos}</strong><span style={{fontSize:8.5,color:C.ink3}}>estornos</span></div>
        </div>
        {pendentesMes.length>0?<><div style={{display:'flex',gap:7,alignItems:'center',margin:'8px 0 10px'}}><AlertTriangle size={17} color={C.gold}/><strong style={{fontSize:13,color:C.ink}}>A ZOE precisa da sua ajuda em {pendentesMes.length} item(ns)</strong></div>{pendentesMes.slice(0,20).map(t=><Card key={t.id} style={{marginBottom:9,background:'#FFFCF2',border:'1px solid #F0E1A5'}}><div style={{fontSize:12.5,fontWeight:800,color:C.ink}}>{t.descricao}</div><div style={{fontSize:11,color:C.ink3,margin:'3px 0 9px'}}>{formatoMoeda(t.valor)} · {t.data}</div><div style={{display:'flex',flexWrap:'wrap',gap:5}}>{(t.tipo==='entrada'?CATEGORIAS_RECEITA:CATEGORIAS_DESPESA).slice(0,10).map(cat=><button key={cat} onClick={()=>resolver(t.id,cat)} style={{border:`1px solid ${C.line}`,background:'#fff',borderRadius:14,padding:'6px 8px',fontSize:9.5,color:C.ink}}>{cat}</button>)}<button onClick={()=>resolver(t.id,'Outros')} style={{border:`1px solid ${C.roxo}`,background:'#fff',borderRadius:14,padding:'6px 8px',fontSize:9.5,color:C.roxo}}>Manter como Outros</button></div></Card>)}</>:<div style={{display:'flex',gap:8,alignItems:'center',padding:13,background:'#EEF9F4',borderRadius:14,marginBottom:12}}><CheckCircle2 size={19} color={C.green}/><div style={{fontSize:11.5,color:C.ink2}}>Mês pronto para consolidar. Nenhuma pendência de classificação.</div></div>}
        <Btn onClick={confirmarMes} disabled={pendentesMes.length>0} style={{width:'100%'}}>{importacao.indice<importacao.meses.length-1?'Confirmar mês e revisar próximo':'Confirmar e finalizar importação'}</Btn>
        <div style={{fontSize:9.8,color:C.ink3,lineHeight:1.45,marginTop:9,textAlign:'center'}}>Nada entra no dashboard antes desta confirmação. A chave de data + valor + conta + descrição impede reimportação duplicada.</div>
      </>}
    </Sheet>
  </div>;
}
