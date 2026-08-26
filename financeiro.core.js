import {
  VERSAO_FINANCEIRO, ESTADO_FINANCEIRO_INICIAL, cloneFinanceiroInicial,
  CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, MESES_LBL
} from './financeiro.data.js';

const norm = (v='') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const num = v => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s=String(v??'').trim().replace(/R\$/gi,'').replace(/\s/g,'');
  if(!s)return 0;
  const br=s.includes(',')?s.replace(/\./g,'').replace(',','.') : s;
  const n=Number(br.replace(/[^0-9.-]/g,''));
  return Number.isFinite(n)?n:0;
};
const pad=n=>String(n).padStart(2,'0');
export const hoje = () => new Date().toISOString().slice(0,10);
export const mesHoje = () => hoje().slice(0,7);
export const uid = p => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
export const clamp = v => Math.max(0,Math.min(100,Number(v)||0));
export const mesDa = t => String(t?.competencia||t?.data||'').slice(0,7);
export const rotuloMes = m => { const [a,b]=String(m||'').split('-').map(Number); return a&&b?`${MESES_LBL[b-1]}/${String(a).slice(-2)}`:'—'; };

export function normalizarFinanceiro(raw){
  if(!raw || raw.versao!==VERSAO_FINANCEIRO) return cloneFinanceiroInicial();
  return {
    ...cloneFinanceiroInicial(), ...raw,
    transacoes:Array.isArray(raw.transacoes)?raw.transacoes:[],
    contas:Array.isArray(raw.contas)?raw.contas:[],
    cartoes:Array.isArray(raw.cartoes)?raw.cartoes:[],
    investimentos:Array.isArray(raw.investimentos)?raw.investimentos:[],
    dividas:Array.isArray(raw.dividas)?raw.dividas:[],
    patrimonios:Array.isArray(raw.patrimonios)?raw.patrimonios:[],
    receitasRecorrentes:Array.isArray(raw.receitasRecorrentes)?raw.receitasRecorrentes:[],
    gastosFixos:Array.isArray(raw.gastosFixos)?raw.gastosFixos:[],
    objetivos:Array.isArray(raw.objetivos)?raw.objetivos:[],
    orcamentos:Array.isArray(raw.orcamentos)?raw.orcamentos:[],
    regrasClassificacao:Array.isArray(raw.regrasClassificacao)?raw.regrasClassificacao:[],
    importacoes:Array.isArray(raw.importacoes)?raw.importacoes:[],
    alocacoesSobra:Array.isArray(raw.alocacoesSobra)?raw.alocacoesSobra:[],
    configuracao:{...ESTADO_FINANCEIRO_INICIAL.configuracao,...(raw.configuracao||{})},
    gamificacao:{...ESTADO_FINANCEIRO_INICIAL.gamificacao,...(raw.gamificacao||{})}
  };
}

function categoriaAutomatica(desc,tipo){
  const d=norm(desc);
  if(tipo==='receita'){
    if(/salario pj|raio de sol/.test(d))return'Salário PJ';
    if(/pro labore/.test(d))return'Pró-labore';
    if(/salario|folha/.test(d))return'Salário';
    if(/rendimento|juros|cdb|tesouro/.test(d))return'Rendimentos';
    if(/estorno|reembolso|devolucao/.test(d))return'Reembolso';
    return'Trabalho';
  }
  const regras=[
    ['Moradia',/aluguel|condominio|iptu|energia|enel|sabesp|agua|moradia/],
    ['Mercado',/mercado|supermerc|carrefour|assai|atacadao|sams club|extra/],
    ['Alimentação',/ifood|restaurante|padaria|cafe|pizza|burger|mcdonald|outback|madero/],
    ['Transporte',/uber|99 |combust|posto|pedagio|estacion|shell|ipiranga|localiza|movida/],
    ['Saúde',/farmacia|drogaria|hospital|clinica|laborat|medic|drogasil|raia/],
    ['Fitness',/academia|gym|smart fit|wellhub|gympass/],
    ['Educação',/curso|faculdade|udemy|hotmart|alura|escola|ingles|mensalidade escolar/],
    ['Beleza e cuidados pessoais',/salao|salão|cabeleire|manicure|estetica|estética|cosmet|skincare|barbearia/],
    ['Pets',/petshop|pet shop|veterin|racao|ração/],
    ['Assinaturas',/netflix|spotify|adobe|canva|icloud|google one|assinatura/],
    ['Compras',/amazon|shopee|shein|mercado livre|magalu|renner|zara|shopping/],
    ['Viagens',/airbnb|booking|decolar|hotel|latam|gol|azul linhas/],
    ['Impostos',/imposto|simples nacional|das |taxa/],
    ['Seguros',/seguro/],
    ['Consórcio',/consorcio|consórcio|klubi|servopa/],
    ['Financiamento',/financiamento|habitacao|habitação|evolucao de obra|evolução de obra/],
    ['Lazer',/cinema|show|parque|ingresso/]
  ];
  return regras.find(([,r])=>r.test(d))?.[0]||'Outros';
}

