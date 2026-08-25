import React,{useMemo,useState}from'react';
import{
  WalletCards,Coins,ReceiptText,Landmark,HandCoins,Check,Plus,Trash2,LockKeyhole,X,
  TrendingUp,Building2,Sparkles
}from'lucide-react';
import{
  CATEGORIAS_DESPESA,CATEGORIAS_RECEITA,MOEDAS,TIPOS_PATRIMONIO,TIPOS_DIVIDA,
  TIPOS_CONTA,TIPOS_INVESTIMENTO,formatoMoeda
}from'./financeiro.data.js';
import{resumoStartFinanceiro,uid,hoje}from'./financeiro.core.js';
import avatarExpressoes from'./avatar-expressoes.data.js';
import'./FinanceiroStart.css';

const n=v=>{const s=String(v??'').trim().replace(/\s/g,'');if(!s)return 0;const x=s.includes(',')?s.replace(/\./g,'').replace(',','.') : s;const z=Number(x.replace(/[^0-9.-]/g,''));return Number.isFinite(z)?z:0};
const emptyDivida=()=>({nome:'',tipo:'Financiamento imobiliário',valorOriginal:'',saldoDevedor:'',valorParcela:'',parcelasRestantes:'',amortizacaoMensal:'',jurosMensal:'',evolucaoObraMensal:'',seguroMensal:'',taxasMensais:'',outrosNaoAmortizamMensal:''});

function Field({label,children}){return <label className="fxstart-field"><span>{label}</span>{children}</label>}
function Box({children}){return <div className="fxstart-box">{children}</div>}

