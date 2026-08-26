from pathlib import Path
import re

# ---------- Financeiro.jsx ----------
p=Path('Financeiro.jsx')
s=p.read_text()

# Navegação principal: ícones clicáveis sem caixas, e Visão geral ativa nas telas derivadas.
nav_re=r"  const FinanceNav=\(\)=>\{.*?\};\n"
nav_new="""  const FinanceNav=()=>{const ativo=['receitas','despesas','remanejar'].includes(tela)?'visao':(['visao','trilha','painel','objetivos'].includes(tela)?tela:'mais');const itens=[['visao','Visão geral',Home,'green'],['trilha','Trilha',Route,'purple'],['painel','Painel',BarChart3,'blue'],['objetivos','Objetivo',Target,'orange'],['mais','Mais',MoreHorizontal,'pink']];return <nav className=\"fx2-mainnav\" aria-label=\"Navegação financeira\">{itens.map(([id,label,Icon,tone])=><button key={id} type=\"button\" className={`fx2-mainnav-btn ${tone} ${ativo===id?'active':''}`} aria-label={label} title={label} onClick={()=>setTela(id)}><Icon size={30}/></button>)}</nav>};
"""
s,n=re.subn(nav_re,nav_new,s,count=1,flags=re.S)
if n!=1: raise SystemExit('FinanceNav não encontrada')

# Ordem correta: navegação antes do seletor do mês.
s=s.replace(":<><Month/><FinanceNav/><div className=\"fx2-hero\">",":<><FinanceNav/><Month/><div className=\"fx2-hero\">",1)

# Estado derivado de destinação da sobra.
anchor="  const pendentes=fin.transacoes.filter(t=>t.revisar&&t.status!=='ignorado');\n"
if anchor not in s: raise SystemExit('anchor pendentes não encontrado')
s=s.replace(anchor,anchor+"  const alocacoesMes=(fin.alocacoesSobra||[]).filter(a=>a.mes===mesRef);\n  const totalAlocado=alocacoesMes.reduce((a,x)=>a+Number(x.valor||0),0);\n  const sobraLivre=Math.max(0,Number(resumo.resultado||0)-totalAlocado);\n",1)

# Os quatro cards do painel passam a ser clicáveis.
s=s.replace('<div className="fx2-metric"><span>Receita</span>','<button type="button" className="fx2-metric fx2-metric-click" onClick={()=>setTela(\'receitas\')}><span>Receita</span>',1)
s=s.replace(' entradas</small></div><div className="fx2-metric"><span>Despesas</span>',' entradas</small></button><button type="button" className="fx2-metric fx2-metric-click" onClick={()=>setTela(\'despesas\')}><span>Despesas</span>',1)
s=s.replace(' despesas</small></div><div className="fx2-metric"><span>Resultado do mês</span>',' despesas</small></button><button type="button" className="fx2-metric fx2-metric-click" onClick={()=>setTela(\'remanejar\')}><span>Resultado do mês</span>',1)
# Remove CTA interno para não haver botão dentro de botão e transforma em indicação do fluxo.
s=re.sub(r'<button type="button" className="fx2-invest-mini".*?</button>','<span className="fx2-invest-mini"><PieChart size={13}/><span>Remanejar sobra</span><ChevronRight size={13}/></span>',s,count=1,flags=re.S)
s=s.replace('</span></div><div className="fx2-metric"><span>Saldo disponível</span>','</span></button><button type="button" className="fx2-metric fx2-metric-click" onClick={()=>setTela(\'contas\')}><span>Saldo disponível</span>',1)
s=s.replace('</small></div></div></div><div className="fx2-quick">','</small></button></div></div><div className="fx2-quick">',1)

