from pathlib import Path
import re

# --- FinanceiroStart: o onboarding passa a ser somente o diagnóstico (7 etapas) ---
p = Path('FinanceiroStart.jsx')
s = p.read_text()

old = "export default function FinanceiroStart({fin,persistir,aviso=()=>{},ui,setUi,onFinish=()=>{}}){"
new = "export default function FinanceiroStart({fin,persistir,aviso=()=>{},ui,setUi,onFinish=()=>{},modoRevisao=false}){"
if old not in s:
    raise SystemExit('assinatura FinanceiroStart não encontrada')
s = s.replace(old, new, 1)

old = " const step=Number(estadoUi.step||0),aberto=!!estadoUi.aberto;"
new = " const step=Math.max(0,Math.min(6,Number(estadoUi.step||0))),aberto=!!estadoUi.aberto;"
if old not in s:
    raise SystemExit('step FinanceiroStart não encontrado')
s = s.replace(old, new, 1)

padrao_etapas = re.compile(r" const etapas=\[\n.*?\n \];\n const concluidas=\[.*?\];", re.S)
novo_etapas = ''' const etapas=[
  {id:'moeda',titulo:'Sua moeda',sub:'Base dos cálculos',Icon:WalletCards,fase:'FUNDAÇÃO'},
  {id:'renda',titulo:'Quanto entra?',sub:'Rendas recorrentes',Icon:Coins,fase:'FUNDAÇÃO'},
  {id:'fixos',titulo:'Gastos fixos',sub:'Seu custo mensal',Icon:ReceiptText,fase:'FUNDAÇÃO'},
  {id:'contas',titulo:'Contas e saldos',sub:'Liquidez disponível',Icon:Landmark,fase:'FUNDAÇÃO'},
  {id:'patrimonio',titulo:'Seu patrimônio',sub:'Bens que você possui',Icon:Building2,fase:'FUNDAÇÃO'},
  {id:'compromissos',titulo:'Compromissos e parcelas',sub:'Financiamentos, consórcios e dívidas',Icon:HandCoins,fase:'FUNDAÇÃO'},
  {id:'foto',titulo:'Sua fotografia',sub:'Seu ponto de partida',Icon:Sparkles,fase:'FUNDAÇÃO'}
 ];
 const diagnosticoJaConcluido=!!(fin.configuracao?.diagnosticoFinanceiroConcluido||fin.startFinanceiroConcluido);
 const concluidasBase=[!!fin.configuracao?.startMoedaConfirmada,receitas.length>0,gastos.length>0,contas.length>0,patrimonios.length>0||!!fin.configuracao?.startSemPatrimonio,dividas.length>0||!!fin.configuracao?.startSemDividas,!!fin.configuracao?.startFotografiaConfirmada];
 const concluidas=modoRevisao&&diagnosticoJaConcluido?concluidasBase.map(()=>true):concluidasBase;'''
s2, n = padrao_etapas.subn(novo_etapas, s, count=1)
if n != 1:
    raise SystemExit('bloco etapas/concluidas não encontrado')
s = s2

old = " const posicoes=[68,34,25,43,67,72,51,29,42,68,50],alturaMapa=etapas.length*116+18;"
new = " const posicoes=[68,34,25,43,67,72,51],alturaMapa=etapas.length*116+18;"
if old not in s:
    raise SystemExit('posições FinanceiroStart não encontradas')
s = s.replace(old, new, 1)

padrao_concluir = re.compile(r" const concluir=\(\)=>\{.*?\};\n\n const compromissoCampos", re.S)
novo_concluir = " const concluir=()=>{persistir(f=>({...f,startFinanceiroConcluido:true,onboardingConcluido:true,configuracao:{...f.configuracao,startFotografiaConfirmada:true,diagnosticoFinanceiroConcluido:true,diagnosticoFinanceiroConcluidoEm:f.configuracao?.diagnosticoFinanceiroConcluidoEm||hoje()}}));setAberto(false);onFinish()};\n\n const compromissoCampos"
s2, n = padrao_concluir.subn(novo_concluir, s, count=1)
if n != 1:
    raise SystemExit('função concluir não encontrada')
s = s2

old = "<button className=\"fxstart-btn wide\" onClick={()=>{confirmarFlag('startFotografiaConfirmada');proxima()}}>CONFIRMAR MEU PONTO DE PARTIDA</button>"
new = "<button className=\"fxstart-btn wide\" onClick={concluir}>{modoRevisao?'SALVAR DIAGNÓSTICO':'CONCLUIR DIAGNÓSTICO'}</button>"
if old not in s:
    raise SystemExit('botão fotografia não encontrado')
s = s.replace(old, new, 1)

old = " return <div className=\"fxstart\"><div className=\"fxstart-hero\"><div><h1>Minha trilha financeira</h1><p>Uma etapa por vez. Eu sigo com você.</p></div><div className=\"fxstart-orb\"/></div>"
new = " return <div className=\"fxstart\"><div className=\"fxstart-hero\"><div><h1>{modoRevisao?'Revisar diagnóstico':'Diagnóstico financeiro'}</h1><p>{modoRevisao?'Atualize o que mudou sem perder o que já concluiu.':'Uma etapa por vez para entender seu ponto de partida.'}</p>{modoRevisao&&<button type=\"button\" onClick={onFinish} style={{border:0,background:'transparent',padding:'8px 0 0',font:'inherit',fontSize:11,fontWeight:800,color:'#075B59',textDecoration:'underline'}}>Voltar ao painel</button>}</div><div className=\"fxstart-orb\"/></div>"
if old not in s:
    raise SystemExit('hero FinanceiroStart não encontrado')
