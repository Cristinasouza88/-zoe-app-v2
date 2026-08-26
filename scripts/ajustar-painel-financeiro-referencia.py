from pathlib import Path

p = Path('Financeiro.jsx')
s = p.read_text()

# Calendário no seletor de mês.
s = s.replace(
    "ShieldCheck,Brain,ReceiptText,Layers3,HandCoins,TrendingUp,CircleDollarSign,X,Save,FileUp,\n  ListChecks,ArrowUpRight,ArrowDownRight,LockKeyhole,FolderClock,Settings2",
    "ShieldCheck,Brain,ReceiptText,Layers3,HandCoins,TrendingUp,CircleDollarSign,X,Save,FileUp,\n  ListChecks,ArrowUpRight,ArrowDownRight,LockKeyhole,FolderClock,Settings2,CalendarDays"
)

old_month = "const Month=()=> <div className=\"fx2-month\"><button onClick={()=>setMesRef(addMes(mesRef,-1))}><ChevronLeft size={15}/></button><span className=\"fx2-pill\">{rotuloMes(mesRef)}</span><button onClick={()=>setMesRef(addMes(mesRef,1))}><ChevronRight size={15}/></button></div>;"
new_month = "const Month=()=> <div className=\"fx2-month\"><button onClick={()=>setMesRef(addMes(mesRef,-1))}><ChevronLeft size={18}/></button><span className=\"fx2-month-label\">{rotuloMes(mesRef)} <CalendarDays size={18}/></span><button onClick={()=>setMesRef(addMes(mesRef,1))}><ChevronRight size={18}/></button></div>;"
if old_month not in s:
    raise SystemExit('Month original não encontrado')
s = s.replace(old_month, new_month, 1)

# Mês deve ficar antes do painel, como na referência.
needle = ":<><div className=\"fx2-hero\">"
if needle not in s:
    raise SystemExit('Início do painel não encontrado')
s = s.replace(needle, ":<><Month/><div className=\"fx2-hero\">", 1)

needle_after = "</div></div></div><Month/><div className=\"fx2-quick\">"
if needle_after not in s:
    raise SystemExit('Month pós-painel não encontrado')
s = s.replace(needle_after, "</div></div></div><div className=\"fx2-quick\">", 1)

old_quick = "<div className=\"fx2-quick\"><button onClick={()=>abrir('transacao',{tipo:'despesa',natureza:'normal',data:hoje(),categoria:'Alimentação'})}><Plus size={18}/><span>Lançamento</span></button><button onClick={()=>setTela('importar')}><Upload size={18}/><span>Importar</span></button><button onClick={()=>setTela('reserva')}><PiggyBank size={18}/><span>Reserva</span></button><button onClick={()=>setTela('cartoes')}><CreditCard size={18}/><span>Cartões</span></button></div>"
new_quick = "<div className=\"fx2-quick\"><button onClick={()=>abrir('transacao',{tipo:'despesa',natureza:'normal',data:hoje(),categoria:'Alimentação'})}><Plus size={22}/><span>Lançamento</span></button><button onClick={()=>setTela('contas')}><Landmark size={22}/><span>Conta</span></button><button onClick={()=>setTela('cartoes')}><CreditCard size={22}/><span>Cartões</span></button><button onClick={()=>setTela('reserva')}><PiggyBank size={22}/><span>Reservas</span></button></div>"
if old_quick not in s:
    raise SystemExit('Atalhos originais não encontrados')
s = s.replace(old_quick, new_quick, 1)

# CTA de investimentos dentro do card Resultado do mês.
old_result = "<small className={resumo.resultado>=0?'fx2-positive':'fx2-negative'}>{resumo.receita?`${Math.abs(resumo.resultado/resumo.receita*100).toFixed(0)}% da receita`:'Sem receita informada'}</small></div><div className=\"fx2-metric\"><span>Saldo disponível</span>"
new_result = "<small className={resumo.resultado>=0?'fx2-positive':'fx2-negative'}>{resumo.receita?`${Math.abs(resumo.resultado/resumo.receita*100).toFixed(0)}% da receita`:'Sem receita informada'}</small><button type=\"button\" className=\"fx2-invest-mini\" onClick={()=>setTela('reserva')}><PieChart size={13}/><span>Investimentos e alocações</span><ChevronRight size={13}/></button></div><div className=\"fx2-metric\"><span>Saldo disponível</span>"
if old_result not in s:
    raise SystemExit('Card resultado não encontrado')