# Persistência da destinação da sobra sem transformar transferência interna em despesa.
anchor="  const salvarReserva=()=>{const m=modal?.data||{},meta=Number(String(m.metaReserva||0).replace(',','.'))||0;if(!meta)return aviso('Informe o valor da meta.');agir(f=>({...f,configuracao:{...f.configuracao,metaReserva:meta,prazoReserva:m.prazoReserva||'',aporteReservaMensal:Number(String(m.aporteReservaMensal||0).replace(',','.'))||0},metaAnual:{alvo:meta,ano:new Date().getFullYear()}}));fechar()};\n"
if anchor not in s: raise SystemExit('salvarReserva não encontrado')
extra="""  const salvarAlocacaoSobra=()=>{const m=modal?.data||{},v=Math.abs(Number(String(m.valor||'').replace(',','.'))||0);if(!v)return aviso('Informe o valor que deseja destinar.');if(v>sobraLivre+.01)return aviso('O valor é maior que a sobra ainda disponível neste mês.');if(!m.destinoId)return aviso('Escolha onde deseja destinar a sobra.');const item={id:uid('aloc'),mes:mesRef,data:hoje(),valor:v,destinoTipo:m.destinoTipo||'investimento',destinoId:m.destinoId};persistir(f=>({...f,alocacoesSobra:[...(f.alocacoesSobra||[]),item]}));fechar();aviso('Sobra destinada')};
  const removerAlocacaoSobra=id=>persistir(f=>({...f,alocacoesSobra:(f.alocacoesSobra||[]).filter(x=>x.id!==id)}));
"""
s=s.replace(anchor,anchor+extra,1)

