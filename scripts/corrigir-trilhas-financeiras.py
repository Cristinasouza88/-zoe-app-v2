from pathlib import Path
import re

# ---------- financeiro.core.js: migração não destrutiva ----------
p=Path('financeiro.core.js')
s=p.read_text()
old="""export function normalizarFinanceiro(raw){
  if(!raw || raw.versao!==VERSAO_FINANCEIRO) return cloneFinanceiroInicial();
  return {
    ...cloneFinanceiroInicial(), ...raw,
"""
new="""export function normalizarFinanceiro(raw){
  if(!raw || typeof raw!=='object') return cloneFinanceiroInicial();
  return {
    ...cloneFinanceiroInicial(), ...raw, versao:VERSAO_FINANCEIRO,
"""
if old not in s: raise SystemExit('normalizarFinanceiro original não encontrado')
s=s.replace(old,new,1)
p.write_text(s)

# ---------- financeiro.data.js: coleção persistente de trilhas ----------
p=Path('financeiro.data.js')
s=p.read_text()
old=" transacoes:[],contas:[],cartoes:[],investimentos:[],dividas:[],patrimonios:[],receitasRecorrentes:[],gastosFixos:[],objetivos:[],orcamentos:[],regrasClassificacao:[],importacoes:[],"
new=" transacoes:[],contas:[],cartoes:[],investimentos:[],dividas:[],patrimonios:[],receitasRecorrentes:[],gastosFixos:[],objetivos:[],orcamentos:[],regrasClassificacao:[],importacoes:[],trilhasFinanceiras:[],alocacoesSobra:[],"
if old in s:
    s=s.replace(old,new,1)
elif 'trilhasFinanceiras:[]' not in s:
    raise SystemExit('estado inicial financeiro não encontrado')
p.write_text(s)

# ---------- FinanceiroStart.jsx: conclusão salva a trilha diagnóstico ----------
p=Path('FinanceiroStart.jsx')
s=p.read_text()
old=""" const concluir=()=>{persistir(f=>({...f,startFinanceiroConcluido:true,onboardingConcluido:true,configuracao:{...f.configuracao,startFotografiaConfirmada:true,diagnosticoFinanceiroConcluido:true,diagnosticoFinanceiroConcluidoEm:f.configuracao?.diagnosticoFinanceiroConcluidoEm||hoje()}}));setAberto(false);onFinish()};"""
new=""" const concluir=()=>{persistir(f=>{const concluidaEm=f.configuracao?.diagnosticoFinanceiroConcluidoEm||hoje(),existentes=Array.isArray(f.trilhasFinanceiras)?f.trilhasFinanceiras:[],diag={id:'diagnostico-inicial',nome:'Diagnóstico financeiro',tipo:'diagnostico',status:'concluida',totalEtapas:7,etapasConcluidas:7,concluidaEm,editavel:true};return{...f,startFinanceiroConcluido:true,onboardingConcluido:true,trilhasFinanceiras:existentes.some(t=>t.id==='diagnostico-inicial')?existentes.map(t=>t.id==='diagnostico-inicial'?{...t,...diag}:t):[diag,...existentes],configuracao:{...f.configuracao,startFotografiaConfirmada:true,diagnosticoFinanceiroConcluido:true,diagnosticoFinanceiroConcluidoEm:concluidaEm}}});setAberto(false);onFinish()};"""
if old not in s: raise SystemExit('concluir diagnóstico não encontrado')
s=s.replace(old,new,1)
p.write_text(s)

# ---------- Financeiro.jsx ----------
p=Path('Financeiro.jsx')
s=p.read_text()

# Diagnóstico também possui flag sticky fora do módulo financeiro.
old="  const diagnosticoConcluido=!!(fin.configuracao?.diagnosticoFinanceiroConcluido||fin.startFinanceiroConcluido||fin.onboardingConcluido||temBaseDiagnostico);"
new="  const diagnosticoConcluido=!!(d.financeiroDiagnosticoConcluido||fin.configuracao?.diagnosticoFinanceiroConcluido||fin.startFinanceiroConcluido||fin.onboardingConcluido||temBaseDiagnostico||(fin.trilhasFinanceiras||[]).some(t=>t.id==='diagnostico-inicial'&&t.status==='concluida'));"
if old not in s: raise SystemExit('diagnosticoConcluido não encontrado')
s=s.replace(old,new,1)