export function classificarTransacao(base,regras=[]){
  const t={...base};
  t.id=t.id||uid('tx');
  t.valor=Math.abs(num(t.valor));
  t.tipo=t.tipo==='receita'||t.tipo==='entrada'?'receita':'despesa';
  t.data=t.data||hoje();
  t.competencia=t.competencia||t.data.slice(0,7);
  t.descricaoOriginal=String(t.descricaoOriginal||t.descricao||'Sem descrição').trim();
  t.descricaoNormalizada=norm(t.descricaoOriginal);
  t.contaId=t.contaId||'';
  t.cartaoId=t.cartaoId||'';
  t.origem=t.origem||'manual';
  t.status=t.status||'confirmado';
  t.subcategoria=t.subcategoria||'';
  t.moeda=t.moeda||'BRL';
  t.valorMoedaBase=Number(t.valorMoedaBase||t.valor);
  t.parcelaAtual=Number(t.parcelaAtual||0);
  t.totalParcelas=Number(t.totalParcelas||0);
  t.recorrente=!!t.recorrente;
  t.transferenciaInterna=!!t.transferenciaInterna;
  t.pagamentoFatura=!!t.pagamentoFatura;
  t.aporteInvestimento=!!t.aporteInvestimento;
  t.resgateInvestimento=!!t.resgateInvestimento;
  t.estorno=!!t.estorno;
  const aprendida=(regras||[]).find(r=>r.termo&&t.descricaoNormalizada.includes(norm(r.termo)));
  t.categoria=t.categoria||aprendida?.categoria||categoriaAutomatica(t.descricaoOriginal,t.tipo);
  const permitidas=t.tipo==='receita'?CATEGORIAS_RECEITA:CATEGORIAS_DESPESA;
  if(!permitidas.includes(t.categoria))t.categoria='Outros';
  t.confiancaClassificacao=Number(t.confiancaClassificacao??(t.categoria==='Outros'?.45:.78));
  t.revisadoUsuario=!!t.revisadoUsuario;
  t.revisar=t.status==='revisar'||t.categoria==='Outros'||t.confiancaClassificacao<.62;
  t.hashOrigem=t.hashOrigem||hashTransacao(t);
  return t;
}

export function hashTransacao(t){
  return [t.data||'',Number(t.valor||0).toFixed(2),norm(t.descricaoOriginal||t.descricao||''),t.contaId||'',t.cartaoId||'',t.tipo||'',t.origemArquivo||''].join('|');
}

export function deduplicarTransacoes(existentes,novas){
  const hashes=new Set((existentes||[]).map(t=>t.hashOrigem||hashTransacao(t)));
  const aceitas=[],duplicadas=[];
  for(const t of novas||[]){const h=t.hashOrigem||hashTransacao(t);if(hashes.has(h))duplicadas.push(t);else{hashes.add(h);aceitas.push({...t,hashOrigem:h})}}
  return{aceitas,duplicadas};
}

export function impactos(t){
  const v=Math.abs(Number(t?.valorMoedaBase ?? t?.valor ?? 0));
  if(t?.transferenciaInterna||t?.pagamentoFatura||t?.aporteInvestimento||t?.resgateInvestimento)return{receita:0,despesa:0};
  if(t?.estorno&&t?.tipo==='receita')return{receita:0,despesa:-v};
  return t?.tipo==='receita'?{receita:v,despesa:0}:{receita:0,despesa:v};
}

