from pathlib import Path

p=Path('FinanceiroStart.jsx')
s=p.read_text()

s=s.replace("dataInicioReembolso:'',indenizacaoMensal:'1',amortizacaoMensal", "dataInicioReembolso:'',temReembolsoEvolucaoObra:false,indenizacaoMensal:'1',temIndenizacaoAtraso:false,observacaoAtrasoRessarcimento:'',amortizacaoMensal", 1)

s=s.replace("dataInicioReembolso:divida.dataInicioReembolso||'',indenizacaoMensal:n(divida.indenizacaoMensal||1),amortizacaoMensal", "dataInicioReembolso:divida.dataInicioReembolso||'',temReembolsoEvolucaoObra:!!divida.temReembolsoEvolucaoObra,indenizacaoMensal:n(divida.indenizacaoMensal||1),temIndenizacaoAtraso:!!divida.temIndenizacaoAtraso,observacaoAtrasoRessarcimento:divida.observacaoAtrasoRessarcimento||'',amortizacaoMensal", 1)

old='''<div className="fxcommit-legal"><label><PiggyBank size={17}/><span>Reembolso da evolução de obra</span><input type="month" value={divida.dataInicioReembolso} onChange={e=>setDivida({...divida,dataInicioReembolso:e.target.value})}/></label><label><Coins size={17}/><span>Indenização por atraso</span><div className="fxcommit-inline small"><input inputMode="decimal" value={divida.indenizacaoMensal} onChange={e=>setDivida({...divida,indenizacaoMensal:e.target.value})}/><em>% ao mês</em></div></label></div><div className="fxcommit-disclaimer">Estimativas para organização pessoal. Confira prazos, tolerância e direitos no contrato e com orientação jurídica quando necessário.</div>'''

new='''<div className="fxcommit-legal">
<label className={`fxcommit-check-row ${divida.temReembolsoEvolucaoObra?'checked':''}`}><input className="fxcommit-check" type="checkbox" checked={!!divida.temReembolsoEvolucaoObra} onChange={e=>setDivida({...divida,temReembolsoEvolucaoObra:e.target.checked})}/><PiggyBank size={17}/><span>Reembolso da evolução de obra</span>{divida.temReembolsoEvolucaoObra&&<input type="month" value={divida.dataInicioReembolso} onChange={e=>setDivida({...divida,dataInicioReembolso:e.target.value})}/>}</label>
<label className={`fxcommit-check-row ${divida.temIndenizacaoAtraso?'checked':''}`}><input className="fxcommit-check" type="checkbox" checked={!!divida.temIndenizacaoAtraso} onChange={e=>setDivida({...divida,temIndenizacaoAtraso:e.target.checked})}/><Coins size={17}/><span>Indenização por atraso</span>{divida.temIndenizacaoAtraso&&<div className="fxcommit-inline small"><input inputMode="decimal" value={divida.indenizacaoMensal} onChange={e=>setDivida({...divida,indenizacaoMensal:e.target.value})}/><em>% ao mês</em></div>}</label>
</div><Field label="Observações"><textarea className="fxcommit-observacao" rows="4" value={divida.observacaoAtrasoRessarcimento||''} onChange={e=>setDivida({...divida,observacaoAtrasoRessarcimento:e.target.value})} placeholder="Ex.: construtora informou reembolso da evolução de obra a partir de jul/2026; registrar atualizações sobre atraso, ressarcimento ou acordo."/></Field><div className="fxcommit-disclaimer">Estimativas para organização pessoal. Confira prazos, tolerância e direitos no contrato e com orientação jurídica quando necessário.</div>'''

if old not in s:
    raise SystemExit('bloco de ressarcimentos não encontrado')
s=s.replace(old,new,1)
p.write_text(s)

css=Path('FinanceiroStart.css')
c=css.read_text()
extra='''\n.fxcommit-check-row{display:grid!important;grid-template-columns:22px 20px minmax(0,1fr) auto!important;align-items:center!important;gap:8px!important;min-height:54px}.fxcommit-check-row.checked{background:#eef9f4!important;border-color:#bfe9d3!important}.fxcommit-check{width:18px!important;height:18px!important;accent-color:#25B97F!important;margin:0!important}.fxcommit-check-row>input[type="month"]{width:132px!important;min-width:0!important}.fxcommit-observacao{width:100%;resize:vertical;min-height:92px;padding:12px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit;font-size:14px;line-height:1.45;color:var(--ink);background:#FAFCFB;outline:none}.fxcommit-observacao:focus{border-color:#3ECF8E;background:#fff}@media(max-width:430px){.fxcommit-check-row{grid-template-columns:22px 20px minmax(0,1fr)!important}.fxcommit-check-row>input[type="month"],.fxcommit-check-row>.fxcommit-inline{grid-column:3;width:100%!important}}\n'''
if '.fxcommit-observacao' not in c:
    css.write_text(c+extra)