# Não apagar dados por diferença de versão; migrar preservando o conteúdo.
old="  useEffect(()=>{if(!d.financeiro||d.financeiro.versao!==2)up(s=>({...s,financeiro:cloneFinanceiroInicial()}))},[]);"
new="  useEffect(()=>{if(!d.financeiro)up(s=>({...s,financeiro:cloneFinanceiroInicial()}));else if(d.financeiro.versao!==2)up(s=>({...s,financeiro:normalizarFinanceiro(s.financeiro)}))},[]);"
if old not in s: raise SystemExit('useEffect destrutivo de versão não encontrado')
s=s.replace(old,new,1)

# Migração sticky: uma vez concluído, grava no estado-raiz e cria registro de trilha salva.
pattern=r"  useEffect\(\(\)=>\{if\(diagnosticoConcluido&&\(!fin\.startFinanceiroConcluido\|\|!fin\.configuracao\?\.diagnosticoFinanceiroConcluido\)\)persistir\(f=>\(\{\.\.\.f,startFinanceiroConcluido:true,onboardingConcluido:true,configuracao:\{\.\.\.f\.configuracao,diagnosticoFinanceiroConcluido:true,diagnosticoFinanceiroConcluidoEm:f\.configuracao\?\.diagnosticoFinanceiroConcluidoEm\|\|hoje\(\)\}\}\)\)\},\[diagnosticoConcluido,fin\.startFinanceiroConcluido,fin\.configuracao\?\.diagnosticoFinanceiroConcluido\]\);"
replacement="""  useEffect(()=>{if(!diagnosticoConcluido)return;if(d.financeiroDiagnosticoConcluido&&fin.startFinanceiroConcluido&&fin.configuracao?.diagnosticoFinanceiroConcluido&&(fin.trilhasFinanceiras||[]).some(t=>t.id==='diagnostico-inicial'&&t.status==='concluida'))return;up(s=>{const f=normalizarFinanceiro(s.financeiro),concluidaEm=f.configuracao?.diagnosticoFinanceiroConcluidoEm||hoje(),existentes=Array.isArray(f.trilhasFinanceiras)?f.trilhasFinanceiras:[],diag={id:'diagnostico-inicial',nome:'Diagnóstico financeiro',tipo:'diagnostico',status:'concluida',totalEtapas:7,etapasConcluidas:7,concluidaEm,editavel:true};return{...s,financeiroDiagnosticoConcluido:true,financeiro:{...f,startFinanceiroConcluido:true,onboardingConcluido:true,trilhasFinanceiras:existentes.some(t=>t.id==='diagnostico-inicial')?existentes.map(t=>t.id==='diagnostico-inicial'?{...t,...diag}:t):[diag,...existentes],configuracao:{...f.configuracao,diagnosticoFinanceiroConcluido:true,diagnosticoFinanceiroConcluidoEm:concluidaEm}}}})},[diagnosticoConcluido,d.financeiroDiagnosticoConcluido,fin.startFinanceiroConcluido,fin.configuracao?.diagnosticoFinanceiroConcluido]);"""
s,n=re.subn(pattern,replacement,s,count=1)
if n!=1: raise SystemExit('effect de migração do diagnóstico não encontrado')

# Coleções de trilhas para o hub.
anchor="  const sobraLivre=Math.max(0,Number(resumo.resultado||0)-totalAlocado);\n"
if anchor not in s: raise SystemExit('anchor sobraLivre não encontrado')
s=s.replace(anchor,anchor+"  const trilhasFinanceiras=Array.isArray(fin.trilhasFinanceiras)?fin.trilhasFinanceiras:[];\n  const trilhaDiagnostico=trilhasFinanceiras.find(t=>t.id==='diagnostico-inicial');\n  const trilhasPosDiagnostico=trilhasFinanceiras.filter(t=>t.id!=='diagnostico-inicial');\n",1)

# onFinish também grava imediatamente a flag sticky no estado-raiz.
old="onFinish={()=>{setRevisandoDiagnostico(false);setTela('visao')}}"
new="onFinish={()=>{up(s=>({...s,financeiroDiagnosticoConcluido:true}));setRevisandoDiagnostico(false);setTela('trilha')}}"
if old not in s: raise SystemExit('onFinish FinanceiroStart não encontrado')
s=s.replace(old,new,1)

