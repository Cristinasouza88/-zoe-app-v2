export default function financeiroFluxoPatrimonialV4(){
  return {
    name:'zoe-financeiro-fluxo-patrimonial-v4',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      // Evita depender de totalInv antes da declaracao dele no componente.
      const metricaAntiga="investimentosMenosLiquidos=Math.max(0,totalInv-reservaLiquidaTotal)";
      if(out.includes(metricaAntiga)){
        out=out.replace(metricaAntiga,"investimentosMenosLiquidos=Math.max(0,(fin.investimentos||[]).reduce((a,i)=>a+Number(i.valorAtual||i.valorAplicado||0),0)-reservaLiquidaTotal)");
        changed=true;
      }

      // Quando um aporte veio do extrato, o investimento deve ser identificado pela descricao
      // da movimentacao, e nao pelo nome do arquivo CSV/banco de origem.
      const grupoAntigo="const k=norm(`${t.origemDocumento||''}|${t.conta||''}`),g=gruposInv.get(k)||{nome:String(t.origemDocumento||'Investimentos').replace(/\\.[^.]+$/,''),instituicao:t.conta||'',aportes:0,resgates:0};";
      if(out.includes(grupoAntigo)){
        const grupoNovo="const origemInvest=t.tipoDocumentoImportado==='investimentos'?(t.origemDocumento||t.conta||'Investimentos'):(t.descricao||t.conta||'Investimento');const k=norm(`${origemInvest}|${t.conta||''}`),g=gruposInv.get(k)||{nome:String(origemInvest).replace(/\\.[^.]+$/,''),instituicao:t.conta||'',aportes:0,resgates:0};";
        out=out.replace(grupoAntigo,grupoNovo);
        changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-fluxo-patrimonial-v4] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
