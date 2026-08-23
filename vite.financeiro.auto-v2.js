export default function financeiroAutoV2(){
  return {
    name:'zoe-financeiro-auto-v2',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code, changed=false;

      const prepareMarker=' async function preparar(file)';
      if(out.includes(prepareMarker)&&!out.includes('const zoeAutoOk=')){
        const helpers=` const zoeAutoOk=t=>!t?.revisar&&!t?.duplicado&&!t?.possivelDuplicado&&!t?.possivelPagamentoFatura&&!!t?.categoria&&t.categoria!=='Outros';
 const zoeRegistrarAutomaticos=(itens,arquivo)=>{if(!itens?.length)return;atualiza(f=>{const vistos=new Set((f.transacoes||[]).map(chave));const novas=(itens||[]).map(regras).filter(t=>{const k=chave(t);if(vistos.has(k))return false;vistos.add(k);return true});if(!novas.length)return f;return{...f,transacoes:[...(f.transacoes||[]),...novas],documentos:[...(f.documentos||[]),{id:uid('doc-auto'),nome:arquivo,mes:'auto',itens:novas.length,data:hoje(),automatico:true}],importacoesConciliadas:[...(f.importacoesConciliadas||[]),{arquivo,mes:'auto',itens:novas.length,data:hoje(),automatico:true}]}})};
 const zoeDetectarPatrimonio=t=>{const s=norm((t?.descricao||'')+' '+(t?.categoria||'')+' '+(t?.subcategoria||'')+' '+(t?.conta||''));const valor=Math.abs(Number(t?.valor||0));let grupo='',tipo='',nome=t?.descricao||'',instituicao='';if(/consorcio/.test(s)){grupo='ativos';tipo='Consórcio'}else if(/financiamento|habitacao|parcela.*imovel|prestacao.*imovel/.test(s)){grupo='ativos';tipo='Financiamento'}else if(t?.natureza==='APORTE_INVESTIMENTO'||/tesouro|cdb|lci|lca|fundo|aplicacao|investimento|corretora|renda fixa|renda variavel|acao|acoes|etf/.test(s)){grupo='investimentos';tipo='Investimento'}else return null;if(/c6/.test(s))instituicao='C6 Bank';else if(/inter/.test(s))instituicao='Banco Inter';else if(/nubank/.test(s))instituicao='Nubank';else if(/itau/.test(s))instituicao='Itaú';else if(/bradesco/.test(s))instituicao='Bradesco';else if(/santander/.test(s))instituicao='Santander';return{grupo,tipo,nome:nome||tipo,instituicao,valor,data:t?.data,transacaoId:t?.id}};
 const zoeRegistrarPatrimonio=itens=>{const movs=(itens||[]).map(zoeDetectarPatrimonio).filter(Boolean);if(!movs.length)return;atualiza(f=>{let ativos=[...(f.ativos||[])],investimentos=[...(f.investimentos||[])],hist=[...(f.movimentosPatrimoniais||[])];const vistos=new Set(hist.map(x=>x.transacaoId).filter(Boolean));movs.filter(m=>!vistos.has(m.transacaoId)).forEach(m=>{vistos.add(m.transacaoId);hist.push({...m,id:uid('mov-pat'),automatico:true});const lista=m.grupo==='ativos'?ativos:investimentos;const chaveNome=norm(m.nome+' '+m.instituicao);let i=lista.findIndex(a=>norm((a.nome||'')+' '+(a.instituicao||''))===chaveNome);if(i<0){lista.push({id:uid(m.grupo==='ativos'?'ativo':'inv'),nome:m.nome,tipo:m.tipo,instituicao:m.instituicao,valorAtual:0,valorPago:0,valorInvestido:0,valorTotal:null,saldoDevedor:null,parcelasRestantes:null,diaVencimento:'',observacoes:'Criado automaticamente pela importação. Complete os dados que não existem no extrato.',automatico:true});i=lista.length-1}const a={...lista[i]};if(m.grupo==='ativos'){a.valorPago=Number(a.valorPago||0)+m.valor;if(a.valorTotal!=null)a.saldoDevedor=Math.max(0,Number(a.valorTotal)-a.valorPago)}else{a.valorInvestido=Number(a.valorInvestido||0)+m.valor;a.valorAtual=Math.max(Number(a.valorAtual||0),a.valorInvestido)}a.ultimaAtualizacao=m.data;lista[i]=a});return{...f,ativos,investimentos,movimentosPatrimoniais:hist}})};
`;
        out=out.replace(prepareMarker,helpers+prepareMarker);changed=true;
      }

      const flow=/const meses=agrupa\(itens\);if\(!meses\.length\)throw Error\('Nenhum lançamento válido\.'\);const draft=\{arquivo:file\.name,meses,indice:0,etapa:'meses'\};importacaoMemoria=draft;setImp\(draft\);await salvarConciliacaoPendente\(draft\);atualiza\(f=>\(\{\.\.\.f,importacaoPendente:null\}\)\);setTela\('importacao'\)/;
      if(flow.test(out)&&out.includes('const zoeAutoOk=')){
        const novo=`const automaticos=itens.filter(zoeAutoOk);const pendentes=itens.filter(t=>!t.duplicado&&!zoeAutoOk(t));zoeRegistrarAutomaticos(automaticos,file.name);zoeRegistrarPatrimonio(automaticos);const meses=agrupa(pendentes);if(!meses.length){importacaoMemoria=null;setImp(null);await limparConciliacaoPendente();setTela('resumo');aviso(automaticos.length?\`A ZOE reconheceu e lançou automaticamente ${'${'}automaticos.length} lançamento(s). Nenhuma pendência ficou para conciliar.\`:'Nenhum lançamento novo para conciliar.');return}const draft={arquivo:file.name,meses,indice:0,etapa:'meses',automaticos:automaticos.length};importacaoMemoria=draft;setImp(draft);await salvarConciliacaoPendente(draft);atualiza(f=>({...f,importacaoPendente:null}));setTela('importacao');aviso(automaticos.length?\`${'${'}automaticos.length} lançamento(s) foram preenchidos automaticamente e ${'${'}pendentes.length} ficaram para conciliação.\`:'Somente os lançamentos incertos ficaram para conciliação.')`;
        out=out.replace(flow,novo);changed=true;
      }

      const gravar=' const gravarLancamentos=(itens,mesAlvo,parcial=false)=>{const novas=';
      if(out.includes(gravar)&&out.includes('const zoeRegistrarPatrimonio=')&&!out.includes('zoeRegistrarPatrimonio(itens);const novas=')){
        out=out.replace(gravar," const gravarLancamentos=(itens,mesAlvo,parcial=false)=>{zoeRegistrarPatrimonio(itens);const novas=");changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-auto-v2] nenhuma injecao aplicada');
      return changed?{code:out,map:null}:null;
    }
  };
}
