from pathlib import Path
import re

# ---------- financeiro.data.js ----------
p=Path('financeiro.data.js')
s=p.read_text()
s=s.replace("export const CATEGORIAS_RECEITA=['Salário','Salário PJ','Pró-labore','Trabalho','Renda variável','Rendimentos','Reembolso','Aluguel recebido','Outros'];","export const CATEGORIAS_RECEITA=['Salário','Salário PJ','Pró-labore','Comissão','Bônus','Trabalho','Renda variável','Rendimentos','Reembolso','Aluguel recebido','Outros'];")
s=s.replace("trilhasFinanceiras:[],alocacoesSobra:[],alocacoesSobra:[],","trilhasFinanceiras:[],caixinhas:[],alocacoesSobra:[],")
if "caixinhas:[]" not in s:
    raise SystemExit('Não consegui adicionar caixinhas ao estado inicial')
p.write_text(s)

# ---------- financeiro.core.js ----------
p=Path('financeiro.core.js')
s=p.read_text()
old="""    importacoes:Array.isArray(raw.importacoes)?raw.importacoes:[],
    alocacoesSobra:Array.isArray(raw.alocacoesSobra)?raw.alocacoesSobra:[],
"""
new="""    importacoes:Array.isArray(raw.importacoes)?raw.importacoes:[],
    trilhasFinanceiras:Array.isArray(raw.trilhasFinanceiras)?raw.trilhasFinanceiras:[],
    caixinhas:Array.isArray(raw.caixinhas)?raw.caixinhas:[],
    alocacoesSobra:Array.isArray(raw.alocacoesSobra)?raw.alocacoesSobra:[],
"""
if old not in s: raise SystemExit('normalizador: anchor de importacoes não encontrado')
s=s.replace(old,new,1)
old="""  if(tipo==='receita'){
    if(/salario pj|raio de sol/.test(d))return'Salário PJ';
    if(/pro labore/.test(d))return'Pró-labore';
    if(/salario|folha/.test(d))return'Salário';
"""
new="""  if(tipo==='receita'){
    if(/salario pj|raio de sol/.test(d))return'Salário PJ';
    if(/pro labore/.test(d))return'Pró-labore';
    if(/comiss|commission/.test(d))return'Comissão';
    if(/bonus|bônus|premiacao|premiação/.test(d))return'Bônus';
    if(/salario|folha/.test(d))return'Salário';
"""
if old not in s: raise SystemExit('classificador de receita não encontrado')
s=s.replace(old,new,1)
p.write_text(s)

# ---------- Financeiro.jsx ----------
p=Path('Financeiro.jsx')
s=p.read_text()

# Derivados de caixinhas e sobra.
anchor="  const sobraLivre=Math.max(0,Number(resumo.resultado||0)-totalAlocado);\n"
if anchor not in s: raise SystemExit('anchor sobraLivre não encontrado')
extra="""  const caixinhasAtivas=(fin.caixinhas||[]).filter(c=>c.ativa!==false);
  const alocadoNaCaixinhaMes=id=>alocacoesMes.filter(a=>a.destinoTipo==='caixinha'&&a.destinoId===id).reduce((a,x)=>a+Number(x.valor||0),0);
  const saldoPlanejadoCaixinha=id=>(fin.alocacoesSobra||[]).filter(a=>a.destinoTipo==='caixinha'&&a.destinoId===id).reduce((a,x)=>a+Number(x.valor||0),0);
"""
if 'const caixinhasAtivas=' not in s:
    s=s.replace(anchor,anchor+extra,1)

# Salvar lançamento e voltar para o sheet pai quando veio de Receita/Despesa.
old="""    agir(f=>({...f,onboardingConcluido:true,transacoes:[...f.transacoes,tx]}));setMesRef(tx.data.slice(0,7));fechar();aviso('Lançamento salvo');
"""
new="""    agir(f=>({...f,onboardingConcluido:true,transacoes:[...f.transacoes,tx]}));setMesRef(tx.data.slice(0,7));if(m.voltarPara)setModal({tipo:m.voltarPara,data:{}});else fechar();aviso('Lançamento salvo');
"""
if old not in s: raise SystemExit('salvarTransacao não encontrado')
s=s.replace(old,new,1)

