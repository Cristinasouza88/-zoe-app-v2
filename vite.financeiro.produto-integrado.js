export default function financeiroProdutoIntegrado(){
  return {
    name:'zoe-financeiro-produto-integrado',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      // Tipo do documento: contexto forte antes de qualquer uso de IA.
      const pronto=" const [finRemotoPronto,setFinRemotoPronto]=useState(false);";
      if(out.includes(pronto)&&!out.includes("const [tipoImportacao,setTipoImportacao]")){
        out=out.replace(pronto,pronto+"\n const [tipoImportacao,setTipoImportacao]=useState('extrato_bancario');");
        changed=true;
      }

      // Helpers de contexto, derivacao patrimonial e gerenciamento de dados.
      const preparar="async function preparar(file){";
      if(out.includes(preparar)&&!out.includes('const classificarPorDocumento=')){
        const helpers=`const ROTULOS_IMPORTACAO={extrato_bancario:'Extrato bancário',fatura_cartao:'Fatura de cartão',investimentos:'Investimentos',consorcio_financiamento:'Consórcio / financiamento',categorizado:'Planilha já categorizada'};\n const classificarPorDocumento=t=>{const doc=tipoImportacao||'extrato_bancario',txt=norm(\`${t.descricao||''} ${t.natureza||''} ${t.conta||''}\`);let x={...t,tipoDocumentoImportado:doc};if(doc==='fatura_cartao'){if(x.tipo==='entrada'){if(/pagamento.*fatura|pagamento recebido|pagamento efetuado/.test(txt))return{...x,categoria:'Cartão',natureza:'PAGAMENTO_FATURA',impactoReceita:0,impactoDespesa:0,ignorarResumo:true,revisar:false};return{...regras({...x,categoria:/estorno|reembolso|devolucao/.test(txt)?'Reembolso':x.categoria}),tipoDocumentoImportado:doc,natureza:'ESTORNO_REEMBOLSO',impactoReceita:0,impactoDespesa:-Math.abs(Number(x.valor||0)),ignorarResumo:false}}const z=regras({...x,tipo:'saida',natureza:'COMPRA_CARTAO'});return{...z,tipoDocumentoImportado:doc,natureza:'COMPRA_CARTAO',impactoReceita:0,impactoDespesa:Math.abs(Number(x.valor||0)),ignorarResumo:false}}if(doc==='investimentos'){const z=regras(x),entrada=x.tipo==='entrada';return{...z,tipoDocumentoImportado:doc,categoria:'Investimentos',natureza:entrada?'RESGATE_INVESTIMENTO':'APORTE_INVESTIMENTO',impactoReceita:0,impactoDespesa:0,ignorarResumo:true,revisar:false}}if(doc==='consorcio_financiamento'){const financiamento=/financ|habitacao|credito imobiliario/.test(txt),cat=financiamento?'Financiamento':'Consórcio',z=regras({...x,categoria:cat});return{...z,tipoDocumentoImportado:doc,categoria:cat,natureza:financiamento?'PARCELA_FINANCIAMENTO':'PARCELA_CONSORCIO',impactoReceita:0,impactoDespesa:x.tipo==='saida'?Math.abs(Number(x.valor||0)):0,ignorarResumo:false,revisar:false}}return{...regras(x),tipoDocumentoImportado:doc}};\n const infoParcela=desc=>{const s=String(desc||'');const m=s.match(/(?:parcela\\s*)?(\\d{1,3})\\s*(?:\\/|de)\\s*(\\d{1,3})/i);if(!m)return null;const atual=Number(m[1]),total=Number(m[2]);return atual>0&&total>=atual?{atual,total}:null};\n const nomeBaseContrato=t=>String(t.descricao||t.conta||t.origemDocumento||'Contrato').replace(/(?:parcela\\s*)?\\d{1,3}\\s*(?:\\/|de)\\s*\\d{1,3}/ig,'').replace(/\\bparcela\\b/ig,'').replace(/\\s{2,}/g,' ').trim().slice(0,70)||'Contrato';\n const integrarDerivados=base=>{const todas=base.transacoes||[];const movimentos=todas.filter(t=>['APORTE_INVESTIMENTO','RESGATE_INVESTIMENTO'].includes(t.natureza)||t.tipoDocumentoImportado==='investimentos').map(t=>({id:'mov-'+(t.importKey||t.id),transacaoId:t.id,data:t.data,descricao:t.descricao,valor:t.valor,tipo:t.natureza==='RESGATE_INVESTIMENTO'||t.tipo==='entrada'?'resgate':'aporte',conta:t.conta,origemDocumento:t.origemDocumento}));const investimentosManuais=(base.investimentos||[]).filter(x=>!x.autoImportado);const gruposInv=new Map();todas.filter(t=>t.tipoDocumentoImportado==='investimentos').forEach(t=>{const k=norm(\`${t.origemDocumento||''}|${t.conta||''}\`),g=gruposInv.get(k)||{nome:String(t.origemDocumento||'Investimentos').replace(/\\.[^.]+$/,''),instituicao:t.conta||'',aportes:0,resgates:0};if(t.tipo==='entrada')g.resgates+=Number(t.valor||0);else g.aportes+=Number(t.valor||0);gruposInv.set(k,g)});const investimentosAuto=[...gruposInv.entries()].map(([k,g])=>{const liquido=Math.max(0,g.aportes-g.resgates);return{id:'inv-auto-'+k.slice(0,36),nome:g.nome,instituicao:g.instituicao,tipo:'Importado',valorAplicado:liquido,valorAtual:liquido,liquidez:'A confirmar',autoImportado:true,dadosIncompletos:true,observacoes:'Valor estimado pelas movimentações importadas; confirme o saldo atual do investimento.'}});const ativosManuais=(base.ativos||[]).filter(x=>!x.autoImportado);const gruposContrato=new Map();todas.filter(t=>t.categoria==='Consórcio'||t.categoria==='Financiamento'||['PARCELA_CONSORCIO','PARCELA_FINANCIAMENTO'].includes(t.natureza)).forEach(t=>{const nome=nomeBaseContrato(t),tipo=t.categoria==='Financiamento'||t.natureza==='PARCELA_FINANCIAMENTO'?'Financiamento':'Consórcio',k=norm(tipo+'|'+nome),g=gruposContrato.get(k)||{nome,tipo,instituicao:t.conta||'',itens:[]};g.itens.push(t);gruposContrato.set(k,g)});const ativosAuto=[...gruposContrato.entries()].map(([k,g])=>{const itens=[...g.itens].sort((a,b)=>String(a.data).localeCompare(String(b.data))),pagos=itens.filter(t=>t.tipo==='saida').reduce((a,t)=>a+Number(t.valor||0),0),ultimo=itens[itens.length-1],parcela=Number(ultimo?.valor||0),infos=itens.map(t=>infoParcela(t.descricao)).filter(Boolean),info=infos.length?infos[infos.length-1]:null,restantes=info?Math.max(0,info.total-info.atual):'',saldo=info&&parcela?parcela*restantes:0;return{id:'ativo-auto-'+k.slice(0,34),nome:g.nome,tipo:g.tipo,instituicao:g.instituicao,valorAtual:pagos,valorPago:pagos,saldoDevedor:saldo,parcela,parcelasRestantes:restantes,diaVencimento:'',autoImportado:true,dadosIncompletos:true,observacoes:info?'Criado automaticamente. Parcelas e saldo a quitar são estimados pela descrição e pelo último valor importado; confirme os dados do contrato.':'Contrato detectado automaticamente. Complete total de parcelas, saldo a quitar e vencimento.'}});return{...base,movimentosPatrimoniais:movimentos,investimentos:[...investimentosManuais,...investimentosAuto],ativos:[...ativosManuais,...ativosAuto]}};\n const salvarFinanceiroConfirmado=async next=>{const conf=await salvarFinanceiroRemoto(next);if(!conf?.ok||Number(conf.transacoes)!==(next.transacoes||[]).length)throw new Error('O servidor não confirmou a alteração do Financeiro.');up(s=>({...s,financeiro:next}));return true};\n const apagarMesFinanceiro=async m=>{if(!m)return;if(!window.confirm('Apagar todos os lançamentos de '+mesLabel(m)+'? Esta ação não pode ser desfeita.'))return;try{const base={...fin,transacoes:(fin.transacoes||[]).filter(t=>(t.competenciaAnalitica||mes(t.data))!==m),documentos:(fin.documentos||[]).filter(x=>x.mes!=='multiplos'&&x.mes!==m),importacoesConciliadas:(fin.importacoesConciliadas||[]).filter(x=>x.mes!=='multiplos'&&x.mes!==m),importacaoPendente:null};const next=integrarDerivados(base);await salvarFinanceiroConfirmado(next);setSheet(null);aviso(mesLabel(m)+' apagado. Você pode importar esse mês novamente.')}catch(e){aviso(e.message||'Não consegui apagar o mês.')}};\n const apagarLancamentosFinanceiros=async()=>{if(!window.confirm('Apagar todos os lançamentos importados? Metas e cadastros manuais serão preservados.'))return;try{const next=integrarDerivados({...fin,transacoes:[],documentos:[],importacoesConciliadas:[],importacaoPendente:null,movimentosPatrimoniais:[]});await salvarFinanceiroConfirmado(next);setSheet(null);aviso('Todos os lançamentos foram apagados.')}catch(e){aviso(e.message||'Não consegui apagar os lançamentos.')}};\n const resetarFinanceiroCompleto=async()=>{const ok=window.prompt('Para redefinir todo o Financeiro, digite APAGAR');if(ok!=='APAGAR')return;try{const next={...vazio,liquidezAtual:0,transacoes:[],investimentos:[],ativos:[],compromissos:[],metas:[],documentos:[],importacoesConciliadas:[],importacaoPendente:null,movimentosPatrimoniais:[]};await salvarFinanceiroConfirmado(next);setSheet(null);aviso('Financeiro redefinido completamente.')}catch(e){aviso(e.message||'Não consegui redefinir o Financeiro.')}};\n const exportarFinanceiro=()=>{try{const blob=new Blob([JSON.stringify({exportadoEm:new Date().toISOString(),financeiro:fin},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='zoe-financeiro-'+hoje()+'.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);aviso('Dados financeiros exportados.')}catch(e){aviso('Não consegui exportar os dados.')}};\n `;
        out=out.replace(preparar,helpers+preparar);
        changed=true;
      }

      // Fecha a folha de seleção ao começar e usa o tipo do documento para reduzir IA.
      const inicioPrep="async function preparar(file){if(!file)return;if(!finRemotoPronto)return aviso('Aguarde o Financeiro terminar de carregar antes de importar.');setProcessando(true);try{let itens=await lerCsv(file);const lidas=itens.length;";
      if(out.includes(inicioPrep)){
        out=out.replace(inicioPrep,"async function preparar(file){if(!file)return;if(!finRemotoPronto)return aviso('Aguarde o Financeiro terminar de carregar antes de importar.');setSheet(null);setProcessando(true);try{let itens=(await lerCsv(file)).map(classificarPorDocumento);const lidas=itens.length;");
        changed=true;
      }

      const descAntigo="const desc=[...new Set(itens.filter(t=>t.categoria==='Outros').map(t=>norm(t.descricao)).filter(Boolean))].slice(0,500);";
      if(out.includes(descAntigo)){
        out=out.replace(descAntigo,"const usarIA=tipoImportacao==='extrato_bancario'||tipoImportacao==='fatura_cartao';const desc=usarIA?[...new Set(itens.filter(t=>t.categoria==='Outros').map(t=>norm(t.descricao)).filter(Boolean))].slice(0,120):[];");
        changed=true;
      }

      const iaRegra="regras({...t,categoria:m.get(norm(t.descricao)),confianca:'INFERIDO'})";
      if(out.includes(iaRegra)){
        out=out.split(iaRegra).join("classificarPorDocumento({...t,categoria:m.get(norm(t.descricao)),confianca:'INFERIDO'})");
        changed=true;
      }

      const procAntigo="const processados=itens.map(t=>corrigirLegado(regras(t))).map(t=>";
      if(out.includes(procAntigo)){
        out=out.replace(procAntigo,"const processados=itens.map(t=>corrigirLegado(classificarPorDocumento(t))).map(t=>");
        changed=true;
      }

      const keyAntigo="const baseKey=t=>[t.data,norm(t.descricao),Number(t.valor||0).toFixed(2),t.tipo,norm(t.conta),norm(t.origemDocumento||file.name)].join('|');";
      if(out.includes(keyAntigo)){
        out=out.replace(keyAntigo,"const baseKey=t=>[tipoImportacao,t.data,norm(t.descricao),Number(t.valor||0).toFixed(2),t.tipo,norm(t.conta),norm(t.origemDocumento||file.name)].join('|');");
        changed=true;
      }

      // Depois de importar, deriva automaticamente movimentos patrimoniais, investimentos e contratos detectados.
      const novoFinRx=/const novoFin=\{\.\.\.fin,transacoes:\[\.\.\.\(fin\.transacoes\|\|\[\]\),\.\.\.novas\],documentos:\[\.\.\.\(fin\.documentos\|\|\[\]\),\{id:uid\('doc'\),nome:file\.name,mes:'multiplos',itens:novas\.length,data:hoje\(\),automatico:true\}\],importacoesConciliadas:\[\.\.\.\(fin\.importacoesConciliadas\|\|\[\]\),\{arquivo:file\.name,mes:'multiplos',itens:novas\.length,data:hoje\(\),automatico:true\}\],importacaoPendente:null\};/;
      if(novoFinRx.test(out)){
        out=out.replace(novoFinRx,"const novoFin=integrarDerivados({...fin,transacoes:[...(fin.transacoes||[]),...novas],documentos:[...(fin.documentos||[]),{id:uid('doc'),nome:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true,tipoDocumento:tipoImportacao}],importacoesConciliadas:[...(fin.importacoesConciliadas||[]),{arquivo:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true,tipoDocumento:tipoImportacao}],importacaoPendente:null});");
        changed=true;
      }

      // Importar abre primeiro a escolha do tipo de documento, em vez de chamar o arquivo direto.
      const importCardRx=/<Card onClick=\{\(\)=>finRemotoPronto&&input\.current\?\.click\(\)\} style=\{\{cursor:finRemotoPronto\?'pointer':'wait',opacity:finRemotoPronto\?1:\.6\}\}><Upload\/><b style=\{\{display:'block',marginTop:8\}\}>\{finRemotoPronto\?'Importar':'Carregando\.\.\.'\}<\/b><small>Preencher todos os meses<\/small><\/Card>/;
      if(importCardRx.test(out)){
        out=out.replace(importCardRx,"<Card onClick={()=>finRemotoPronto&&setSheet({tipo:'importarDocumento'})} style={{cursor:finRemotoPronto?'pointer':'wait',opacity:finRemotoPronto?1:.6}}><Upload/><b style={{display:'block',marginTop:8}}>{finRemotoPronto?'Importar':'Carregando...'}</b><small>Escolha o tipo do documento</small></Card>");
        changed=true;
      }

      // Gerenciamento de dados fica acessível no resumo.
      const inputTag='<input ref={input} type="file" accept=".csv,text/csv" onChange={e=>preparar(e.target.files?.[0])} style={{display:\'none\'}}/>';
      if(out.includes(inputTag)&&!out.includes('Gerenciar dados financeiros')){
        const manage="<Card onClick={()=>setSheet({tipo:'gerenciarDados',mesSelecionado:mesRef})} style={{marginTop:10,cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><b>Gerenciar dados financeiros</b><div style={{fontSize:11,color:C.ink3,marginTop:3}}>Exportar, apagar um mês ou recomeçar</div></div><ChevronRight size={16} color={C.ink3}/></div></Card>";
        out=out.replace(inputTag,inputTag+manage);
        changed=true;
      }

      // Títulos das novas folhas.
      const tituloFim="sheet?.tipo==='detalheAtivo'?sheet?.ativo?.nome:(sheet?.tipo==='lancamentos'||sheet?.tipo==='despesasResumo')?sheet?.titulo:''";
      if(out.includes(tituloFim)){
        out=out.replace(tituloFim,"sheet?.tipo==='detalheAtivo'?sheet?.ativo?.nome:(sheet?.tipo==='lancamentos'||sheet?.tipo==='despesasResumo')?sheet?.titulo:sheet?.tipo==='importarDocumento'?'Importar dados':sheet?.tipo==='gerenciarDados'?'Gerenciar dados':''");
        changed=true;
      }

      // Conteúdo das folhas: importação contextual e gerenciamento de dados.
      const sheetInicio="{sheet?.tipo==='metaLiquidez'&&<>";
      if(out.includes(sheetInicio)&&!out.includes("sheet?.tipo==='importarDocumento'&&")){
        const novasSheets=`{sheet?.tipo==='importarDocumento'&&<><div style={{fontSize:12,color:C.ink2,marginBottom:12}}>Diga à ZOE o que este arquivo representa. Isso reduz ambiguidades e evita usar IA onde uma regra simples resolve.</div><Select label="Tipo do documento" value={tipoImportacao} onChange={e=>setTipoImportacao(e.target.value)}><option value="extrato_bancario">Extrato bancário</option><option value="fatura_cartao">Fatura de cartão</option><option value="investimentos">Investimentos</option><option value="consorcio_financiamento">Consórcio / financiamento</option><option value="categorizado">Planilha já categorizada</option></Select><Card style={{background:'#F7F8FA',marginBottom:12}}><div style={{fontSize:11,color:C.ink2}}>{tipoImportacao==='extrato_bancario'?'Entradas, Pix, boletos, transferências e pagamentos. A IA só é consultada para descrições que continuarem em Outros.':tipoImportacao==='fatura_cartao'?'Compras entram como despesas do cartão; pagamento da própria fatura não entra duas vezes no gasto.':tipoImportacao==='investimentos'?'Movimentações vão para patrimônio e não viram despesa de consumo. A IA não é usada.':tipoImportacao==='consorcio_financiamento'?'Parcelas alimentam Ativos e, quando a descrição traz algo como 5/45, a ZOE estima quantas faltam.':'A ZOE respeita as categorias existentes no arquivo e não usa IA para recategorizar.'}</div></Card><Btn onClick={()=>input.current?.click()} style={{width:'100%'}}>Selecionar CSV</Btn></>}{sheet?.tipo==='gerenciarDados'&&<><Btn onClick={exportarFinanceiro} style={{width:'100%',marginBottom:10}}>Exportar meus dados</Btn><Card style={{marginBottom:10}}><b>Apagar dados de um mês</b><div style={{fontSize:11,color:C.ink3,margin:'4px 0 10px'}}>Remove somente as movimentações daquele mês e permite importar novamente.</div><select value={sheet?.mesSelecionado||mesRef} onChange={e=>setSheet(s=>({...s,mesSelecionado:e.target.value}))} style={{width:'100%',padding:11,borderRadius:10,border:'1px solid '+C.line,background:'#fff',marginBottom:9}}>{[...new Set((fin.transacoes||[]).map(t=>t.competenciaAnalitica||mes(t.data)).filter(Boolean))].sort().reverse().map(m=><option key={m} value={m}>{mesLabel(m)}</option>)}</select><button onClick={()=>apagarMesFinanceiro(sheet?.mesSelecionado||mesRef)} disabled={!(fin.transacoes||[]).length} style={{width:'100%',border:'1px solid #FECACA',background:'#FEF2F2',color:'#B91C1C',borderRadius:10,padding:10,fontWeight:800}}>Apagar mês selecionado</button></Card><Card style={{marginBottom:10}}><b>Apagar todos os lançamentos</b><div style={{fontSize:11,color:C.ink3,margin:'4px 0 10px'}}>Mantém metas, investimentos e ativos cadastrados manualmente.</div><button onClick={apagarLancamentosFinanceiros} style={{width:'100%',border:'1px solid #FECACA',background:'#FEF2F2',color:'#B91C1C',borderRadius:10,padding:10,fontWeight:800}}>Apagar lançamentos</button></Card><Card style={{background:'#FFF7ED'}}><b>Redefinir Financeiro completamente</b><div style={{fontSize:11,color:C.ink3,margin:'4px 0 10px'}}>Apaga movimentações, metas, investimentos, ativos e compromissos. Exige digitar APAGAR.</div><button onClick={resetarFinanceiroCompleto} style={{width:'100%',border:'1px solid #FDBA74',background:'#FFF7ED',color:'#9A3412',borderRadius:10,padding:10,fontWeight:800}}>Redefinir tudo</button></Card></>}`;
        out=out.replace(sheetInicio,novasSheets+sheetInicio);
        changed=true;
      }

      // Investimentos passa a mostrar as movimentações patrimoniais detectadas em qualquer extrato.
      const ativosTitle="</Card>{title('Ativos patrimoniais'";
      if(out.includes(ativosTitle)&&!out.includes("title('Movimentações detectadas')")){
        const mov=`</Card>{(fin.movimentosPatrimoniais||[]).length>0&&<>{title('Movimentações detectadas')}<Card>{(fin.movimentosPatrimoniais||[]).slice(-8).reverse().map(m=><div key={m.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid '+C.line}}><div><b style={{fontSize:11}}>{m.descricao}</b><div style={{fontSize:9,color:C.ink3}}>{fmtData(m.data)} • {m.conta||'—'} • {m.tipo}</div></div><b style={{fontSize:11}}>{formatoMoeda(m.valor)}</b></div>)}</Card></>}{title('Ativos patrimoniais'`;
        out=out.replace(ativosTitle,mov);
        changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-produto-integrado] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