s = s.replace(old_result, new_result, 1)

p.write_text(s)

css = Path('Financeiro.css')
c = css.read_text()
marker = '/* painel-financeiro-referencia-niil */'
if marker not in c:
    c += r'''

/* painel-financeiro-referencia-niil */
.fx2{
  --fin-green:#18B978;
  --fin-green-dark:#0FA86A;
  --fin-green-soft:#EAF8F1;
}
.fx2-shell{padding:18px 18px 110px;max-width:520px}
.fx2-shell>div:first-child{margin-bottom:8px}
.fx2 .fx2-month{margin:4px 0 18px;gap:16px}
.fx2 .fx2-month button{width:42px;height:42px;border:1px solid #E7E8ED;background:#fff;color:#2F2545;box-shadow:0 5px 15px rgba(47,37,69,.04)}
.fx2 .fx2-month-label{display:flex;align-items:center;justify-content:center;gap:10px;color:var(--fin-green-dark);font-size:15px;font-weight:850;letter-spacing:-.01em}
.fx2 .fx2-hero{background:linear-gradient(145deg,#1AC17D 0%,#14AF6F 54%,#0FA669 100%);border-radius:28px;padding:22px 20px 20px;box-shadow:0 18px 38px rgba(14,166,105,.18)}
.fx2 .fx2-hero:after{width:230px;height:230px;right:-100px;top:-116px;background:rgba(255,255,255,.07)}
.fx2 .fx2-hero h2{font-size:24px;letter-spacing:-.025em}
.fx2 .fx2-hero p{font-size:12px;opacity:.92}
.fx2 .fx2-metrics{gap:10px;margin-top:18px}
.fx2 .fx2-metric{border-radius:22px;padding:16px;min-height:116px;box-shadow:0 5px 16px rgba(10,87,58,.055)}
.fx2 .fx2-metric span{font-size:11px;margin-bottom:8px}
.fx2 .fx2-metric strong{font-size:17px;color:#28233F}
.fx2 .fx2-metric small{font-size:10px;margin-top:9px}
.fx2 .fx2-invest-mini{width:100%;margin-top:11px;border:0;border-radius:999px;background:#EAF8F1;color:#16885D;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 9px;font:inherit;font-size:8.5px;font-weight:850;cursor:pointer}
.fx2 .fx2-invest-mini span{margin:0;color:inherit;font-size:8.5px;font-weight:850;white-space:nowrap}
.fx2 .fx2-quick{gap:10px;margin-top:14px}
.fx2 .fx2-quick button{min-height:86px;border-radius:18px;padding:13px 4px;border-color:#E8E8ED;box-shadow:0 7px 20px rgba(47,37,69,.055)}
.fx2 .fx2-quick svg{color:var(--fin-green);margin-bottom:7px}
.fx2 .fx2-quick span{font-size:10px;color:#161321}
.fx2 .fx2-alert{margin-top:14px!important;border-radius:17px;padding:12px 14px;background:#FFF8EC;border-color:#F5E1BC;color:#8A641F}
.fx2 .fx2-section-head h3{font-size:16px;color:#1F1B31}
.fx2 .fx2-link{color:var(--fin-green-dark);font-size:11px}
@media(max-width:390px){
  .fx2 .fx2-hero{padding:19px 17px 18px}
  .fx2 .fx2-metric{padding:13px;min-height:108px}
  .fx2 .fx2-metric strong{font-size:15px}
  .fx2 .fx2-invest-mini span{font-size:7.5px}
  .fx2 .fx2-quick button{min-height:80px}
}
'''
css.write_text(c)