export function resumoMes(fin,mesRef){
  const itens=(fin.transacoes||[]).filter(t=>mesDa(t)===mesRef&&t.status!=='ignorado');
  let receita=0,despesa=0;
  itens.forEach(t=>{const i=impactos(t);receita+=i.receita;despesa+=i.despesa});
  despesa=Math.max(0,despesa);
  const contasLiquidas=(fin.contas||[]).filter(c=>c.ativa!==false&&c.disponibilidadeImediata);
  const saldoDisponivel=contasLiquidas.length?contasLiquidas.reduce((a,c)=>a+Number(c.valorMoedaBase ?? c.saldoAtual ?? 0),0):null;
  return{itens,receita,despesa,resultado:receita-despesa,saldoDisponivel,dataSaldo:contasLiquidas.map(c=>c.dataSaldo).filter(Boolean).sort().slice(-1)[0]||''};
}

export function categoriasMes(fin,mesRef){
  const map={};
  (fin.transacoes||[]).filter(t=>mesDa(t)===mesRef&&t.status!=='ignorado').forEach(t=>{const i=impactos(t);if(i.despesa>0)map[t.categoria||'Outros']=(map[t.categoria||'Outros']||0)+i.despesa});
  const total=Object.values(map).reduce((a,b)=>a+b,0);
  return Object.entries(map).map(([nome,valor])=>({nome,valor,pct:total?valor/total*100:0})).sort((a,b)=>b.valor-a.valor);
}

export function serieMeses(fin,mesRef,quantidade=6){
  const[y,m]=String(mesRef).split('-').map(Number);
  return Array.from({length:quantidade},(_,i)=>{const dt=new Date(y,m-1-(quantidade-1-i),1);const key=`${dt.getFullYear()}-${pad(dt.getMonth()+1)}`;const r=resumoMes(fin,key);return{mes:key,label:MESES_LBL[dt.getMonth()],receita:r.receita,despesa:r.despesa,resultado:r.resultado}});
}

export function patrimonio(fin){
  const liquidez=(fin.contas||[]).filter(c=>c.ativa!==false&&c.disponibilidadeImediata).reduce((a,c)=>a+Number(c.valorMoedaBase ?? c.saldoAtual ?? 0),0);
  const investimentos=(fin.investimentos||[]).filter(x=>x.ativo!==false).reduce((a,x)=>a+Number(x.valorMoedaBase ?? x.valorAtual ?? 0),0);
  const bens=(fin.patrimonios||[]).filter(x=>x.ativo!==false).reduce((a,x)=>a+Number(x.valorMoedaBase ?? x.valorAtual ?? 0),0);
  const dividas=(fin.dividas||[]).filter(x=>x.ativa!==false).reduce((a,x)=>a+Number(x.saldoDevedorMoedaBase ?? x.saldoDevedor ?? 0),0);
  return{liquidez,investimentos,bens,ativos:liquidez+investimentos+bens,dividas,liquido:liquidez+investimentos+bens-dividas};
}

export function resumoStartFinanceiro(fin){
  const receitas=(fin.receitasRecorrentes||[]).filter(x=>x.ativo!==false).reduce((a,x)=>a+Number(x.valorMoedaBase ?? x.valorMensal ?? 0),0);
  const gastosFixos=(fin.gastosFixos||[]).filter(x=>x.ativo!==false).reduce((a,x)=>a+Number(x.valorMoedaBase ?? x.valorMensal ?? 0),0);
  const parcelasDividas=(fin.dividas||[]).filter(x=>x.ativa!==false).reduce((a,x)=>a+Number(x.valorParcelaMoedaBase ?? x.valorParcela ?? 0),0);
  const amortizacao=(fin.dividas||[]).filter(x=>x.ativa!==false).reduce((a,x)=>a+Number(x.amortizacaoMensal||0),0);
  const encargosNaoAmortizam=(fin.dividas||[]).filter(x=>x.ativa!==false).reduce((a,x)=>a+Number(x.jurosMensal||0)+Number(x.evolucaoObraMensal||0)+Number(x.seguroMensal||0)+Number(x.taxasMensais||0)+Number(x.outrosNaoAmortizamMensal||0),0);
  const p=patrimonio(fin);
  return{
    rendaMensal:receitas,
    custoFixoSemDividas:gastosFixos,
    parcelasDividas,
    custoFixoTotal:gastosFixos+parcelasDividas,
    capacidadeMensal:receitas-gastosFixos-parcelasDividas,
    patrimonioBruto:p.ativos,
    dividas:p.dividas,
    patrimonioLiquido:p.liquido,
    amortizacaoMensal:amortizacao,
    pagamentosNaoAmortizantes:encargosNaoAmortizam,
    moedaBase:fin.configuracao?.moedaBase||'BRL'
  };
}