# Classificação inline e criação de caixinha.
anchor="  const removerAlocacaoSobra=id=>persistir(f=>({...f,alocacoesSobra:(f.alocacoesSobra||[]).filter(x=>x.id!==id)}));\n"
if anchor not in s: raise SystemExit('removerAlocacaoSobra não encontrado')
extra="""  const ajustarCategoriaTx=(id,categoria)=>agir(f=>({...f,transacoes:f.transacoes.map(x=>x.id===id?{...x,categoria,status:'confirmado',revisar:false,revisadoUsuario:true,confiancaClassificacao:1}:x)}));
  const salvarCaixinha=()=>{const m=modal?.data||{},nome=String(m.nome||'').trim();if(!nome)return aviso('Dê um nome para a caixinha.');const meta=Math.abs(Number(String(m.meta||'').replace(',','.'))||0),item={id:uid('cx'),nome,descricao:String(m.descricao||'').trim(),meta,criadaEm:hoje(),ativa:true};persistir(f=>({...f,caixinhas:[...(f.caixinhas||[]),item]}));setModal({tipo:'sobraMes',data:{}});aviso('Caixinha criada')};
"""
if 'const ajustarCategoriaTx=' not in s:
    s=s.replace(anchor,anchor+extra,1)

# Alocação retorna para o sheet da sobra e aceita caixinha.
old="""  const salvarAlocacaoSobra=()=>{const m=modal?.data||{},v=Math.abs(Number(String(m.valor||'').replace(',','.'))||0);if(!v)return aviso('Informe o valor que deseja destinar.');if(v>sobraLivre+.01)return aviso('O valor é maior que a sobra ainda disponível neste mês.');if(!m.destinoId)return aviso('Escolha onde deseja destinar a sobra.');const item={id:uid('aloc'),mes:mesRef,data:hoje(),valor:v,destinoTipo:m.destinoTipo||'investimento',destinoId:m.destinoId};persistir(f=>({...f,alocacoesSobra:[...(f.alocacoesSobra||[]),item]}));fechar();aviso('Sobra destinada')};
"""
new="""  const salvarAlocacaoSobra=()=>{const m=modal?.data||{},v=Math.abs(Number(String(m.valor||'').replace(',','.'))||0);if(!v)return aviso('Informe o valor que deseja destinar.');if(v>sobraLivre+.01)return aviso('O valor é maior que a sobra ainda disponível neste mês.');if(!m.destinoId)return aviso('Escolha onde deseja destinar a sobra.');const item={id:uid('aloc'),mes:mesRef,data:hoje(),valor:v,destinoTipo:m.destinoTipo||'caixinha',destinoId:m.destinoId};persistir(f=>({...f,alocacoesSobra:[...(f.alocacoesSobra||[]),item]}));setModal({tipo:'sobraMes',data:{}});aviso('Sobra organizada')};
"""
if old not in s: raise SystemExit('salvarAlocacaoSobra original não encontrado')
s=s.replace(old,new,1)

# Dashboard: os cards abrem sheets, sem trocar de tela.
s=s.replace("onClick={()=>setTela('receitas')}","onClick={()=>abrir('receitasMes')}",1)
s=s.replace("onClick={()=>setTela('despesas')}","onClick={()=>abrir('despesasMes')}",1)
s=s.replace("onClick={()=>setTela('remanejar')}","onClick={()=>abrir('sobraMes')}",1)
# O quarto card passa a mostrar o que fica livre na conta depois das destinações.
old="""<button type=\"button\" className=\"fx2-metric fx2-metric-click\" onClick={()=>setTela('contas')}><span>Saldo disponível</span><strong>{resumo.saldoDisponivel==null?'—':<Money value={resumo.saldoDisponivel} hidden={hidden}/>}</strong><small>{resumo.saldoDisponivel==null?'Informe o saldo das contas':`Atualizado ${resumo.dataSaldo?dateBr(resumo.dataSaldo):'manualmente'}`}</small></button>"""
new="""<button type=\"button\" className=\"fx2-metric fx2-metric-click\" onClick={()=>abrir('sobraMes')}><span>Fica na conta</span><strong><Money value={sobraLivre} hidden={hidden}/></strong><small>{resumo.resultado>0?(totalAlocado>0?'Livre depois das caixinhas':'Ainda não destinado'):'Sem sobra positiva no mês'}</small></button>"""
if old not in s: raise SystemExit('card saldo disponível não encontrado')
s=s.replace(old,new,1)
s=s.replace('Remanejar sobra','Organizar sobra',1)