# Novas telas de Receita, Despesa e Remanejamento.
insert_before="  const Cartoes=()=>"
if insert_before not in s: raise SystemExit('Cartoes não encontrado')
screens="""  const Receitas=()=>{const itens=resumo.itens.filter(t=>impactos(t).receita>0);return <><Back onClick={()=>setTela('visao')}/><div className=\"fx2-title\"><h2>Receitas</h2><p>Tudo o que entrou no mês fica aqui para reconhecer, revisar e acrescentar novas receitas.</p></div><Month/><button className=\"fx2-btn wide\" onClick={()=>abrir('transacao',{tipo:'receita',natureza:'normal',data:hoje(),categoria:'Salário'})}>+ ADICIONAR RECEITA</button><Section title=\"Reconhecidas no mês\"><div className=\"fx2-card\">{itens.length?<div className=\"fx2-list\">{itens.slice().sort((a,b)=>String(b.data).localeCompare(String(a.data))).map(t=><div className=\"fx2-row click\" key={t.id} onClick={()=>abrir('revisarTx',{...t,termoRegra:t.descricaoOriginal,criarRegra:false})}><div className=\"fx2-row-icon\"><ArrowUpRight size={18}/></div><div className=\"fx2-row-main\"><b>{t.descricaoOriginal}</b><small>{dateBr(t.data)} · {t.categoria}{t.revisar?' · revisar':''}</small></div><div className=\"fx2-row-value fx2-positive\"><Money value={t.valor} hidden={hidden}/></div></div>)}</div>:<Empty icon={Coins} title=\"Nenhuma receita reconhecida neste mês\" text=\"Adicione manualmente ou importe movimentações para começar.\"/>}</div></Section><Section title=\"Rendas recorrentes\">{fin.receitasRecorrentes?.length?<div className=\"fx2-list\">{fin.receitasRecorrentes.filter(x=>x.ativo!==false).map(r=><div className=\"fx2-row\" key={r.id}><div className=\"fx2-row-icon\"><Coins size={18}/></div><div className=\"fx2-row-main\"><b>{r.nome}</b><small>{r.categoria} · mensal</small></div><div className=\"fx2-row-value\"><Money value={r.valorMensal} hidden={hidden}/></div></div>)}</div>:<div className=\"fx2-card\"><Empty icon={Coins} title=\"Sem renda recorrente cadastrada\" text=\"Você pode revisar seu diagnóstico para incluir salários e outras rendas mensais.\"/></div>}</Section></>};

  const Despesas=()=>{const itens=resumo.itens.filter(t=>impactos(t).despesa>0);return <><Back onClick={()=>setTela('visao')}/><div className=\"fx2-title\"><h2>Despesas</h2><p>Tudo o que saiu no mês fica aqui para reconhecer, revisar categorias e acrescentar gastos.</p></div><Month/><button className=\"fx2-btn wide\" onClick={()=>abrir('transacao',{tipo:'despesa',natureza:'normal',data:hoje(),categoria:'Alimentação'})}>+ ADICIONAR DESPESA</button><Section title=\"Reconhecidas no mês\"><div className=\"fx2-card\">{itens.length?<div className=\"fx2-list\">{itens.slice().sort((a,b)=>String(b.data).localeCompare(String(a.data))).map(t=><div className=\"fx2-row click\" key={t.id} onClick={()=>abrir('revisarTx',{...t,termoRegra:t.descricaoOriginal,criarRegra:false})}><div className=\"fx2-row-icon\"><ArrowDownRight size={18}/></div><div className=\"fx2-row-main\"><b>{t.descricaoOriginal}</b><small>{dateBr(t.data)} · {t.categoria}{t.revisar?' · revisar':''}</small></div><div className=\"fx2-row-value fx2-negative\"><Money value={t.valor} hidden={hidden}/></div></div>)}</div>:<Empty icon={ReceiptText} title=\"Nenhuma despesa reconhecida neste mês\" text=\"Adicione manualmente ou importe movimentações para começar.\"/>}</div></Section><Section title=\"Gastos fixos\">{fin.gastosFixos?.length?<div className=\"fx2-list\">{fin.gastosFixos.filter(x=>x.ativo!==false).map(g=><div className=\"fx2-row\" key={g.id}><div className=\"fx2-row-icon\"><ReceiptText size={18}/></div><div className=\"fx2-row-main\"><b>{g.nome}</b><small>{g.categoria} · mensal</small></div><div className=\"fx2-row-value\"><Money value={g.valorMensal} hidden={hidden}/></div></div>)}</div>:<div className=\"fx2-card\"><Empty icon={ReceiptText} title=\"Sem gasto fixo cadastrado\" text=\"Você pode revisar seu diagnóstico para incluir custos mensais.\"/></div>}</Section></>};

  const Remanejar=()=> <><Back onClick={()=>setTela('visao')}/><div className=\"fx2-title\"><h2>Sobra do mês</h2><p>Receita menos despesas. Aqui você decide o destino do dinheiro que ainda não foi comprometido.</p></div><Month/><div className=\"fx2-surplus-card\"><span>Resultado do mês</span><strong><Money value={resumo.resultado} hidden={hidden}/></strong><small>{resumo.resultado>0?'Valor disponível para organizar':'Não há sobra positiva neste mês'}</small></div>{resumo.resultado>0&&<><div className=\"fx2-surplus-free\"><span>Ainda não destinado</span><strong><Money value={sobraLivre} hidden={hidden}/></strong></div><div className=\"fx2-surplus-actions\"><button onClick={()=>abrir('alocarSobra',{destinoTipo:'investimento',destinoId:fin.investimentos?.[0]?.id||'',valor:sobraLivre?String(sobraLivre.toFixed(2)):''})}><PieChart size={25}/><b>Mandar para investimento</b><small>Destine parte da sobra para uma aplicação.</small></button><button onClick={()=>abrir('alocarSobra',{destinoTipo:'conta',destinoId:fin.contas?.[0]?.id||'',valor:sobraLivre?String(sobraLivre.toFixed(2)):''})}><Landmark size={25}/><b>Mandar para uma conta</b><small>Separe a sobra em uma conta cadastrada.</small></button></div></>}{alocacoesMes.length>0&&<Section title=\"Destinações deste mês\"><div className=\"fx2-list\">{alocacoesMes.map(a=>{const destino=a.destinoTipo==='investimento'?fin.investimentos.find(x=>x.id===a.destinoId):fin.contas.find(x=>x.id===a.destinoId);return <div className=\"fx2-row\" key={a.id}><div className=\"fx2-row-icon\">{a.destinoTipo==='investimento'?<PieChart size={18}/>:<Landmark size={18}/>}</div><div className=\"fx2-row-main\"><b>{destino?.nome||'Destino'}</b><small>{a.destinoTipo==='investimento'?'Investimento':'Conta'} · {dateBr(a.data)}</small></div><div className=\"fx2-row-value\"><Money value={a.valor} hidden={hidden}/></div><button className=\"fx2-close\" onClick={()=>removerAlocacaoSobra(a.id)} aria-label=\"Remover destinação\"><X size={14}/></button></div>})}</div></Section>}<div className=\"fx2-alert\" style={{marginTop:14}}>Destinar a sobra organiza seu dinheiro, mas não transforma transferências entre suas próprias contas ou investimentos em despesa.</div></>;

"""
s=s.replace(insert_before,screens+insert_before,1)