export default function FinanceiroStart({fin,persistir,aviso=()=>{},onFinish=()=>{}}){
  const[step,setStep]=useState(0);
  const[aberto,setAberto]=useState(false);
  const[receita,setReceita]=useState({nome:'',categoria:'Salário',valorMensal:''});
  const[gasto,setGasto]=useState({nome:'',categoria:'Moradia',valorMensal:''});
  const[conta,setConta]=useState({nome:'',instituicao:'',tipo:'Conta corrente',saldoAtual:'',dataSaldo:hoje(),disponibilidadeImediata:true});
  const[investimento,setInvestimento]=useState({nome:'',instituicao:'',tipo:'Reserva',valorAtual:'',liquidez:'',dataAtualizacao:hoje()});
  const[patrimonio,setPatrimonio]=useState({nome:'',tipo:'Imóvel',valorAtual:''});
  const[divida,setDivida]=useState(emptyDivida());
  const moeda=fin.configuracao?.moedaBase||'BRL';
  const resumo=useMemo(()=>resumoStartFinanceiro(fin),[fin]);

  const etapas=[
    {id:'moeda',titulo:'Sua moeda',sub:'Base dos cálculos',Icon:WalletCards},
    {id:'renda',titulo:'Quanto entra?',sub:'Rendas recorrentes',Icon:Coins},
    {id:'fixos',titulo:'Gastos fixos',sub:'Seu custo mensal',Icon:ReceiptText},
    {id:'contas',titulo:'Contas e saldos',sub:'Liquidez disponível',Icon:Landmark},
    {id:'invest',titulo:'Reserva e aplicações',sub:'Dinheiro investido',Icon:TrendingUp},
    {id:'patrimonio',titulo:'Seu patrimônio',sub:'Bens que você possui',Icon:Building2},
    {id:'dividas',titulo:'Financiamentos',sub:'Dívidas e amortização',Icon:HandCoins},
    {id:'start',titulo:'Seu ponto de partida',sub:'Sua fotografia financeira',Icon:Sparkles}
  ];

  const concluidas=[
    !!fin.configuracao?.startMoedaConfirmada,
    (fin.receitasRecorrentes||[]).length>0,
    (fin.gastosFixos||[]).length>0,
    (fin.contas||[]).length>0,
    (fin.investimentos||[]).length>0||!!fin.configuracao?.startSemInvestimentos,
    (fin.patrimonios||[]).length>0||!!fin.configuracao?.startSemPatrimonio,
    (fin.dividas||[]).length>0||!!fin.configuracao?.startSemDividas,
    !!fin.startFinanceiroConcluido
  ];
  const pendente=concluidas.findIndex(v=>!v);
  const primeiraPendente=pendente===-1?7:pendente;
  const liberada=i=>i===0||concluidas.slice(0,i).every(Boolean);
  const feitos=concluidas.filter(Boolean).length;
  const pctGeral=feitos/etapas.length*100;
  const faseAtual=etapas[step];
  const posicoes=[68,34,25,43,67,72,51,29];
  const alturaMapa=etapas.length*116+18;

  const parcial=useMemo(()=>{
    if(concluidas[step])return 100;
    if(step===0)return fin.configuracao?.moedaBase?55:10;
    if(step===1)return [receita.nome,n(receita.valorMensal)>0].filter(Boolean).length/2*80;
    if(step===2)return [gasto.nome,n(gasto.valorMensal)>0].filter(Boolean).length/2*80;
    if(step===3)return [conta.nome,n(conta.saldoAtual)>=0].filter(Boolean).length/2*80;
    if(step===4)return [investimento.nome,n(investimento.valorAtual)>0].filter(Boolean).length/2*80;
    if(step===5)return [patrimonio.nome,n(patrimonio.valorAtual)>0].filter(Boolean).length/2*80;
    if(step===6)return [divida.nome,n(divida.saldoDevedor)>0].filter(Boolean).length/2*80;
    return liberada(7)?80:0;
  },[step,concluidas.join('|'),receita,gasto,conta,investimento,patrimonio,divida,fin.configuracao?.moedaBase]);

  const salvarMoeda=codigo=>persistir(f=>({...f,configuracao:{...f.configuracao,moedaBase:codigo}}));
  const confirmarMoeda=()=>{persistir(f=>({...f,configuracao:{...f.configuracao,startMoedaConfirmada:true}}));seguir(1)};
  const Money=({v})=><>{formatoMoeda(v,moeda)}</>;
  const remover=(campo,id)=>persistir(f=>({...f,[campo]:(f[campo]||[]).filter(x=>x.id!==id)}));
  const seguir=i=>{setStep(i);setAberto(true)};
  const proxima=()=>{const p=Math.min(7,step+1);setStep(p);setAberto(true)};

  const addReceita=()=>{const v=n(receita.valorMensal);if(!v||!receita.nome.trim())return aviso('Informe nome e valor da renda.');persistir(f=>({...f,receitasRecorrentes:[...(f.receitasRecorrentes||[]),{id:uid('renda'),nome:receita.nome.trim(),categoria:receita.categoria,valorMensal:v,valorMoedaBase:v,moeda,frequencia:'mensal',ativo:true}]}));setReceita({nome:'',categoria:'Salário',valorMensal:''})};
  const addGasto=()=>{const v=n(gasto.valorMensal);if(!v||!gasto.nome.trim())return aviso('Informe nome e valor do gasto.');persistir(f=>({...f,gastosFixos:[...(f.gastosFixos||[]),{id:uid('fixo'),nome:gasto.nome.trim(),categoria:gasto.categoria,valorMensal:v,valorMoedaBase:v,moeda,frequencia:'mensal',ativo:true}]}));setGasto({nome:'',categoria:'Moradia',valorMensal:''})};
  const addConta=()=>{if(!conta.nome.trim())return aviso('Informe o nome da conta.');const saldo=n(conta.saldoAtual);persistir(f=>({...f,contas:[...(f.contas||[]),{id:uid('conta'),nome:conta.nome.trim(),instituicao:conta.instituicao||'',tipo:conta.tipo,saldoAtual:saldo,valorMoedaBase:saldo,moeda,dataSaldo:conta.dataSaldo||hoje(),disponibilidadeImediata:conta.disponibilidadeImediata!==false,ativa:true}]}));setConta({nome:'',instituicao:'',tipo:'Conta corrente',saldoAtual:'',dataSaldo:hoje(),disponibilidadeImediata:true})};
  const addInvestimento=()=>{const v=n(investimento.valorAtual);if(!investimento.nome.trim()||!v)return aviso('Informe o investimento e o valor atual.');persistir(f=>({...f,investimentos:[...(f.investimentos||[]),{id:uid('inv'),nome:investimento.nome.trim(),instituicao:investimento.instituicao||'',tipo:investimento.tipo,valorAplicado:v,valorAtual:v,valorMoedaBase:v,moeda,liquidez:investimento.liquidez||'',dataAtualizacao:investimento.dataAtualizacao||hoje(),historico:[{data:investimento.dataAtualizacao||hoje(),valorAtual:v}],ativo:true}]}));setInvestimento({nome:'',instituicao:'',tipo:'Reserva',valorAtual:'',liquidez:'',dataAtualizacao:hoje()})};
  const addPatrimonio=()=>{const v=n(patrimonio.valorAtual);if(!v||!patrimonio.nome.trim())return aviso('Informe o patrimônio e o valor atual.');persistir(f=>({...f,patrimonios:[...(f.patrimonios||[]),{id:uid('pat'),nome:patrimonio.nome.trim(),tipo:patrimonio.tipo,valorAtual:v,valorMoedaBase:v,moeda,ativo:true}]}));setPatrimonio({nome:'',tipo:'Imóvel',valorAtual:''})};
  const addDivida=()=>{const saldo=n(divida.saldoDevedor);if(!saldo||!divida.nome.trim())return aviso('Informe o financiamento/dívida e o saldo devedor.');const parcela=n(divida.valorParcela);persistir(f=>({...f,dividas:[...(f.dividas||[]),{id:uid('div'),nome:divida.nome.trim(),tipo:divida.tipo,valorOriginal:n(divida.valorOriginal),saldoDevedor:saldo,saldoDevedorMoedaBase:saldo,valorParcela:parcela,valorParcelaMoedaBase:parcela,parcelasRestantes:Number(divida.parcelasRestantes||0),amortizacaoMensal:n(divida.amortizacaoMensal),jurosMensal:n(divida.jurosMensal),evolucaoObraMensal:n(divida.evolucaoObraMensal),seguroMensal:n(divida.seguroMensal),taxasMensais:n(divida.taxasMensais),outrosNaoAmortizamMensal:n(divida.outrosNaoAmortizamMensal),moeda,ativa:true}]}));setDivida(emptyDivida())};
  const marcarSem=campo=>{persistir(f=>({...f,configuracao:{...f.configuracao,[campo]:true}}));setTimeout(proxima,80)};
  const concluir=()=>{persistir(f=>({...f,startFinanceiroConcluido:true,onboardingConcluido:true}));onFinish()};

  const Item=({campo,item,valor,sub})=><div className="fxstart-item"><div className="fxstart-item-main"><b>{item.nome}</b><small>{sub}</small></div><div className="fxstart-item-value"><Money v={valor}/></div><button className="fxstart-remove" onClick={()=>remover(campo,item.id)}><Trash2 size={15}/></button></div>;

  const Conteudo=()=>{
    if(step===0)return <><Box><h4>Qual é sua moeda principal?</h4><div className="fxstart-note">Essa moeda vira a base do painel, patrimônio, metas e projeções. Valores em outra moeda só entram nos totais depois de convertidos.</div><Field label="Moeda-base"><select value={moeda} onChange={e=>salvarMoeda(e.target.value)}>{MOEDAS.map(m=><option value={m.codigo} key={m.codigo}>{m.simbolo} · {m.rotulo} ({m.codigo})</option>)}</select></Field><button className="fxstart-btn wide" onClick={confirmarMoeda}>CONFIRMAR E SEGUIR</button></Box></>;
    if(step===1)return <><Box><h4>Quanto entra normalmente?</h4><Field label="Nome da renda"><input value={receita.nome} onChange={e=>setReceita({...receita,nome:e.target.value})} placeholder="Ex.: salário, pró-labore, aluguel"/></Field><Field label="Categoria"><select value={receita.categoria} onChange={e=>setReceita({...receita,categoria:e.target.value})}>{CATEGORIAS_RECEITA.map(x=><option key={x}>{x}</option>)}</select></Field><Field label={`Valor mensal (${moeda})`}><input inputMode="decimal" value={receita.valorMensal} onChange={e=>setReceita({...receita,valorMensal:e.target.value})}/></Field><button className="fxstart-btn soft wide" onClick={addReceita}><Plus size={14}/> ADICIONAR RENDA</button></Box><div className="fxstart-list">{(fin.receitasRecorrentes||[]).map(x=><Item key={x.id} campo="receitasRecorrentes" item={x} valor={x.valorMensal} sub={x.categoria}/>)}</div>{concluidas[1]&&<button className="fxstart-btn wide" onClick={proxima}>CONCLUIR RENDA E SEGUIR</button>}</>;
    if(step===2)return <><Box><h4>O que sai todo mês?</h4><Field label="Nome do gasto"><input value={gasto.nome} onChange={e=>setGasto({...gasto,nome:e.target.value})} placeholder="Ex.: aluguel, escola, salão, academia"/></Field><Field label="Categoria"><select value={gasto.categoria} onChange={e=>setGasto({...gasto,categoria:e.target.value})}>{CATEGORIAS_DESPESA.filter(x=>x!=='Investimentos').map(x=><option key={x}>{x}</option>)}</select></Field><Field label={`Valor mensal (${moeda})`}><input inputMode="decimal" value={gasto.valorMensal} onChange={e=>setGasto({...gasto,valorMensal:e.target.value})}/></Field><button className="fxstart-btn soft wide" onClick={addGasto}><Plus size={14}/> ADICIONAR GASTO FIXO</button></Box><div className="fxstart-list">{(fin.gastosFixos||[]).map(x=><Item key={x.id} campo="gastosFixos" item={x} valor={x.valorMensal} sub={x.categoria}/>)}</div>{concluidas[2]&&<button className="fxstart-btn wide" onClick={proxima}>CONCLUIR GASTOS E SEGUIR</button>}</>;
    if(step===3)return <><Box><h4>Onde está seu dinheiro hoje?</h4><div className="fxstart-note">O saldo das contas de disponibilidade imediata alimenta diretamente liquidez e saldo disponível.</div><Field label="Nome da conta"><input value={conta.nome} onChange={e=>setConta({...conta,nome:e.target.value})} placeholder="Ex.: Inter pessoal"/></Field><div className="fxstart-grid2"><Field label="Instituição"><input value={conta.instituicao} onChange={e=>setConta({...conta,instituicao:e.target.value})}/></Field><Field label="Tipo"><select value={conta.tipo} onChange={e=>setConta({...conta,tipo:e.target.value})}>{TIPOS_CONTA.map(x=><option key={x}>{x}</option>)}</select></Field><Field label={`Saldo atual (${moeda})`}><input inputMode="decimal" value={conta.saldoAtual} onChange={e=>setConta({...conta,saldoAtual:e.target.value})}/></Field><Field label="Data do saldo"><input type="date" value={conta.dataSaldo} onChange={e=>setConta({...conta,dataSaldo:e.target.value})}/></Field></div><label className="fxstart-complete"><input type="checkbox" checked={conta.disponibilidadeImediata!==false} onChange={e=>setConta({...conta,disponibilidadeImediata:e.target.checked})}/> Conta com disponibilidade imediata</label><button className="fxstart-btn soft wide" onClick={addConta}><Plus size={14}/> ADICIONAR CONTA</button></Box><div className="fxstart-list">{(fin.contas||[]).map(x=><Item key={x.id} campo="contas" item={x} valor={x.saldoAtual} sub={`${x.tipo} · ${x.disponibilidadeImediata?'entra na liquidez':'fora da liquidez'}`}/>)}</div>{concluidas[3]&&<button className="fxstart-btn wide" onClick={proxima}>CONCLUIR CONTAS E SEGUIR</button>}</>;
    if(step===4)return <><Box><h4>Reserva e aplicações</h4><div className="fxstart-note">Aqui entram reserva de emergência e aplicações. Elas alimentam patrimônio, meta de investimentos e evolução da reserva.</div><Field label="Nome"><input value={investimento.nome} onChange={e=>setInvestimento({...investimento,nome:e.target.value})} placeholder="Ex.: Reserva Inter, CDB, Tesouro"/></Field><div className="fxstart-grid2"><Field label="Tipo"><select value={investimento.tipo} onChange={e=>setInvestimento({...investimento,tipo:e.target.value})}>{TIPOS_INVESTIMENTO.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Instituição"><input value={investimento.instituicao} onChange={e=>setInvestimento({...investimento,instituicao:e.target.value})}/></Field><Field label={`Valor atual (${moeda})`}><input inputMode="decimal" value={investimento.valorAtual} onChange={e=>setInvestimento({...investimento,valorAtual:e.target.value})}/></Field><Field label="Liquidez"><input value={investimento.liquidez} onChange={e=>setInvestimento({...investimento,liquidez:e.target.value})} placeholder="Diária, D+1..."/></Field></div><button className="fxstart-btn soft wide" onClick={addInvestimento}><Plus size={14}/> ADICIONAR APLICAÇÃO</button></Box><div className="fxstart-list">{(fin.investimentos||[]).map(x=><Item key={x.id} campo="investimentos" item={x} valor={x.valorAtual} sub={`${x.tipo}${x.instituicao?` · ${x.instituicao}`:''}`}/>)}</div>{concluidas[4]?<button className="fxstart-btn wide" onClick={proxima}>CONCLUIR INVESTIMENTOS E SEGUIR</button>:<button className="fxstart-skip" onClick={()=>marcarSem('startSemInvestimentos')}>Ainda não tenho investimentos</button>}</>;
    if(step===5)return <><Box><h4>O que você já construiu?</h4><div className="fxstart-note">Imóveis, veículos e outros bens entram no patrimônio bruto. Não misturamos esses valores com saldo disponível.</div><Field label="Nome do patrimônio"><input value={patrimonio.nome} onChange={e=>setPatrimonio({...patrimonio,nome:e.target.value})} placeholder="Ex.: apartamento, carro"/></Field><div className="fxstart-grid2"><Field label="Tipo"><select value={patrimonio.tipo} onChange={e=>setPatrimonio({...patrimonio,tipo:e.target.value})}>{TIPOS_PATRIMONIO.map(x=><option key={x}>{x}</option>)}</select></Field><Field label={`Valor atual estimado (${moeda})`}><input inputMode="decimal" value={patrimonio.valorAtual} onChange={e=>setPatrimonio({...patrimonio,valorAtual:e.target.value})}/></Field></div><button className="fxstart-btn soft wide" onClick={addPatrimonio}><Plus size={14}/> ADICIONAR PATRIMÔNIO</button></Box><div className="fxstart-list">{(fin.patrimonios||[]).map(x=><Item key={x.id} campo="patrimonios" item={x} valor={x.valorAtual} sub={x.tipo}/>)}</div>{concluidas[5]?<button className="fxstart-btn wide" onClick={proxima}>CONCLUIR PATRIMÔNIO E SEGUIR</button>:<button className="fxstart-skip" onClick={()=>marcarSem('startSemPatrimonio')}>Não tenho patrimônio para cadastrar</button>}</>;
    if(step===6)return <><Box><h4>Financiamentos e dívidas</h4><div className="fxstart-note">A parcela é separada da amortização. Juros, evolução de obra, seguros, taxas e outros encargos entram no custo mensal, mas não reduzem automaticamente o saldo devedor.</div><Field label="Nome"><input value={divida.nome} onChange={e=>setDivida({...divida,nome:e.target.value})} placeholder="Ex.: financiamento do apartamento"/></Field><Field label="Tipo"><select value={divida.tipo} onChange={e=>setDivida({...divida,tipo:e.target.value})}>{TIPOS_DIVIDA.map(x=><option key={x}>{x}</option>)}</select></Field><div className="fxstart-grid2"><Field label="Valor original"><input inputMode="decimal" value={divida.valorOriginal} onChange={e=>setDivida({...divida,valorOriginal:e.target.value})}/></Field><Field label="Saldo devedor"><input inputMode="decimal" value={divida.saldoDevedor} onChange={e=>setDivida({...divida,saldoDevedor:e.target.value})}/></Field><Field label="Parcela mensal"><input inputMode="decimal" value={divida.valorParcela} onChange={e=>setDivida({...divida,valorParcela:e.target.value})}/></Field><Field label="Parcelas restantes"><input type="number" value={divida.parcelasRestantes} onChange={e=>setDivida({...divida,parcelasRestantes:e.target.value})}/></Field></div><h4>Composição mensal</h4><div className="fxstart-grid2"><Field label="Amortização"><input inputMode="decimal" value={divida.amortizacaoMensal} onChange={e=>setDivida({...divida,amortizacaoMensal:e.target.value})}/></Field><Field label="Juros"><input inputMode="decimal" value={divida.jurosMensal} onChange={e=>setDivida({...divida,jurosMensal:e.target.value})}/></Field><Field label="Evolução de obra"><input inputMode="decimal" value={divida.evolucaoObraMensal} onChange={e=>setDivida({...divida,evolucaoObraMensal:e.target.value})}/></Field><Field label="Seguro"><input inputMode="decimal" value={divida.seguroMensal} onChange={e=>setDivida({...divida,seguroMensal:e.target.value})}/></Field><Field label="Taxas"><input inputMode="decimal" value={divida.taxasMensais} onChange={e=>setDivida({...divida,taxasMensais:e.target.value})}/></Field><Field label="Outros que não amortizam"><input inputMode="decimal" value={divida.outrosNaoAmortizamMensal} onChange={e=>setDivida({...divida,outrosNaoAmortizamMensal:e.target.value})}/></Field></div><button className="fxstart-btn soft wide" onClick={addDivida}><Plus size={14}/> ADICIONAR FINANCIAMENTO</button></Box><div className="fxstart-list">{(fin.dividas||[]).map(x=><Item key={x.id} campo="dividas" item={x} valor={x.saldoDevedor} sub={`${x.tipo} · parcela ${formatoMoeda(x.valorParcela||0,moeda)}`}/>)}</div>{concluidas[6]?<button className="fxstart-btn wide" onClick={proxima}>CONCLUIR FINANCIAMENTOS E SEGUIR</button>:<button className="fxstart-skip" onClick={()=>marcarSem('startSemDividas')}>Não tenho financiamentos ou dívidas</button>}</>;
    return <><div className="fxstart-note">Esta fotografia passa a alimentar painel, projeções, metas, reserva, gráficos e próximas missões.</div><div className="fxstart-summary"><Box><span>Renda mensal</span><b><Money v={resumo.rendaMensal}/></b></Box><Box><span>Custo fixo mensal</span><b><Money v={resumo.custoFixoTotal}/></b></Box><Box><span>Patrimônio bruto</span><b><Money v={resumo.patrimonioBruto}/></b></Box><Box><span>Dívidas</span><b><Money v={resumo.dividas}/></b></Box><Box><span>Patrimônio líquido</span><b><Money v={resumo.patrimonioLiquido}/></b></Box><Box><span>Capacidade mensal</span><b><Money v={resumo.capacidadeMensal}/></b></Box></div>{resumo.pagamentosNaoAmortizantes>0&&<div className="fxstart-note"><b>Pagamentos que não amortizam:</b> <Money v={resumo.pagamentosNaoAmortizantes}/> por mês. Eles impactam o caixa, mas não reduzem automaticamente a dívida.</div>}<button className="fxstart-btn wide" onClick={concluir}>USAR MEU PONTO DE PARTIDA</button></>;
  };

  const abrirEtapa=i=>{if(!liberada(i))return;if(i>primeiraPendente&&!concluidas[i])return;setStep(i);setAberto(true)};
  const pontos=etapas.map((_,i)=>`${posicoes[i]},${i*116+42}`).join(' ');

  return <div className="fxstart">
    <div className="fxstart-hero"><div><h1>Minha trilha financeira</h1><p>Uma etapa por vez. Eu sigo com você.</p></div><div className="fxstart-orb"/></div>
    <div className="fxstart-progress-card"><div className="fxstart-progress-row"><span>Progresso da jornada</span><strong>{feitos} de {etapas.length}</strong></div><div className="fxstart-progress"><i style={{width:`${pctGeral}%`}}/></div></div>
    <div className="fxstart-main">
      <div className="fxstart-phase-card"><div><small>FUNDAÇÃO</small><h2>Seu ponto de partida</h2><p>Entender sua realidade financeira antes de definir os próximos passos.</p></div><div className="fxstart-phase-count">{feitos}/{etapas.length}<span>⌃</span></div></div>
      <div className="fxstart-path" style={{height:alturaMapa}}>
        <svg viewBox={`0 0 100 ${alturaMapa}`} preserveAspectRatio="none" className="fxstart-path-svg" aria-hidden="true"><polyline points={pontos} fill="none" stroke="#DDE5E3" strokeWidth="2.2" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>{etapas.slice(0,-1).map((_,i)=>concluidas[i]&&<line key={i} x1={posicoes[i]} y1={i*116+42} x2={posicoes[i+1]} y2={(i+1)*116+42} stroke="#3ECF8E" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round"/>)}</svg>
        {[1,4,7].map((indice,j)=>indice<etapas.length&&<img key={indice} className={`fxstart-mascot mascot-${indice}`} src={avatarExpressoes[['acolher','refletir','incentivar'][j]].fun} alt="ZOE"/>)}
        {etapas.map((e,i)=>{const done=concluidas[i],active=i===primeiraPendente&&!done,locked=!liberada(i),Icon=e.Icon;const ring=done?360:active?Math.max(24,parcial)*3.6:0;return <div key={e.id} className={`fxstart-node-wrap ${locked?'locked':''}`} style={{left:`${posicoes[i]}%`,top:i*116}}><div className="fxstart-now">{active?'AGORA':''}</div><button className={`fxstart-node ${done?'done':active?'active':locked?'locked':''}`} style={{'--ring':`${ring}deg`}} onClick={()=>abrirEtapa(i)} disabled={locked}><span className="fxstart-node-ring"/><span className="fxstart-node-core">{done?<Check size={28} strokeWidth={3}/>:locked?<LockKeyhole size={22}/>:<Icon size={25}/>}</span></button><div className="fxstart-node-label"><div>{e.titulo}</div>{done&&<small>Concluído</small>}</div></div>})}
      </div>
    </div>

    {aberto&&liberada(step)&&<div className="fxstart-sheet-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setAberto(false)}><div className="fxstart-sheet"><div className="fxstart-sheet-head"><div><small>ETAPA {step+1} DE {etapas.length}</small><h3>{faseAtual.titulo}</h3></div><button className="fxstart-close" onClick={()=>setAberto(false)}><X size={18}/></button></div>{concluidas[step]&&step<7&&<div className="fxstart-complete"><Check size={16}/> Etapa concluída. Você pode revisar os dados quando quiser.</div>}{Conteudo()}{step>0&&<div className="fxstart-actions"><button className="fxstart-btn ghost" onClick={()=>seguir(step-1)}>VOLTAR</button>{concluidas[step]&&step<7&&<button className="fxstart-btn" onClick={proxima}>PRÓXIMA</button>}</div>}</div></div>}
  </div>;
}
