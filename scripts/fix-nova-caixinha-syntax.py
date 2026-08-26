from pathlib import Path
p=Path('Financeiro.jsx')
s=p.read_text()
old="""if(modal.tipo==='novaCaixinha')return <Sheet title=\"Nova caixinha\" onClose={()=>setModal({tipo:'sobraMes',data:{}})}><p className=\"fx2-sheet-help\">Crie um destino para a sua sobra: viagem, reserva, curso, casa ou qualquer prioridade.</p><Field label=\"Nome da caixinha\">{input('nome',{placeholder:'Ex.: Viagem, Reserva, Entrada do imóvel'})}</Field><Field label=\"Para quê? (opcional)\">{input('descricao',{placeholder:'Uma frase curta para lembrar do objetivo'})}</Field><Field label=\"Meta (opcional)\">{input('meta',{inputMode:'decimal',placeholder:'0,00'})}</Field><button className=\"fx2-btn wide\" onClick={salvarCaixinha}>CRIAR CAIXINHA</button></Sheet>}"""
new=old[:-1]+';'
if old not in s: raise SystemExit('linha novaCaixinha não encontrada')
s=s.replace(old,new,1)
p.write_text(s)