# Modal: inserir sheets mensais antes de Novo lançamento.
modal_anchor="    if(modal.tipo==='transacao')return <Sheet title=\"Novo lançamento\""
if modal_anchor not in s: raise SystemExit('modal transacao não encontrado')
modais=r'''    if(modal.tipo==='receitasMes'){const itens=resumo.itens.filter(t=>impactos(t).receita>0).slice().sort((a,b)=>String(b.data).localeCompare(String(a.data)));return <Sheet title={`Receitas · ${rotuloMes(mesRef)}`} onClose={fechar}><div className="fx2-sheet-kpis"><div><span>Reconhecido</span><strong><Money value={resumo.receita} hidden={hidden}/></strong></div><div><span>Entradas</span><strong>{itens.length}</strong></div></div><p className="fx2-sheet-help">Confira o que entrou e dê o match correto. Salário, comissão, bônus e outras receitas podem ser ajustados aqui.</p><button className="fx2-btn wide" onClick={()=>abrir('transacao',{tipo:'receita',natureza:'normal',data:hoje(),categoria:'Salário',voltarPara:'receitasMes'})}>+ ADICIONAR RECEITA</button><div className="fx2-match-list">{itens.length?itens.map(t=><div className="fx2-match-row" key={t.id}><div className="fx2-match-top"><div><b>{t.descricaoOriginal}</b><small>{dateBr(t.data)}{t.contaId?` · ${fin.contas.find(c=>c.id===t.contaId)?.nome||'Conta'}`:''}</small></div><strong className="fx2-positive"><Money value={t.valor} hidden={hidden}/></strong></div><label>Reconhecer como<select value={t.categoria||'Outros'} onChange={e=>ajustarCategoriaTx(t.id,e.target.value)}>{CATEGORIAS_RECEITA.map(c=><option key={c}>{c}</option>)}</select></label></div>):<div className="fx2-empty-mini">Ainda não há receitas reconhecidas neste mês.</div>}</div>{(fin.receitasRecorrentes||[]).filter(x=>x.ativo!==false).length>0&&<div className="fx2-sheet-sub"><b>Rendas recorrentes cadastradas</b>{fin.receitasRecorrentes.filter(x=>x.ativo!==false).map(r=><div className="fx2-sheet-ref" key={r.id}><span>{r.nome}<small>{r.categoria||'Renda mensal'}</small></span><strong><Money value={r.valorMensal} hidden={hidden}/></strong></div>)}</div>}</Sheet>}
    if(modal.tipo==='despesasMes'){const itens=resumo.itens.filter(t=>impactos(t).despesa>0).slice().sort((a,b)=>String(b.data).localeCompare(String(a.data)));return <Sheet title={`Despesas · ${rotuloMes(mesRef)}`} onClose={fechar}><div className="fx2-sheet-kpis"><div><span>Reconhecido</span><strong><Money value={resumo.despesa} hidden={hidden}/></strong></div><div><span>Saídas</span><strong>{itens.length}</strong></div></div><p className="fx2-sheet-help">Confira o que saiu e corrija a categoria diretamente. O NIIL aprende com os matches que você confirma.</p><button className="fx2-btn wide" onClick={()=>abrir('transacao',{tipo:'despesa',natureza:'normal',data:hoje(),categoria:'Alimentação',voltarPara:'despesasMes'})}>+ ADICIONAR DESPESA</button><div className="fx2-match-list">{itens.length?itens.map(t=><div className="fx2-match-row" key={t.id}><div className="fx2-match-top"><div><b>{t.descricaoOriginal}</b><small>{dateBr(t.data)}{t.contaId?` · ${fin.contas.find(c=>c.id===t.contaId)?.nome||'Conta'}`:''}</small></div><strong className="fx2-negative"><Money value={t.valor} hidden={hidden}/></strong></div><label>Reconhecer como<select value={t.categoria||'Outros'} onChange={e=>ajustarCategoriaTx(t.id,e.target.value)}>{CATEGORIAS_DESPESA.map(c=><option key={c}>{c}</option>)}</select></label></div>):<div className="fx2-empty-mini">Ainda não há despesas reconhecidas neste mês.</div>}</div>{(fin.gastosFixos||[]).filter(x=>x.ativo!==false).length>0&&<div className="fx2-sheet-sub"><b>Gastos fixos cadastrados</b>{fin.gastosFixos.filter(x=>x.ativo!==false).map(g=><div className="fx2-sheet-ref" key={g.id}><span>{g.nome}<small>{g.categoria||'Gasto mensal'}</small></span><strong><Money value={g.valorMensal} hidden={hidden}/></strong></div>)}</div>}</Sheet>}
    if(modal.tipo==='sobraMes'){const positiva=Math.max(0,Number(resumo.resultado||0));return <Sheet title={`Organizar sobra · ${rotuloMes(mesRef)}`} onClose={fechar}><div className="fx2-sheet-kpis three"><div><span>Sobra do mês</span><strong><Money value={positiva} hidden={hidden}/></strong></div><div><span>Já organizado</span><strong><Money value={totalAlocado} hidden={hidden}/></strong></div><div className="remain"><span>Fica na conta</span><strong><Money value={sobraLivre} hidden={hidden}/></strong></div></div><p className="fx2-sheet-help">Você só precisa decidir o destino do que quiser separar. Tudo o que não for colocado em uma caixinha continua livre na conta.</p>{positiva>0?<><div className="fx2-sheet-section-title"><b>Suas caixinhas</b><button className="fx2-link" onClick={()=>abrir('novaCaixinha',{voltarPara:'sobraMes'})}>+ Criar nova</button></div>{caixinhasAtivas.length?<div className="fx2-box-grid">{caixinhasAtivas.map(c=><button type="button" className="fx2-box-choice" key={c.id} onClick={()=>abrir('alocarSobra',{destinoTipo:'caixinha',destinoId:c.id,valor:''})}><PiggyBank size={21}/><b>{c.nome}</b>{c.descricao&&<small>{c.descricao}</small>}<span><Money value={alocadoNaCaixinhaMes(c.id)} hidden={hidden}/> neste mês</span><em>Total separado: <Money value={saldoPlanejadoCaixinha(c.id)} hidden={hidden}/></em></button>)}</div>:<div className="fx2-empty-mini">Você ainda não criou nenhuma caixinha. Crie a primeira para separar parte da sobra por objetivo.</div>}<div className="fx2-stays-account"><Landmark size={20}/><div><b>Fica livre na conta</b><small>É o valor que você não destinou para nenhuma caixinha.</small></div><strong><Money value={sobraLivre} hidden={hidden}/></strong></div></>:<div className="fx2-alert">Não há sobra positiva neste mês para organizar.</div>}{alocacoesMes.length>0&&<div className="fx2-sheet-sub"><b>Destinações deste mês</b>{alocacoesMes.map(a=>{const cx=(fin.caixinhas||[]).find(x=>x.id===a.destinoId),inv=fin.investimentos.find(x=>x.id===a.destinoId),ct=fin.contas.find(x=>x.id===a.destinoId),nome=cx?.nome||inv?.nome||ct?.nome||'Destino';return <div className="fx2-sheet-ref" key={a.id}><span>{nome}<small>{dateBr(a.data)}</small></span><strong><Money value={a.valor} hidden={hidden}/></strong><button className="fx2-close" onClick={()=>removerAlocacaoSobra(a.id)} aria-label="Remover"><X size={13}/></button></div>})}</div>}</Sheet>}
    if(modal.tipo==='novaCaixinha')return <Sheet title="Nova caixinha" onClose={()=>setModal({tipo:'sobraMes',data:{}})}><p className="fx2-sheet-help">Crie um destino para a sua sobra: viagem, reserva, curso, casa ou qualquer prioridade.</p><Field label="Nome da caixinha">{input('nome',{placeholder:'Ex.: Viagem, Reserva, Entrada do imóvel'})}</Field><Field label="Para quê? (opcional)">{input('descricao',{placeholder:'Uma frase curta para lembrar do objetivo'})}</Field><Field label="Meta (opcional)">{input('meta',{inputMode:'decimal',placeholder:'0,00'})}</Field><button className="fx2-btn wide" onClick={salvarCaixinha}>CRIAR CAIXINHA</button></Sheet>}
'''
s=s.replace(modal_anchor,modais+modal_anchor,1)

