export default function financeiroFluxoPatrimonialV3(){
  return {
    name:'zoe-financeiro-fluxo-patrimonial-v3',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      // 1) Extrato bancario: pagamento de fatura fica provisoriamente como despesa
      // ate o usuario decidir se vai ou nao importar a fatura detalhada.
      const fimClassificacao="return{...regras(x),tipoDocumentoImportado:doc}};";
      if(out.includes(fimClassificacao)&&!out.includes('PAGAMENTO_FATURA_PENDENTE')){
        const novoFim=`if(doc==='extrato_bancario'&&x.tipo==='saida'&&/pagamento.*(?:fatura|cartao)|(?:fatura|cartao).*(?:pagamento|pago)|pgto.*(?:fatura|cartao)/.test(txt)){const z=regras(x);return{...z,tipoDocumentoImportado:doc,categoria:'Cartão',natureza:'PAGAMENTO_FATURA_PENDENTE',pagamentoFaturaPendente:true,pagamentoFaturaStatus:'revisar',impactoReceita:0,impactoDespesa:Math.abs(Number(x.valor||0)),ignorarResumo:false,revisar:false,observacaoAutomatica:'Mantido provisoriamente como despesa até você decidir se vai importar a fatura detalhada.'}}return{...regras(x),tipoDocumentoImportado:doc}};`;
        out=out.replace(fimClassificacao,novoFim);changed=true;
      }

      // Evita que a regra legada de pagamento de fatura desfaça o estado provisório no reload.
      const corrigirInicio="function corrigirLegado(x){const s=norm(";
      if(out.includes(corrigirInicio)&&!out.includes("pagamentoFaturaStatus==='aguardando_fatura'")){
        out=out.replace(corrigirInicio,"function corrigirLegado(x){if(x?.pagamentoFaturaPendente||x?.pagamentoFaturaStatus==='aguardando_fatura'||x?.pagamentoFaturaStatus==='confirmado_sem_fatura')return x;const s=norm(");
        changed=true;
      }

      // 2) Se o usuario muda uma saida para Investimentos, isso vira movimentacao patrimonial,
      // nao despesa. Consorcio/financiamento continuam consumindo caixa e formam patrimonio.
      const editarAntigo=" const editarLancamentoCategoria=(id,categoria,subcategoria)=>atualiza(f=>({...f,transacoes:(f.transacoes||[]).map(t=>t.id===id?regras({...t,categoria:categoria||t.categoria,subcategoria:subcategoria??t.subcategoria,confianca:'CONFIRMADO_MANUAL',revisar:false}):t)}));";
      if(out.includes(editarAntigo)){
        const editarNovo=` const editarLancamentoCategoria=(id,categoria,subcategoria)=>atualiza(f=>{const tx=(f.transacoes||[]).map(t=>{if(t.id!==id)return t;const cat=categoria||t.categoria;let z=regras({...t,categoria:cat,subcategoria:subcategoria??t.subcategoria,confianca:'CONFIRMADO_MANUAL',revisar:false});if(cat==='Investimentos'){z={...z,natureza:t.tipo==='entrada'?'RESGATE_INVESTIMENTO':'APORTE_INVESTIMENTO',impactoReceita:0,impactoDespesa:0,ignorarResumo:true,revisar:false,pagamentoFaturaPendente:false,pagamentoFaturaStatus:null}}else if(cat==='Consórcio'){z={...z,natureza:'PARCELA_CONSORCIO',impactoReceita:0,impactoDespesa:t.tipo==='saida'?Math.abs(Number(t.valor||0)):0,ignorarResumo:false,revisar:false}}else if(cat==='Financiamento'){z={...z,natureza:'PARCELA_FINANCIAMENTO',impactoReceita:0,impactoDespesa:t.tipo==='saida'?Math.abs(Number(t.valor||0)):0,ignorarResumo:false,revisar:false}}else if(cat!=='Cartão'&&z.pagamentoFaturaPendente){z={...z,pagamentoFaturaPendente:false,pagamentoFaturaStatus:null}}return z});return integrarDerivados({...f,transacoes:tx})});`;
        out=out.replace(editarAntigo,editarNovo);changed=true;
      }

      // Todo aporte/resgate reconhecido deve alimentar a area de investimentos, mesmo quando veio de extrato.
      const filtroInv="todas.filter(t=>t.tipoDocumentoImportado==='investimentos').forEach(t=>{";
      if(out.includes(filtroInv)){
        out=out.replace(filtroInv,"todas.filter(t=>t.tipoDocumentoImportado==='investimentos'||['APORTE_INVESTIMENTO','RESGATE_INVESTIMENTO'].includes(t.natureza)).forEach(t=>{");changed=true;
      }

      // 3) Helpers para resolver pagamento de fatura sem IA e fazer conciliacao automatica apenas
      // quando o total da fatura detalhada bate exatamente com um unico pagamento provisório.
      const preparar="async function preparar(file){";
      if(out.includes(preparar)&&!out.includes('const resolverPagamentoFatura=')){
        const helpers=`const resolverPagamentoFatura=async(id,acao)=>{try{const base={...fin,transacoes:(fin.transacoes||[]).map(t=>{if(t.id!==id)return t;if(acao==='manter')return{...t,natureza:'PAGAMENTO_FATURA_SEM_DETALHE',pagamentoFaturaPendente:false,pagamentoFaturaStatus:'confirmado_sem_fatura',impactoReceita:0,impactoDespesa:Math.abs(Number(t.valor||0)),ignorarResumo:false,observacaoAutomatica:'Mantido como despesa porque a fatura detalhada não será importada.'};if(acao==='aguardar')return{...t,natureza:'PAGAMENTO_FATURA_PENDENTE',pagamentoFaturaPendente:true,pagamentoFaturaStatus:'aguardando_fatura',impactoReceita:0,impactoDespesa:Math.abs(Number(t.valor||0)),ignorarResumo:false,observacaoAutomatica:'Mantido provisoriamente como despesa até a fatura detalhada ser importada.'};return{...t,natureza:'PAGAMENTO_FATURA',pagamentoFaturaPendente:false,pagamentoFaturaStatus:'fatura_importada',impactoReceita:0,impactoDespesa:0,ignorarResumo:true,observacaoAutomatica:'Pagamento retirado das despesas porque a fatura detalhada já está contabilizada.'}})};const next=integrarDerivados(base);await salvarFinanceiroConfirmado(next);aviso(acao==='retirar'?'Pagamento de fatura retirado do total.':acao==='aguardar'?'Pagamento mantido provisoriamente até a fatura ser importada.':'Pagamento mantido como despesa.')}catch(e){aviso(e.message||'Não consegui atualizar o pagamento da fatura.')}};\n const aplicarMatchFatura=(base,novas)=>{const tx=[...(base.transacoes||[])],grupos=new Map();(novas||[]).filter(t=>t.tipoDocumentoImportado==='fatura_cartao'&&!t.ignorarResumo&&Number(t.impactoDespesa||0)>0).forEach(t=>{const m=t.competenciaAnalitica||mes(t.data);grupos.set(m,(grupos.get(m)||0)+Number(t.impactoDespesa||0))});for(const[m,total]of grupos){const candidatos=tx.map((t,i)=>({t,i})).filter(({t})=>(t.competenciaAnalitica||mes(t.data))===m&&t.pagamentoFaturaPendente&&Math.abs(Number(t.valor||0)-total)<0.02);if(candidatos.length===1){const i=candidatos[0].i,t=tx[i];tx[i]={...t,natureza:'PAGAMENTO_FATURA',pagamentoFaturaPendente:false,pagamentoFaturaStatus:'fatura_importada_auto',impactoReceita:0,impactoDespesa:0,ignorarResumo:true,observacaoAutomatica:'Pagamento conciliado automaticamente porque o valor bateu exatamente com a fatura detalhada importada.'}}}return integrarDerivados({...base,transacoes:tx})};\n `;
        out=out.replace(preparar,helpers+preparar);changed=true;
      }

      // Protege o pagamento provisório durante o processamento do CSV.
      const proc="const processados=itens.map(t=>corrigirLegado(classificarPorDocumento(t))).map(t=>";
      if(out.includes(proc)){
        out=out.replace(proc,"const processados=itens.map(t=>{const z=classificarPorDocumento(t);return z.pagamentoFaturaPendente?z:corrigirLegado(z)}).map(t=>");changed=true;
      }

      // Ao importar uma fatura, tenta retirar o pagamento bancário somente se houver match exato e único.
      const depoisNovoFin="importacaoPendente:null});const confirmacao=await salvarFinanceiroRemoto(novoFin);";
      if(out.includes(depoisNovoFin)){
        out=out.replace(depoisNovoFin,"importacaoPendente:null});if(tipoImportacao==='fatura_cartao')novoFin=aplicarMatchFatura(novoFin,novas);const confirmacao=await salvarFinanceiroRemoto(novoFin);");
        out=out.replace("const novoFin=integrarDerivados(","let novoFin=integrarDerivados(");
        changed=true;
      }

      // 4) Métricas conectadas: resultado operacional, destino para investimento e caixa acumulado.
      const resultado="resultado=receita-despesa;";
      if(out.includes(resultado)&&!out.includes('const aportesMes=')){
        const metricas=`resultado=receita-despesa;\n const aportesMes=doMes.filter(t=>t.natureza==='APORTE_INVESTIMENTO').reduce((a,t)=>a+Number(t.valor||0),0),resgatesMes=doMes.filter(t=>t.natureza==='RESGATE_INVESTIMENTO').reduce((a,t)=>a+Number(t.valor||0),0),destinadoInvestimentosMes=Math.max(0,aportesMes-resgatesMes),disponivelDestinarMes=Math.max(0,resultado-destinadoInvestimentosMes+resgatesMes);\n const resultadoAcumulado=ts.reduce((a,t)=>a+Number(t.impactoReceita??(!t.ignorarResumo&&t.tipo==='entrada'?t.valor:0))-Number(t.impactoDespesa??(!t.ignorarResumo&&t.tipo==='saida'?t.valor:0)),0),aportesAcumulados=ts.filter(t=>t.natureza==='APORTE_INVESTIMENTO').reduce((a,t)=>a+Number(t.valor||0),0),resgatesAcumulados=ts.filter(t=>t.natureza==='RESGATE_INVESTIMENTO').reduce((a,t)=>a+Number(t.valor||0),0),caixaLivreAcumulado=resultadoAcumulado-aportesAcumulados+resgatesAcumulados;\n const pendentesFaturaMes=doMes.filter(t=>t.pagamentoFaturaPendente);\n const reservaLiquidaTotal=(fin.investimentos||[]).filter(i=>/diária|diaria|imediata|d\\+0|alta/i.test(String(i.liquidez||''))).reduce((a,i)=>a+Number(i.valorAtual||i.valorAplicado||0),0),investimentosMenosLiquidos=Math.max(0,totalInv-reservaLiquidaTotal),patrimonioEmFormacao=(fin.ativos||[]).filter(a=>['Consórcio','Financiamento'].includes(a.tipo)).reduce((s,a)=>s+Number(a.valorPago||0),0);`;
        out=out.replace(resultado,metricas);changed=true;
      }

      // Bloco visual de fluxo + perguntas de pagamento de fatura.
      const antesInvestimentos="<Card onClick={()=>setTela('investimentos')} style={{marginTop:12,cursor:'pointer',background:'linear-gradient(135deg,#F3EEFF,#fff)'}}>";
      if(out.includes(antesInvestimentos)&&!out.includes('Disponível para destinar')){
        const bloco=`<Card style={{marginTop:12,background:'#FAFCFB'}}><b>Fluxo do mês</b><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}><div><small>Resultado operacional</small><b style={{display:'block'}}>{formatoMoeda(resultado)}</b></div><div><small>Destinado a investimentos</small><b style={{display:'block'}}>{formatoMoeda(destinadoInvestimentosMes)}</b></div><div><small>Disponível para destinar</small><b style={{display:'block',color:'#15803D'}}>{formatoMoeda(disponivelDestinarMes)}</b></div><div><small>Caixa acumulado*</small><b style={{display:'block'}}>{formatoMoeda(caixaLivreAcumulado)}</b></div></div><div style={{fontSize:9,color:C.ink3,marginTop:8}}>*Acumulado calculado apenas com os dados já importados na ZOE. Aporte em investimento movimenta patrimônio, não vira despesa.</div></Card>{pendentesFaturaMes.length>0&&<Card style={{marginTop:10,background:'#FFF7ED',border:'1px solid #FED7AA'}}><b style={{color:'#9A3412'}}>Pagamento de fatura para confirmar</b><div style={{fontSize:11,color:C.ink2,marginTop:4}}>Enquanto você não decidir, o valor continua nas despesas para não subestimar a saída de caixa.</div>{pendentesFaturaMes.map(t=><div key={t.id} style={{padding:'10px 0',borderBottom:'1px solid #FED7AA'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><div><b style={{fontSize:11}}>{t.descricao}</b><div style={{fontSize:9,color:C.ink3}}>{fmtData(t.data)} • {t.conta}</div></div><b style={{fontSize:11}}>{formatoMoeda(t.valor)}</b></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}><button onClick={()=>resolverPagamentoFatura(t.id,'manter')} style={{border:'1px solid #FED7AA',background:'#fff',borderRadius:9,padding:8,fontSize:9,fontWeight:700}}>Não vou importar • manter</button><button onClick={()=>resolverPagamentoFatura(t.id,'aguardar')} style={{border:'1px solid #FCD34D',background:'#FFFBEB',borderRadius:9,padding:8,fontSize:9,fontWeight:700}}>Vou importar • aguardar</button></div><button onClick={()=>resolverPagamentoFatura(t.id,'retirar')} style={{width:'100%',border:'1px solid #C7D2FE',background:'#EEF2FF',color:'#4338CA',borderRadius:9,padding:8,fontSize:9,fontWeight:700,marginTop:6}}>A fatura já está contabilizada • retirar do total</button>{t.pagamentoFaturaStatus==='aguardando_fatura'&&<div style={{fontSize:9,color:'#92400E',marginTop:5}}>Mantido provisoriamente como despesa até a fatura detalhada entrar.</div>}</div>)}</Card>}<Card style={{marginTop:10}}><b>Patrimônio conectado</b><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginTop:9}}><div><small>Reserva líquida</small><b style={{display:'block'}}>{formatoMoeda(reservaLiquidaTotal)}</b></div><div><small>Investimentos</small><b style={{display:'block'}}>{formatoMoeda(investimentosMenosLiquidos)}</b></div><div><small>Patrimônio em formação</small><b style={{display:'block'}}>{formatoMoeda(patrimonioEmFormacao)}</b></div></div><div style={{fontSize:9,color:C.ink3,marginTop:7}}>Consórcio e financiamento ficam separados de investimentos líquidos.</div></Card>`;
        out=out.replace(antesInvestimentos,bloco+antesInvestimentos);changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-fluxo-patrimonial-v3] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