export function progressoObjetivo(obj,fin){
  const vinculado=(fin.investimentos||[]).filter(i=>i.objetivoId===obj.id&&i.ativo!==false).reduce((a,i)=>a+Number(i.valorAtual||0),0);
  const guardado=Number(obj.valorGuardado||0)+vinculado;
  const alvo=Number(obj.valorAlvo||0);
  return{guardado,alvo,faltam:Math.max(0,alvo-guardado),pct:alvo?clamp(guardado/alvo*100):0};
}

export function reservaResumo(fin){
  const p=patrimonio(fin),cfg=fin.configuracao||{},meta=Number(cfg.metaReserva||0);
  const atual=p.liquidez+(fin.investimentos||[]).filter(i=>i.tipo==='Reserva'&&i.ativo!==false).reduce((a,i)=>a+Number(i.valorAtual||0),0);
  const faltam=Math.max(0,meta-atual);
  let aporteNecessario=null;
  if(meta>0&&cfg.prazoReserva){
    const hojeD=new Date(hoje()+'T12:00:00'),fim=new Date(cfg.prazoReserva+'T12:00:00');
    const meses=Math.max(1,Math.ceil((fim-hojeD)/(86400000*30.44)));
    aporteNecessario=faltam/meses;
  }
  return{...p,meta,atual,faltam,pct:meta?clamp(atual/meta*100):0,aporteNecessario};
}

export function gastoCartao(fin,cartaoId,mesRef){
  return (fin.transacoes||[]).filter(t=>t.cartaoId===cartaoId&&mesDa(t)===mesRef&&t.status!=='ignorado').reduce((a,t)=>a+Math.max(0,impactos(t).despesa),0);
}

export function orcamentoStatus(fin,mesRef){
  const cats=categoriasMes(fin,mesRef),map=Object.fromEntries(cats.map(c=>[c.nome,c.valor]));
  return (fin.orcamentos||[]).filter(o=>o.ativo!==false).map(o=>{const gasto=o.categoria==='Total'?resumoMes(fin,mesRef).despesa:Number(map[o.categoria]||0),limite=Number(o.limite||0);return{...o,gasto,disponivel:Math.max(0,limite-gasto),pct:limite?clamp(gasto/limite*100):0}});
}

export function projecaoProximoMes(fin,mesRef){
  const recorrentes=(fin.transacoes||[]).filter(t=>t.recorrente&&t.status!=='ignorado');
  let receita=(fin.receitasRecorrentes||[]).filter(x=>x.ativo!==false).reduce((a,x)=>a+Number(x.valorMoedaBase ?? x.valorMensal ?? 0),0);
  let despesa=(fin.gastosFixos||[]).filter(x=>x.ativo!==false).reduce((a,x)=>a+Number(x.valorMoedaBase ?? x.valorMensal ?? 0),0);
  recorrentes.forEach(t=>{const i=impactos(t);receita+=i.receita;despesa+=i.despesa});
  (fin.dividas||[]).filter(d=>d.ativa!==false&&Number(d.parcelasRestantes||1)>0).forEach(d=>despesa+=Number(d.valorParcelaMoedaBase ?? d.valorParcela ?? 0));
  const parcelas=(fin.transacoes||[]).filter(t=>t.totalParcelas>t.parcelaAtual&&t.tipo==='despesa');
  parcelas.forEach(t=>despesa+=Number(t.valor||0));
  return{receita,comprometido:despesa,livre:receita-despesa,baseadoEm:recorrentes.length+(fin.receitasRecorrentes||[]).length+(fin.gastosFixos||[]).length+(fin.dividas||[]).length+parcelas.length};
}