# Alocar sobra: caixinhas também são destino; fechar volta ao organizador.
old="""    if(modal.tipo==='alocarSobra'){const lista=m.destinoTipo==='conta'?fin.contas:fin.investimentos;return <Sheet title={m.destinoTipo==='conta'?'Mandar sobra para uma conta':'Mandar sobra para investimento'} onClose={fechar}><div className=\"fx2-card\" style={{marginBottom:12}}><span className=\"fx2-label\">Sobra ainda disponível</span><div className=\"fx2-bigmoney\"><Money value={sobraLivre} hidden={hidden}/></div></div><Field label=\"Valor\">{input('valor',{inputMode:'decimal',placeholder:'0,00'})}</Field><Field label=\"Destino\"><select value={m.destinoId||''} onChange={e=>atualizarModal({destinoId:e.target.value})}><option value=\"\">Selecione</option>{lista.filter(x=>x.ativo!==false).map(x=><option key={x.id} value={x.id}>{x.nome}</option>)}</select></Field>{!lista.length&&<div className=\"fx2-alert\" style={{marginBottom:12}}>Você ainda não tem {m.destinoTipo==='conta'?'contas':'investimentos'} cadastrados. Feche esta tela e cadastre o destino primeiro.</div>}<button className=\"fx2-btn wide\" onClick={salvarAlocacaoSobra}>CONFIRMAR DESTINAÇÃO</button></Sheet>}"""
new="""    if(modal.tipo==='alocarSobra'){const lista=m.destinoTipo==='caixinha'?caixinhasAtivas:(m.destinoTipo==='conta'?fin.contas:fin.investimentos),destino=lista.find(x=>x.id===m.destinoId);return <Sheet title={m.destinoTipo==='caixinha'?`Separar em ${destino?.nome||'caixinha'}`:(m.destinoTipo==='conta'?'Mandar sobra para uma conta':'Mandar sobra para investimento')} onClose={()=>setModal({tipo:'sobraMes',data:{}})}><div className=\"fx2-card\" style={{marginBottom:12}}><span className=\"fx2-label\">Ainda livre na conta</span><div className=\"fx2-bigmoney\"><Money value={sobraLivre} hidden={hidden}/></div></div><Field label=\"Quanto você quer separar?\">{input('valor',{inputMode:'decimal',placeholder:'0,00'})}</Field><Field label=\"Destino\"><select value={m.destinoId||''} onChange={e=>atualizarModal({destinoId:e.target.value})}><option value=\"\">Selecione</option>{lista.filter(x=>x.ativo!==false).map(x=><option key={x.id} value={x.id}>{x.nome}</option>)}</select></Field>{!lista.length&&<div className=\"fx2-alert\" style={{marginBottom:12}}>Você ainda não tem destinos cadastrados.</div>}<button className=\"fx2-btn wide\" onClick={salvarAlocacaoSobra}>CONFIRMAR</button></Sheet>}"""
if old not in s: raise SystemExit('modal alocarSobra original não encontrado')
s=s.replace(old,new,1)

