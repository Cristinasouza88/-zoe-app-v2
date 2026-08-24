export default function financeiroMoedaFocus(){
  return {
    name:'zoe-financeiro-moeda-focus',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      // Evita desmontar/remontar os campos a cada tecla. Como Conteudo era um componente
      // criado dentro de trilhaFinanceiro, o React entendia uma nova identidade em cada render,
      // perdendo foco no iOS. Chamamos como função para preservar o input enquanto digita.
      if(out.includes('active&&<Conteudo/>')){
        out=out.replace(/active&&<Conteudo\/>/g,'active&&Conteudo()');
        changed=true;
      }
      if(out.includes('concluida&&<Conteudo/>')){
        out=out.replace(/concluida&&<Conteudo\/>/g,'concluida&&Conteudo()');
        changed=true;
      }

      // A moeda é parte do ponto zero do Financeiro.
      const draftAnchor="metaNome:fin.planoFinanceiro?.metaNome||'Reserva e patrimônio'";
      if(out.includes(draftAnchor)&&!out.includes("moeda:fin.planoFinanceiro?.moeda||'BRL'")){
        out=out.replace(draftAnchor,"moeda:fin.planoFinanceiro?.moeda||'BRL',"+draftAnchor);
        changed=true;
      }

      // Parser monetário tolerante a 10.000,50 / 10,000.50 / 10000,50 / 10000.50.
      const valorAntigo="const valorPlano=v=>Math.max(0,n(v));";
      if(out.includes(valorAntigo)){
        out=out.replace(valorAntigo,`const valorPlano=v=>{let s=String(v??'').trim().replace(/[^0-9,.-]/g,'');if(!s)return 0;const neg=s.startsWith('-');s=s.replace(/-/g,'');const c=s.lastIndexOf(','),p=s.lastIndexOf('.');if(c>=0&&p>=0){if(c>p)s=s.replace(/\\./g,'').replace(',','.');else s=s.replace(/,/g,'')}else if(c>=0){const a=s.split(',');s=a.length===2&&a[1].length<=2?a[0].replace(/\\./g,'')+'.'+a[1]:s.replace(/,/g,'')}else if(p>=0){const a=s.split('.');s=a.length===2&&a[1].length<=2?s:a.join('')}const x=Number(s);return Number.isFinite(x)?Math.max(0,neg?-x:x):0};`);
        changed=true;
      }

      // Formatação do Financeiro inteiro respeita a moeda escolhida na trilha.
      const manualAnchor="const [manual,setManual]=useState({data:hoje(),descricao:'',valor:'',tipo:'saida',categoria:'Outros',tagFinanceira:'NORMAL',conta:'Manual'});";
      if(out.includes(manualAnchor)&&!out.includes('const moedaBase=planoDraft?.moeda')){
        out=out.replace(manualAnchor,manualAnchor+`\n const moedaBase=planoDraft?.moeda||fin.planoFinanceiro?.moeda||'BRL';\n const formatoValor=v=>{try{return new Intl.NumberFormat('pt-BR',{style:'currency',currency:moedaBase,maximumFractionDigits:2}).format(Number(v||0))}catch{return 'R$ '+Number(v||0).toFixed(2).replace('.',',')}};`);
        changed=true;
      }
      if(out.includes('formatoMoeda(')&&out.includes('const formatoValor=')){
        out=out.replace(/formatoMoeda\(/g,'formatoValor(');
        changed=true;
      }

      // Primeiro passo: moeda + saldo com teclado numérico, sem spinner de input number.
      const saldoCampo='<Campo label="Saldo disponível atual" value={planoDraft.saldoInicial} onChange={e=>setPlanoDraft({...planoDraft,saldoInicial:e.target.value})}/>';
      if(out.includes(saldoCampo)){
        const novo=`<Select label="Moeda do Financeiro" value={planoDraft.moeda||'BRL'} onChange={e=>setPlanoDraft({...planoDraft,moeda:e.target.value})}><option value="BRL">Real brasileiro (R$)</option><option value="USD">Dólar americano (US$)</option><option value="EUR">Euro (€)</option><option value="GBP">Libra esterlina (£)</option></Select><Campo label="Saldo disponível atual" type="text" inputMode="decimal" autoComplete="off" placeholder={planoDraft.moeda==='USD'?'Ex.: 10000.00':'Ex.: 10000,00'} value={planoDraft.saldoInicial} onChange={e=>setPlanoDraft({...planoDraft,saldoInicial:e.target.value.replace(/[^0-9,.-]/g,'')})}/><div style={{fontSize:11,color:C.petroleo,fontWeight:800,margin:'-5px 0 10px'}}>Saldo informado: {formatoValor(valorPlano(planoDraft.saldoInicial))}</div>`;
        out=out.replace(saldoCampo,novo);
        changed=true;
      }

      // Campos de dinheiro da trilha usam teclado decimal, mas continuam texto controlado
      // para evitar as setas/spinner e o comportamento instável de number no Safari/iOS.
      const labels=['Receita mensal de referência','Despesas fixas aproximadas','Reserva líquida atual','Outros investimentos atuais','Patrimônio em formação','Dívidas atuais','Valor que quer alcançar','Aporte mensal desejado','Reserva mínima líquida'];
      for(const label of labels){
        const re=new RegExp(`<Campo label="${label}" value=\\{planoDraft\\.([A-Za-z]+)\\} onChange=\\{e=>setPlanoDraft\\(\\{\\.\\.\\.planoDraft,\\1:e\\.target\\.value\\}\\)\\}\\/>`,'g');
        out=out.replace(re,(m,key)=>{changed=true;return `<Campo label="${label}" type="text" inputMode="decimal" autoComplete="off" value={planoDraft.${key}} onChange={e=>setPlanoDraft({...planoDraft,${key}:e.target.value.replace(/[^0-9,.-]/g,'')})}/>`});
      }

      return changed?{code:out,map:null}:null;
    }
  };
}
