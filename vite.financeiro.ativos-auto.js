export default function financeiroAtivosAuto(){
  return {
    name:'zoe-financeiro-ativos-auto',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;
      const marker=' async function preparar(file)';
      if(out.includes(marker)&&!out.includes('const detectarMovimentoPatrimonial=')){
        const helpers=` const detectarMovimentoPatrimonial=t=>{const s=norm((t?.descricao||'')+' '+(t?.categoria||'')+' '+(t?.subcategoria||'')+' '+(t?.conta||''));const v=Math.abs(Number(t?.valor||0));let tipo='',nome='',grupo='',instituicao='';if(/consorcio/.test(s)){tipo='CONSORCIO';grupo='Ativos';nome=(t?.descricao||'Consórcio').trim()}else if(/financiamento|parcela.*imovel|prestacao.*imovel|habitacao/.test(s)){tipo='IMOVEL_FINANCIADO';grupo='Ativos';nome=(t?.descricao||'Imóvel financiado').trim()}else if(/tesouro|cdb|lci|lca|fundo|aplicacao|investimento|corretora|renda fixa|renda variavel|acao|acoes|etf/.test(s)){tipo='INVESTIMENTO';grupo='Investimentos';nome=(t?.descricao||'Investimento').trim()}else if(t?.natureza==='APORTE_INVESTIMENTO'){tipo='INVESTIMENTO';grupo='Investimentos';nome=(t?.descricao||'Investimento').trim()}else return null;if(/c6/.test(s))instituicao='C6 Bank';else if(/inter/.test(s))instituicao='Banco Inter';else if(/nubank/.test(s))instituicao='Nubank';else if(/itau/.test(s))instituicao='Itaú';else if(/bradesco/.test(s))instituicao='Bradesco';else if(/santander/.test(s))instituicao='Santander';return{tipo,nome,grupo,instituicao,valor:v,data:t?.data,transacaoId:t?.id,competencia:t?.competenciaAnalitica||mes(t?.data),descricao:t?.descricao||'',automatico:true}};
 const registrarMovimentosPatrimoniais=itens=>{const movs=(itens||[]).map(detectarMovimentoPatrimonial).filter(Boolean);if(!movs.length)return;atualiza(f=>{const hist=[...(f.movimentosPatrimoniais||[])],vistos=new Set(hist.map(x=>x.transacaoId||[x.data,x.valor,x.nome].join('|')));const novos=movs.filter(x=>{const k=x.transacaoId||[x.data,x.valor,x.nome].join('|');if(vistos.has(k))return false;vistos.add(k);return true});if(!novos.length)return f;let ativos=[...(f.ativos||[])],investimentos=[...(f.investimentos||[])];novos.forEach(m=>{const lista=m.grupo==='Investimentos'?investimentos:ativos;const key=norm(m.nome+' '+m.instituicao);let idx=lista.findIndex(a=>norm((a.nome||'')+' '+(a.instituicao||''))===key);if(idx<0){const base={id:uid(m.grupo==='Investimentos'?'inv':'ativo'),nome:m.nome,tipo:m.tipo,instituicao:m.instituicao||'',valorAtual:0,valorInvestido:0,valorPago:0,saldoDevedor:null,valorTotal:null,vencimento:null,parcelasRestantes:null,observacoes:'Criado automaticamente a partir da importação. Revise valor total, saldo a quitar e vencimento.',automatico:true,ultimaAtualizacao:m.data};lista.push(base);idx=lista.length-1}const a={...lista[idx]};if(m.grupo==='Investimentos'){a.valorInvestido=Number(a.valorInvestido||0)+m.valor;a.valorAtual=Math.max(Number(a.valorAtual||0),Number(a.valorInvestido||0))}else{a.valorPago=Number(a.valorPago||0)+m.valor;if(a.valorTotal!=null)a.saldoDevedor=Math.max(0,Number(a.valorTotal||0)-a.valorPago)}a.ultimaAtualizacao=m.data;lista[idx]=a});return{...f,ativos,investimentos,movimentosPatrimoniais:[...hist,...novos]}})};
`;
        out=out.replace(marker,helpers+marker);changed=true;
      }
      const autoCall='gravarAutomaticos(automaticos,file.name);';
      if(out.includes(autoCall)&&out.includes('const registrarMovimentosPatrimoniais=')){
        out=out.replace(autoCall,autoCall+'registrarMovimentosPatrimoniais(automaticos);');changed=true;
      }
      const gravarMarker=' const gravarLancamentos=(itens,mesAlvo,parcial=false)=>{';
      if(out.includes(gravarMarker)&&out.includes('const registrarMovimentosPatrimoniais=')&&!out.includes("registrarMovimentosPatrimoniais(itens);const novas=(itens||[]).map(corrigirLegado)")){
        out=out.replace(gravarMarker,gravarMarker+'registrarMovimentosPatrimoniais(itens);');changed=true;
      }
      if(!changed)console.warn('[zoe-financeiro-ativos-auto] pontos de integração não encontrados; build mantido.');
      return changed?{code:out,map:null}:null;
    }
  };
}