# Render das novas telas.
render_anchor="  const render=()=>{if(tela==='trilha')return Trilha();"
if render_anchor not in s: raise SystemExit('render anchor não encontrado')
s=s.replace(render_anchor,"  const render=()=>{if(tela==='receitas')return Receitas();if(tela==='despesas')return Despesas();if(tela==='remanejar')return Remanejar();if(tela==='trilha')return Trilha();",1)

# Modal de destinação da sobra.
modal_anchor="    if(modal.tipo==='objetivo')return <Sheet"
if modal_anchor not in s: raise SystemExit('modal objetivo não encontrado')
modal_code="""    if(modal.tipo==='alocarSobra'){const lista=m.destinoTipo==='conta'?fin.contas:fin.investimentos;return <Sheet title={m.destinoTipo==='conta'?'Mandar sobra para uma conta':'Mandar sobra para investimento'} onClose={fechar}><div className=\"fx2-card\" style={{marginBottom:12}}><span className=\"fx2-label\">Sobra ainda disponível</span><div className=\"fx2-bigmoney\"><Money value={sobraLivre} hidden={hidden}/></div></div><Field label=\"Valor\">{input('valor',{inputMode:'decimal',placeholder:'0,00'})}</Field><Field label=\"Destino\"><select value={m.destinoId||''} onChange={e=>atualizarModal({destinoId:e.target.value})}><option value=\"\">Selecione</option>{lista.filter(x=>x.ativo!==false).map(x=><option key={x.id} value={x.id}>{x.nome}</option>)}</select></Field>{!lista.length&&<div className=\"fx2-alert\" style={{marginBottom:12}}>Você ainda não tem {m.destinoTipo==='conta'?'contas':'investimentos'} cadastrados. Feche esta tela e cadastre o destino primeiro.</div>}<button className=\"fx2-btn wide\" onClick={salvarAlocacaoSobra}>CONFIRMAR DESTINAÇÃO</button></Sheet>}
"""
s=s.replace(modal_anchor,modal_code+modal_anchor,1)

p.write_text(s)

