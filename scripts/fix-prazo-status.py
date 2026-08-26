from pathlib import Path

jsx = Path('FinanceiroStart.jsx')
s = jsx.read_text()

old = "const addDias=(ym,dias)=>{if(!ym)return'';const [ano,mes]=String(ym).split('-');if(!ano||!mes)return'';const dt=new Date(Number(ano),Number(mes)-1,1);dt.setDate(dt.getDate()+Number(dias||0));return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`};"
new = "const fimDoMes=ym=>{if(!ym)return'';const [ano,mes]=String(ym).split('-');if(!ano||!mes)return'';const dt=new Date(Number(ano),Number(mes),0);return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`};\nconst addDias=(ym,dias)=>{if(!ym)return'';const p=String(ym).split('-'),ano=Number(p[0]),mes=Number(p[1]),dia=p[2]?Number(p[2]):null;if(!ano||!mes)return'';const dt=dia?new Date(ano,mes-1,dia):new Date(ano,mes,0);dt.setDate(dt.getDate()+Number(dias||0));return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`};\nconst diasEntreDatas=(a,b)=>{if(!a||!b)return 0;const da=new Date(a+'T12:00:00'),db=new Date(b+'T12:00:00');return Math.max(0,Math.floor((db-da)/86400000))};"
if old not in s:
    raise SystemExit('helper addDias não encontrado')
s = s.replace(old, new, 1)

old = "const fimTolerancia=addDias(divida.prazoContratual,divida.toleranciaDias||180),atrasado=obra&&fimTolerancia&&new Date(fimTolerancia+'T23:59:59')<new Date(),pct=Math.max(0,Math.min(100,n(divida.percentualObra)));"
new = "const dataHoje=hoje(),fimPrazo=fimDoMes(divida.prazoContratual),fimTolerancia=addDias(divida.prazoContratual,divida.toleranciaDias||180),statusPrazo=!obra||!fimPrazo?'A definir':dataHoje<=fimPrazo?'No prazo':dataHoje<=fimTolerancia?'Em tolerância':'Atrasado',diasAtraso=statusPrazo==='Atrasado'?diasEntreDatas(fimTolerancia,dataHoje):0,pct=Math.max(0,Math.min(100,n(divida.percentualObra)));"
if old not in s:
    raise SystemExit('cálculo de status não encontrado')
s = s.replace(old, new, 1)

s = s.replace('Field label="Prazo contratual"', 'Field label="Prazo contratual de entrega"', 1)

old = "<div className={`fxcommit-delay-card status ${atrasado?'late':'ok'}`}><span>Status</span><b>{fimTolerancia?(atrasado?'Atrasado':'No prazo'):'A definir'}</b></div>"
new = "<div className={`fxcommit-delay-card status ${statusPrazo==='Atrasado'?'late':statusPrazo==='Em tolerância'?'tolerance':statusPrazo==='No prazo'?'ok':'neutral'}`}><span>Status</span><b>{statusPrazo}</b>{diasAtraso>0&&<small className=\"fxcommit-status-detail\">{diasAtraso} dias após a tolerância</small>}</div>"
if old not in s:
    raise SystemExit('card de status não encontrado')
s = s.replace(old, new, 1)

jsx.write_text(s)

css = Path('FinanceiroStart.css')
c = css.read_text()
extra = "\n.fxcommit-delay-card.status.tolerance{border-color:#F2D79D;background:#FFF9ED}.fxcommit-delay-card.status.tolerance b{color:#B97816}.fxcommit-delay-card.status.neutral{border-color:var(--line);background:#FAFCFB}.fxcommit-delay-card.status.neutral b{color:var(--ink2)}.fxcommit-status-detail{display:block;margin-top:3px;font-size:8.5px;line-height:1.25;color:#D84A4A;font-weight:750}\n"
if '.fxcommit-delay-card.status.tolerance' not in c:
    css.write_text(c + extra)