export function gerarMissoes(fin,mesRef){
  const r=resumoMes(fin,mesRef),cats=categoriasMes(fin,mesRef),revisoes=(fin.transacoes||[]).filter(t=>t.revisar&&t.status!=='ignorado').length;
  const res=reservaResumo(fin),orc=orcamentoStatus(fin,mesRef),start=resumoStartFinanceiro(fin);
  return[
    {id:'start',titulo:'Defina seu ponto de partida',atual:fin.startFinanceiroConcluido?1:0,meta:1,xp:80,cristais:25},
    {id:'dados',titulo:'Registre ou importe suas finanças',atual:(fin.transacoes||[]).length?1:0,meta:1,xp:30,cristais:10},
    {id:'renda',titulo:'Cadastre sua renda recorrente',atual:start.rendaMensal>0?1:0,meta:1,xp:30,cristais:10},
    {id:'fixos',titulo:'Mapeie seus gastos fixos',atual:(fin.gastosFixos||[]).length?1:0,meta:1,xp:40,cristais:15},
    {id:'despesas5',titulo:'Registre 5 despesas',atual:r.itens.filter(t=>impactos(t).despesa>0).length,meta:5,xp:40,cristais:15},
    {id:'classificar',titulo:'Deixe seus gastos classificados',atual:revisoes===0&&(fin.transacoes||[]).length?1:0,meta:1,xp:50,cristais:20},
    {id:'reserva',titulo:'Defina sua meta de reserva',atual:res.meta>0?1:0,meta:1,xp:60,cristais:20},
    {id:'objetivo',titulo:'Crie um objetivo financeiro',atual:(fin.objetivos||[]).some(o=>o.status!=='arquivado')?1:0,meta:1,xp:50,cristais:15},
    {id:'orcamento',titulo:'Defina um limite de gastos',atual:(fin.orcamentos||[]).length?1:0,meta:1,xp:50,cristais:15},
    {id:'orcamento_ok',titulo:'Fique dentro do orçamento',atual:orc.length&&orc.every(o=>o.pct<=100)?1:0,meta:1,xp:80,cristais:30},
    {id:'resultado',titulo:'Feche o mês no positivo',atual:r.receita>0&&r.resultado>0?1:0,meta:1,xp:100,cristais:40},
    {id:'categorias',titulo:'Entenda seus principais gastos',atual:cats.length>=3?1:0,meta:1,xp:30,cristais:10}
  ].map(m=>({...m,concluida:Number(m.atual)>=Number(m.meta),pct:clamp(Number(m.atual)/Math.max(1,Number(m.meta))*100)}));
}

export function nivelFinanceiro(fin,mesRef){
  const concluidas=gerarMissoes(fin,mesRef).filter(m=>m.concluida).length;
  const niveis=[
    {nivel:1,nome:'Organizando',min:0},
    {nivel:2,nome:'No controle',min:3},
    {nivel:3,nome:'Construindo reserva',min:5},
    {nivel:4,nome:'Planejando o futuro',min:8},
    {nivel:5,nome:'Construindo patrimônio',min:10}
  ];
  return[...niveis].reverse().find(n=>concluidas>=n.min)||niveis[0];
}

export function registrarAtividade(fin,data=hoje()){
  const dias=Array.from(new Set([...(fin.gamificacao?.atividadeDias||[]),data])).sort();
  return{...fin,gamificacao:{...(fin.gamificacao||{}),atividadeDias:dias}};
}

export function ofensivaStatus(fin){
  const o=fin.gamificacao?.ofensiva;if(!o)return null;
  const inicio=new Date(o.inicio+'T12:00:00'),diasAtivos=new Set(fin.gamificacao?.atividadeDias||[]);
  let completos=0,quebrada=false;
  for(let i=0;i<Number(o.dias||0);i++){
    const dt=new Date(inicio);dt.setDate(dt.getDate()+i);const key=dt.toISOString().slice(0,10);
    if(dt>new Date(hoje()+'T23:59:59'))break;
    if(diasAtivos.has(key))completos++;else if(key<hoje())quebrada=true;
  }
  return{...o,completos,pct:clamp(completos/Math.max(1,Number(o.dias))*100),concluida:completos>=Number(o.dias),quebrada};
}

