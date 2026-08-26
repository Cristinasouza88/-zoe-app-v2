from pathlib import Path

p=Path('Financeiro.jsx')
s=p.read_text()

s=s.replace(
"  Sparkles,Eye,EyeOff,Plus,Upload,WalletCards,Route,BarChart3,Target,",
"  Sparkles,Eye,EyeOff,Plus,Upload,WalletCards,Route,BarChart3,Target,Home,MoreHorizontal,"
)

month="const Month=()=> <div className=\"fx2-month\"><button onClick={()=>setMesRef(addMes(mesRef,-1))}><ChevronLeft size={18}/></button><span className=\"fx2-month-label\">{rotuloMes(mesRef)} <CalendarDays size={18}/></span><button onClick={()=>setMesRef(addMes(mesRef,1))}><ChevronRight size={18}/></button></div>;"
if month not in s:
    raise SystemExit('Month não encontrado')
nav=month+"\n  const FinanceNav=()=>{const ativo=['visao','trilha','painel','objetivos'].includes(tela)?tela:'mais';const itens=[['visao','Visão geral',Home,'green'],['trilha','Trilha',Route,'purple'],['painel','Painel',BarChart3,'blue'],['objetivos','Objetivo',Target,'orange'],['mais','Mais',MoreHorizontal,'pink']];return <div className=\"fx2-mainnav\" aria-label=\"Navegação financeira\">{itens.map(([id,label,Icon,tone])=><button key={id} type=\"button\" className={`fx2-mainnav-btn ${tone} ${ativo===id?'active':''}`} aria-label={label} title={label} onClick={()=>setTela(id)}><Icon size={27}/><span>{label}</span></button>)}</div>};"
s=s.replace(month,nav,1)

needle=":<><Month/><div className=\"fx2-hero\">"
if needle not in s:
    raise SystemExit('Visao com Month não encontrada')
s=s.replace(needle,":<><Month/><FinanceNav/><div className=\"fx2-hero\">",1)

old='<div className="fx2-shell"><Header/>{render()}</div>'
new='<div className="fx2-shell"><Header/>{diagnosticoConcluido&&!revisandoDiagnostico&&tela!==\'visao\'&&<FinanceNav/>}{render()}</div>'
if old not in s:
    raise SystemExit('Return principal não encontrado')
s=s.replace(old,new,1)
p.write_text(s)

css=Path('Financeiro.css')
c=css.read_text()
marker='/* finance-mainnav-reference */'
if marker not in c:
    c += r'''

/* finance-mainnav-reference */
.fx2 .fx2-mainnav{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:0 0 18px}
.fx2 .fx2-mainnav-btn{min-width:0;aspect-ratio:1/1;border:1px solid #ECEBF0;background:#fff;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;box-shadow:0 7px 20px rgba(44,36,66,.055);font:inherit;cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
.fx2 .fx2-mainnav-btn span{font-size:8px;font-weight:800;color:#777183;line-height:1;white-space:nowrap}
.fx2 .fx2-mainnav-btn.green svg{color:#19B77A}.fx2 .fx2-mainnav-btn.purple svg{color:#7D35E8}.fx2 .fx2-mainnav-btn.blue svg{color:#3478F6}.fx2 .fx2-mainnav-btn.orange svg{color:#F3A11A}.fx2 .fx2-mainnav-btn.pink svg{color:#F20B55}
.fx2 .fx2-mainnav-btn.active{transform:translateY(-1px);border-color:rgba(155,141,211,.32);box-shadow:0 9px 23px rgba(44,36,66,.09)}
.fx2 .fx2-mainnav-btn.active span{color:#2F2545}
@media(max-width:390px){.fx2 .fx2-mainnav{gap:7px}.fx2 .fx2-mainnav-btn{border-radius:17px}.fx2 .fx2-mainnav-btn svg{width:24px;height:24px}.fx2 .fx2-mainnav-btn span{font-size:7px}}
'''
css.write_text(c)