# ---------- Financeiro.css ----------
css=Path('Financeiro.css')
c=css.read_text()
c += r'''

/* financeiro-navigation-and-clickable-metrics-v2 */
.fx2 .fx2-mainnav{display:flex!important;align-items:center;justify-content:space-between;gap:8px;margin:0 0 12px;padding:0 5px}
.fx2 .fx2-mainnav-btn{width:54px!important;height:54px!important;min-width:54px!important;aspect-ratio:auto!important;border:0!important;background:transparent!important;border-radius:50%!important;display:grid!important;place-items:center!important;padding:0!important;box-shadow:none!important;cursor:pointer;transition:transform .15s ease,background .15s ease}
.fx2 .fx2-mainnav-btn span{display:none!important}
.fx2 .fx2-mainnav-btn:active{transform:scale(.93)}
.fx2 .fx2-mainnav-btn.active{transform:none!important;border:0!important;box-shadow:none!important;background:rgba(155,141,211,.10)!important}
.fx2 .fx2-mainnav-btn.green svg{color:#19B77A}.fx2 .fx2-mainnav-btn.purple svg{color:#7D35E8}.fx2 .fx2-mainnav-btn.blue svg{color:#3478F6}.fx2 .fx2-mainnav-btn.orange svg{color:#F3A11A}.fx2 .fx2-mainnav-btn.pink svg{color:#F20B55}
.fx2 .fx2-metric-click{font:inherit;text-align:left;border:0;cursor:pointer;width:100%;transition:transform .15s ease,box-shadow .15s ease}
.fx2 .fx2-metric-click:active{transform:scale(.985)}
.fx2 .fx2-invest-mini{cursor:inherit;text-decoration:none}
.fx2 .fx2-surplus-card{background:linear-gradient(145deg,#1AC17D,#0FA669);border-radius:24px;padding:20px;color:#fff;box-shadow:0 16px 34px rgba(14,166,105,.16)}
.fx2 .fx2-surplus-card>span{display:block;font-size:11px;opacity:.85}.fx2 .fx2-surplus-card>strong{display:block;font-size:28px;margin:7px 0}.fx2 .fx2-surplus-card>small{font-size:10px;opacity:.88}
.fx2 .fx2-surplus-free{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:12px 0;padding:14px 16px;border-radius:17px;background:#F2F9F6;color:#28564A}.fx2 .fx2-surplus-free span{font-size:10px}.fx2 .fx2-surplus-free strong{font-size:16px}
.fx2 .fx2-surplus-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fx2 .fx2-surplus-actions button{border:1px solid #E6EBE8;background:#fff;border-radius:19px;padding:16px 13px;text-align:left;font:inherit;color:#231D38;box-shadow:0 7px 20px rgba(44,36,66,.045);cursor:pointer}.fx2 .fx2-surplus-actions svg{color:#18B978;margin-bottom:10px}.fx2 .fx2-surplus-actions b{display:block;font-size:11px}.fx2 .fx2-surplus-actions small{display:block;font-size:8.5px;color:#7D8595;line-height:1.4;margin-top:5px}
@media(max-width:390px){.fx2 .fx2-mainnav-btn{width:48px!important;height:48px!important;min-width:48px!important}.fx2 .fx2-mainnav-btn svg{width:26px;height:26px}.fx2 .fx2-surplus-actions{grid-template-columns:1fr}}
'''
css.write_text(c)

# ---------- financeiro.data.js ----------
p=Path('financeiro.data.js')
s=p.read_text()
old=" transacoes:[],contas:[],cartoes:[],investimentos:[],dividas:[],patrimonios:[],receitasRecorrentes:[],gastosFixos:[],objetivos:[],orcamentos:[],regrasClassificacao:[],importacoes:[],"
new=" transacoes:[],contas:[],cartoes:[],investimentos:[],dividas:[],patrimonios:[],receitasRecorrentes:[],gastosFixos:[],objetivos:[],orcamentos:[],regrasClassificacao:[],importacoes:[],alocacoesSobra:[],"
if old not in s: raise SystemExit('estado inicial financeiro não encontrado')
s=s.replace(old,new,1)
p.write_text(s)

# ---------- financeiro.core.js ----------
p=Path('financeiro.core.js')
s=p.read_text()
anchor="    importacoes:Array.isArray(raw.importacoes)?raw.importacoes:[],\n"
if anchor not in s: raise SystemExit('normalizador importacoes não encontrado')
s=s.replace(anchor,anchor+"    alocacoesSobra:Array.isArray(raw.alocacoesSobra)?raw.alocacoesSobra:[],\n",1)
p.write_text(s)