export function insightsFinanceiros(fin,mesRef){
  const r=resumoMes(fin,mesRef),cats=categoriasMes(fin,mesRef),serie=serieMeses(fin,mesRef,4),out=[];
  if(!r.itens.length)return[];
  if(cats[0]&&r.despesa>0)out.push(`${cats[0].nome} representa ${cats[0].pct.toFixed(0)}% das suas despesas deste mês.`);
  const atual=serie.at(-1),ant=serie.at(-2);
  if(atual&&ant&&ant.despesa>0){const v=(atual.despesa-ant.despesa)/ant.despesa*100;if(Math.abs(v)>=5)out.push(`Suas despesas ${v>0?'subiram':'caíram'} ${Math.abs(v).toFixed(0)}% em relação ao mês anterior.`)}
  if(r.receita>0)out.push(r.resultado>=0?`Seu resultado do mês está positivo em ${Math.round(r.resultado/r.receita*100)}% da receita.`:'As despesas já superaram a receita deste mês.');
  const res=reservaResumo(fin);if(res.meta>0&&res.aporteNecessario!=null&&res.faltam>0)out.push(`Para atingir sua reserva no prazo, o aporte mensal estimado é de ${res.aporteNecessario.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}.`);
  return out.slice(0,4);
}

function splitCSV(line,delim){let q=false,s='',out=[];for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){s+='"';i++}else q=!q}else if(c===delim&&!q){out.push(s.trim());s=''}else s+=c}out.push(s.trim());return out}
function dataCSV(v){const s=String(v||'').trim();let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return`${m[1]}-${pad(m[2])}-${pad(m[3])}`;m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);if(m)return`${m[3].length===2?'20'+m[3]:m[3]}-${pad(m[2])}-${pad(m[1])}`;return''}

export function parseCSV(texto,{arquivo='arquivo.csv',contaId='',regras=[]}={}){
  const linhas=String(texto||'').replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());
  if(linhas.length<2)throw new Error('CSV vazio.');
  const delims=[';',',','\t'];
  const delim=delims.sort((a,b)=>splitCSV(linhas[0],b).length-splitCSV(linhas[0],a).length)[0];
  const idxCab=linhas.findIndex((l,i)=>i<15&&/data|date|valor|amount|debito|credito|descri|historico/i.test(norm(l)));
  if(idxCab<0)throw new Error('Não encontrei o cabeçalho do CSV.');
  const cab=splitCSV(linhas[idxCab],delim).map(norm),ix=(...q)=>cab.findIndex(x=>q.some(y=>x===y||x.includes(y)));
  const id=ix('data','date'),iv=ix('valor','amount'),ideb=ix('debito','saida','despesa'),icred=ix('credito','entrada','receita'),idesc=ix('descricao','historico','estabelecimento','lancamento'),it=ix('tipo','natureza','movimento'),icat=ix('categoria'),ico=ix('conta','banco','cartao');
  if(id<0||(iv<0&&ideb<0&&icred<0))throw new Error('O CSV precisa ter data e valor.');
  const transacoes=[];
  for(let i=idxCab+1;i<linhas.length;i++){
    const c=splitCSV(linhas[i],delim),d=dataCSV(c[id]);if(!d)continue;
    const deb=ideb>=0?Math.abs(num(c[ideb])):0,cred=icred>=0?Math.abs(num(c[icred])):0,raw=iv>=0?num(c[iv]):0;
    const tt=norm(it>=0?c[it]:'');
    let tipo=cred>0&&!deb?'receita':deb>0&&!cred?'despesa':/entrada|receita|credito|pix recebido|salario/.test(tt)?'receita':/saida|despesa|debito|compra|pagamento/.test(tt)?'despesa':raw<0?'despesa':'receita';
    const valor=Math.abs(cred||deb||raw);if(!valor)continue;
    const desc=idesc>=0&&c[idesc]?c[idesc]:'Sem descrição';
    transacoes.push(classificarTransacao({data:d,valor,tipo,descricaoOriginal:desc,categoria:icat>=0?c[icat]:'',contaId:contaId||'',contaOriginal:ico>=0?c[ico]:'',origem:'csv',origemArquivo:arquivo,status:'confirmado'},regras));
  }
  return transacoes;
}