p.write_text(s)

# ---------- Financeiro.css ----------
p=Path('Financeiro.css')
c=p.read_text()
marker='/* finance-monthly-sheets */'
if marker not in c:
    c+=r'''

/* finance-monthly-sheets */
.fx2 .fx2-sheet-kpis{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px}
.fx2 .fx2-sheet-kpis.three{grid-template-columns:repeat(3,1fr)}
.fx2 .fx2-sheet-kpis>div{background:#F7F5FA;border:1px solid #ECE8F0;border-radius:15px;padding:11px;min-width:0}
.fx2 .fx2-sheet-kpis>div.remain{background:#F3F8E8;border-color:#DCE9B7}
.fx2 .fx2-sheet-kpis span{display:block;font-size:9px;color:#817A89;margin-bottom:4px}
.fx2 .fx2-sheet-kpis strong{font-size:14px;color:#2F2545;word-break:break-word}
.fx2 .fx2-sheet-help{font-size:11px;line-height:1.5;color:#625B69;margin:0 0 13px}
.fx2 .fx2-match-list{display:grid;gap:9px;margin-top:13px}
.fx2 .fx2-match-row{border:1px solid #E8E3EC;background:#fff;border-radius:16px;padding:11px}
.fx2 .fx2-match-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:9px}
.fx2 .fx2-match-top b{display:block;font-size:11px;color:#2F2545;line-height:1.3}
.fx2 .fx2-match-top small{display:block;font-size:9px;color:#817A89;margin-top:3px}
.fx2 .fx2-match-row label{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:9px;font-size:9px;font-weight:700;color:#625B69}
.fx2 .fx2-match-row select{min-height:38px;border:1px solid #DDD7E3;border-radius:11px;background:#FAF9FB;padding:0 9px;color:#2F2545;font:inherit}
.fx2 .fx2-sheet-sub{margin-top:16px;padding-top:14px;border-top:1px solid #EEEAF1;display:grid;gap:8px}
.fx2 .fx2-sheet-sub>b,.fx2 .fx2-sheet-section-title>b{font-size:11px;color:#2F2545}
.fx2 .fx2-sheet-ref{display:flex;align-items:center;gap:8px;background:#FAF9FB;border-radius:12px;padding:9px 10px}
.fx2 .fx2-sheet-ref>span{flex:1;font-size:10px;color:#2F2545;font-weight:700}
.fx2 .fx2-sheet-ref small{display:block;font-size:8px;color:#817A89;font-weight:500;margin-top:2px}
.fx2 .fx2-sheet-ref strong{font-size:10px;color:#2F2545}
.fx2 .fx2-empty-mini{border:1px dashed #DDD6E5;border-radius:14px;padding:15px;text-align:center;font-size:10px;line-height:1.45;color:#817A89;margin-top:12px}
.fx2 .fx2-sheet-section-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:14px 0 9px}
.fx2 .fx2-box-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.fx2 .fx2-box-choice{border:1px solid #E5DFEA;background:#fff;border-radius:16px;padding:12px;text-align:left;color:#2F2545;display:flex;flex-direction:column;gap:4px;min-width:0}
.fx2 .fx2-box-choice svg{color:#9B8DD3;margin-bottom:2px}
.fx2 .fx2-box-choice b{font-size:11px}
.fx2 .fx2-box-choice small{font-size:8px;color:#817A89;line-height:1.35}
.fx2 .fx2-box-choice span{font-size:9px;color:#625B69;margin-top:5px}
.fx2 .fx2-box-choice em{font-size:8px;color:#9B8DD3;font-style:normal}
.fx2 .fx2-stays-account{margin-top:10px;background:#F4F8E8;border:1px solid #DDE9BD;border-radius:16px;padding:11px;display:flex;align-items:center;gap:9px;color:#2F2545}
.fx2 .fx2-stays-account>div{flex:1}
.fx2 .fx2-stays-account b{display:block;font-size:10px}
.fx2 .fx2-stays-account small{display:block;font-size:8px;color:#817A89;margin-top:2px}
.fx2 .fx2-stays-account strong{font-size:11px}
@media(max-width:380px){.fx2 .fx2-sheet-kpis.three{grid-template-columns:1fr 1fr}.fx2 .fx2-sheet-kpis.three>div.remain{grid-column:1/-1}}
'''
p.write_text(c)
