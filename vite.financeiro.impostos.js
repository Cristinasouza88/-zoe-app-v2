export default function financeiroImpostos(){
  return {
    name:'zoe-financeiro-impostos',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code;
      const antigo="['Impostos e Taxas',/simples nacional|imposto|taxa|das /]";
      const novo="['Impostos',/darf|das |simples nacional|receita federal|irpf|irpj|csll|inss|iss |iptu|tributo|imposto federal|imposto estadual|imposto municipal/]";
      if(out.includes(antigo)) out=out.replace(antigo,novo);
      out=out.replace("['Moradia','Mercado','Transporte','Saúde e Cuidados','Impostos e Taxas','Consórcio','Financiamento']","['Moradia','Mercado','Transporte','Saúde e Cuidados','Impostos','Impostos e Taxas','Consórcio','Financiamento']");
      return {code:out,map:null};
    }
  };
}