s = s.replace(old, new, 1)

p.write_text(s)

# --- Financeiro: diagnóstico concluído não regride; Trilha vira continuação editável ---
p = Path('Financeiro.jsx')
s = p.read_text()

old = "  const[startUi,setStartUi]=useState({step:0,aberto:false});\n  const inputFile=useRef(null);"
new = "  const[startUi,setStartUi]=useState({step:0,aberto:false});\n  const[revisandoDiagnostico,setRevisandoDiagnostico]=useState(false);\n  const inputFile=useRef(null);\n  const temBaseDiagnostico=!!(fin.configuracao?.startFotografiaConfirmada||((fin.receitasRecorrentes||[]).length&&(fin.gastosFixos||[]).length&&(fin.contas||[]).length&&((fin.patrimonios||[]).length||fin.configuracao?.startSemPatrimonio)&&((fin.dividas||[]).length||fin.configuracao?.startSemDividas)));\n  const diagnosticoConcluido=!!(fin.configuracao?.diagnosticoFinanceiroConcluido||fin.startFinanceiroConcluido||fin.onboardingConcluido||temBaseDiagnostico);"
if old not in s:
    raise SystemExit('estado startUi não encontrado')
s = s.replace(old, new, 1)

old = "  useEffect(()=>{if(!d.financeiro||d.financeiro.versao!==2)up(s=>({...s,financeiro:cloneFinanceiroInicial()}))},[]);"
new = "  useEffect(()=>{if(!d.financeiro||d.financeiro.versao!==2)up(s=>({...s,financeiro:cloneFinanceiroInicial()}))},[]);\n  useEffect(()=>{if(diagnosticoConcluido&&(!fin.startFinanceiroConcluido||!fin.configuracao?.diagnosticoFinanceiroConcluido))persistir(f=>({...f,startFinanceiroConcluido:true,onboardingConcluido:true,configuracao:{...f.configuracao,diagnosticoFinanceiroConcluido:true,diagnosticoFinanceiroConcluidoEm:f.configuracao?.diagnosticoFinanceiroConcluidoEm||hoje()}}))},[diagnosticoConcluido,fin.startFinanceiroConcluido,fin.configuracao?.diagnosticoFinanceiroConcluido]);"
if old not in s:
    raise SystemExit('useEffect inicial não encontrado')
s = s.replace(old, new, 1)

old = "  const concluirOnboarding=()=>persistir(f=>({...f,onboardingConcluido:true}));"
new = "  const concluirOnboarding=()=>persistir(f=>({...f,onboardingConcluido:true}));\n  const abrirDiagnostico=()=>{setStartUi({step:0,aberto:false});setRevisandoDiagnostico(true);setTela('visao')};"
if old not in s:
    raise SystemExit('concluirOnboarding não encontrado')
s = s.replace(old, new, 1)

old = "  const Visao=()=> <>{!fin.startFinanceiroConcluido?<FinanceiroStart fin={fin} persistir={persistir} aviso={aviso} ui={startUi} setUi={setStartUi} onFinish={()=>setTela('visao')}/>:<>"
new = "  const Visao=()=> <>{(!diagnosticoConcluido||revisandoDiagnostico)?<FinanceiroStart fin={fin} persistir={persistir} aviso={aviso} ui={startUi} setUi={setStartUi} modoRevisao={diagnosticoConcluido} onFinish={()=>{setRevisandoDiagnostico(false);setTela('visao')}}/>:<>"
if old not in s:
    raise SystemExit('gate da Visao não encontrado')
s = s.replace(old, new, 1)

padrao_trilha = re.compile(r"  const Trilha=\(\)=> .*?;\n  const Ofensiva=", re.S)
novo_trilha = '''  const Trilha=()=> diagnosticoConcluido?<><div className="fx2-title"><h2>Minha trilha financeira</h2><p>Seu diagnóstico está concluído. A partir daqui, a trilha continua e pode evoluir com você.</p></div><div className="fx2-card" style={{marginBottom:13}}><div style={{display:'flex',alignItems:'center',gap:11}}><div className="fx2-row-icon" style={{background:'#F4F8E8',color:'#2F2545'}}><Check size={19}/></div><div style={{flex:1}}><b style={{fontSize:12}}>Diagnóstico concluído</b><div className="fx2-muted" style={{marginTop:4}}>Seu ponto de partida continua disponível para revisão sempre que renda, gastos, patrimônio ou compromissos mudarem.</div></div></div><button className="fx2-btn ghost wide" style={{marginTop:13}} onClick={abrirDiagnostico}>REVISAR DIAGNÓSTICO</button></div><div className="fx2-card"><span className="fx2-pill">PRÓXIMA FASE</span><h3 style={{fontSize:15,margin:'12px 0 6px'}}>Continuação da sua trilha</h3><p className="fx2-muted" style={{lineHeight:1.55,margin:0}}>As próximas etapas serão definidas a partir do seu diagnóstico. Esta área permanece ativa e editável; concluir o diagnóstico não encerra a jornada.</p></div></>:<><div className="fx2-title"><h2>Diagnóstico financeiro</h2><p>Antes da trilha contínua, o NIIL precisa entender seu ponto de partida.</p></div><button className="fx2-btn wide" onClick={abrirDiagnostico}>CONTINUAR DIAGNÓSTICO</button></>;
  const Ofensiva='''
s2, n = padrao_trilha.subn(novo_trilha, s, count=1)
if n != 1:
    raise SystemExit('componente Trilha não encontrado')
s = s2

p.write_text(s)
