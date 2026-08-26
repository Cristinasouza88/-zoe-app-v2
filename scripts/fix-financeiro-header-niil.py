from pathlib import Path

p = Path('Financeiro.jsx')
s = p.read_text()

old_import = "import FinanceiroStart from'./FinanceiroStart.jsx';"
new_import = "import FinanceiroStart from'./FinanceiroStart.jsx';\nimport{Wordmark}from'./ui.jsx';"
if old_import not in s:
    raise SystemExit('import anchor not found')
s = s.replace(old_import, new_import, 1)

old_header = '''  const Header=()=> <><div className=\"fx2-top\"><div className=\"fx2-brand\"><div className=\"fx2-brandmark\"><Sparkles size={21}/></div><div><h1>NIIL</h1><small>Financeiro</small></div></div><div className=\"fx2-tag\"><b>Seu dinheiro, seus sonhos, seu futuro.</b><br/>Inteligente e feito pra você.</div></div>{!['ofensiva','bau'].includes(tela)&&<div className=\"fx2-subnav\">{[['visao','Visão geral'],['trilha','Trilha'],['painel','Painel'],['objetivos','Objetivos'],['mais','Mais']].map(([id,n])=><button key={id} className={tela===id?'active':''} onClick={()=>setTela(id)}>{n}</button>)}</div>}</>;'''
new_header = '''  const Header=()=> <div style={{display:'flex',alignItems:'center',padding:'2px 0 14px'}}><Wordmark altura={42} cor=\"#9B8DD3\"/></div>;'''
if old_header not in s:
    raise SystemExit('header anchor not found')
s = s.replace(old_header, new_header, 1)

p.write_text(s)