# Hub de trilhas: diagnóstico salvo + espaço para trilhas futuras/ativas.
start=s.find("  const Trilha=()=>")
end=s.find("  const Ofensiva=()=>",start)
if start<0 or end<0: raise SystemExit('bloco Trilha não encontrado')
new_trilha="""  const Trilha=()=>{if(!diagnosticoConcluido)return <><div className=\"fx2-title\"><h2>Minha trilha financeira</h2><p>Seu primeiro caminho é o diagnóstico. Ele fica salvo aqui e, depois de concluído, novas trilhas podem ser adicionadas conforme sua vida financeira evolui.</p></div><div className=\"fx2-card fx2-trail-card\"><div className=\"fx2-trail-head\"><span className=\"fx2-pill\">EM ANDAMENTO</span><span className=\"fx2-muted\">Diagnóstico inicial</span></div><h3>Diagnóstico financeiro</h3><p className=\"fx2-muted\">Entenda seu ponto de partida em 7 etapas.</p><button className=\"fx2-btn wide\" onClick={()=>{setStartUi({step:0,aberto:false});setRevisandoDiagnostico(true);setTela('visao')}}>CONTINUAR TRILHA</button></div></>;
    const diag=trilhaDiagnostico||{id:'diagnostico-inicial',nome:'Diagnóstico financeiro',status:'concluida',totalEtapas:7,etapasConcluidas:7,concluidaEm:fin.configuracao?.diagnosticoFinanceiroConcluidoEm||''};
    return <><div className=\"fx2-title\"><h2>Minhas trilhas financeiras</h2><p>As trilhas não somem quando terminam. Elas ficam salvas aqui para consulta e edição, e novas jornadas entram conforme seus dados e prioridades evoluem.</p></div><div className=\"fx2-trails-stack\"><div className=\"fx2-card fx2-trail-card completed\"><div className=\"fx2-trail-head\"><span className=\"fx2-pill\">CONCLUÍDA</span><span className=\"fx2-muted\">{diag.etapasConcluidas||7}/{diag.totalEtapas||7} etapas</span></div><h3>{diag.nome||'Diagnóstico financeiro'}</h3><p className=\"fx2-muted\">Seu ponto de partida financeiro. Você pode revisar os dados sem perder o histórico de conclusão.</p>{diag.concluidaEm&&<small className=\"fx2-muted\">Concluída em {dateBr(diag.concluidaEm)}</small>}<button className=\"fx2-btn ghost wide\" onClick={abrirDiagnostico}>REVISAR DIAGNÓSTICO</button></div>{trilhasPosDiagnostico.map(t=><div className=\"fx2-card fx2-trail-card\" key={t.id}><div className=\"fx2-trail-head\"><span className=\"fx2-pill\">{t.status==='concluida'?'CONCLUÍDA':'ATIVA'}</span><span className=\"fx2-muted\">{Number(t.etapasConcluidas||0)}/{Number(t.totalEtapas||0)} etapas</span></div><h3>{t.nome||'Trilha financeira'}</h3>{t.descricao&&<p className=\"fx2-muted\">{t.descricao}</p>}<button className=\"fx2-btn wide\" onClick={()=>aviso('Esta trilha será aberta aqui conforme as próximas etapas forem definidas.')}>{t.status==='concluida'?'VER TRILHA':'CONTINUAR TRILHA'}</button></div>)}{!trilhasPosDiagnostico.length&&<div className=\"fx2-card fx2-trail-next\"><span className=\"fx2-pill\">PRÓXIMA TRILHA</span><h3>Sua jornada continua daqui</h3><p className=\"fx2-muted\">Este espaço recebe novas etapas conforme o NIIL identifica prioridades a partir de receitas, despesas, sobra, patrimônio, compromissos e objetivos. A próxima trilha ainda não foi definida.</p></div>}</div></>};
"""
s=s[:start]+new_trilha+s[end:]
p.write_text(s)

# ---------- Financeiro.css: hub das trilhas ----------
p=Path('Financeiro.css')
c=p.read_text()
marker='/* finance-trails-hub */'
if marker not in c:
    c += r'''

/* finance-trails-hub */
.fx2 .fx2-trails-stack{display:grid;gap:12px}
.fx2 .fx2-trail-card{border:1px solid #ECE8EF;box-shadow:0 8px 24px rgba(47,37,69,.055)}
.fx2 .fx2-trail-card.completed{background:linear-gradient(145deg,#fff 0%,#FBFAFD 100%)}
.fx2 .fx2-trail-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.fx2 .fx2-trail-card h3,.fx2 .fx2-trail-next h3{font-size:16px;color:#2F2545;margin:5px 0 7px}
.fx2 .fx2-trail-card p,.fx2 .fx2-trail-next p{line-height:1.55;margin:0 0 12px}
.fx2 .fx2-trail-card .fx2-btn{margin-top:13px}
.fx2 .fx2-trail-next{border:1px dashed #CFC7DD;background:#FAF8FD}
'''
p.write_text(c)
