export const VERSAO_FINANCEIRO = 2;

export const MOEDAS = [
  {codigo:'BRL',rotulo:'Real brasileiro',simbolo:'R$'},
  {codigo:'USD',rotulo:'Dólar americano',simbolo:'US$'},
  {codigo:'EUR',rotulo:'Euro',simbolo:'€'},
  {codigo:'GBP',rotulo:'Libra esterlina',simbolo:'£'},
  {codigo:'CAD',rotulo:'Dólar canadense',simbolo:'C$'},
  {codigo:'AUD',rotulo:'Dólar australiano',simbolo:'A$'}
];

export const formatoMoeda = (v, moeda='BRL') => Number(v ?? 0).toLocaleString('pt-BR', {
  style: 'currency', currency: MOEDAS.some(m=>m.codigo===moeda)?moeda:'BRL'
});

export const parseValorMonetario = valor => {
  let s=String(valor??'').trim().replace(/\s/g,'').replace(/[^0-9,.-]/g,'');
  if(!s)return 0;
  const negativo=s.startsWith('-');
  s=s.replace(/-/g,'');
  const pontos=(s.match(/\./g)||[]).length;
  const virgulas=(s.match(/,/g)||[]).length;
  let normalizado=s;
  if(pontos&&virgulas){
    const ultimoPonto=s.lastIndexOf('.');
    const ultimaVirgula=s.lastIndexOf(',');
    const decimal=ultimoPonto>ultimaVirgula?'.':',';
    const milhar=decimal==='.'?',':'.';
    normalizado=s.split(milhar).join('').replace(decimal,'.');
  }else if(pontos||virgulas){
    const sep=pontos?'.':',';
    const partes=s.split(sep);
    if(partes.length>2){
      const ultima=partes.pop();
      normalizado=ultima.length<=2?partes.join('')+'.'+ultima:partes.join('')+ultima;
    }else{
      const casas=partes[1]?.length??0;
      normalizado=casas>0&&casas<=2?partes[0]+'.'+partes[1]:partes.join('');
    }
  }
  const n=Number(normalizado);
  return Number.isFinite(n)?(negativo?-n:n):0;
};

if(typeof window!=='undefined'&&typeof document!=='undefined'&&!window.__zoeMoneyPreviewInstalled){
  window.__zoeMoneyPreviewInstalled=true;
  window.__zoeFinanceCurrency=window.__zoeFinanceCurrency||'BRL';
  window.__zoeStartNav=window.__zoeStartNav||null;

  const moedaDoCampo=input=>{
    const label=input.closest('.fxstart-field');
    const texto=label?.querySelector(':scope > span')?.textContent||'';
    const match=texto.match(/\((BRL|USD|EUR|GBP|CAD|AUD)\)/);
    if(match){window.__zoeFinanceCurrency=match[1];return match[1]}
    return window.__zoeFinanceCurrency||'BRL';
  };

  const garantirPreview=input=>{
    if(!input?.matches?.('.fxstart-sheet input[inputmode="decimal"]'))return;
    let preview=input.nextElementSibling;
    if(!preview?.classList?.contains('fxstart-money-preview')){
      preview=document.createElement('div');
      preview.className='fxstart-money-preview';
      preview.style.cssText='margin-top:6px;min-height:18px;font-size:11px;line-height:1.35;color:#7D8D91;display:flex;align-items:baseline;gap:5px;flex-wrap:wrap';
      input.insertAdjacentElement('afterend',preview);
    }
    const raw=input.value.trim();
    if(!raw){preview.textContent='';return}
    const moeda=moedaDoCampo(input);
    const valor=parseValorMonetario(raw);
    preview.innerHTML='<span>Interpretado como</span><strong style="color:#075B59;font-weight:800"></strong>';
    preview.querySelector('strong').textContent=formatoMoeda(valor,moeda);
  };

  document.addEventListener('change',e=>{
    const select=e.target;
    if(select?.matches?.('.fxstart-sheet select')&&MOEDAS.some(m=>m.codigo===select.value)){
      window.__zoeFinanceCurrency=select.value;
    }
  },true);

  document.addEventListener('input',e=>garantirPreview(e.target),true);
  document.addEventListener('focusin',e=>garantirPreview(e.target),true);

  document.addEventListener('focusout',e=>{
    const input=e.target;
    if(!input?.matches?.('.fxstart-sheet input[inputmode="decimal"]')||!input.value.trim())return;
    const valor=parseValorMonetario(input.value);
    const canonico=String(valor).replace('.',',');
    if(input.value===canonico)return;
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value')?.set;
    if(setter)setter.call(input,canonico);else input.value=canonico;
    input.dispatchEvent(new Event('input',{bubbles:true}));
  },true);

  const rotulosStart=new Map([
    ['ADICIONAR RENDA','SALVAR RENDA'],
    ['ADICIONAR GASTO FIXO','SALVAR GASTO'],
    ['ADICIONAR CONTA','SALVAR CONTA'],
    ['ADICIONAR APLICAÇÃO','SALVAR APLICAÇÃO'],
    ['ADICIONAR PATRIMÔNIO','SALVAR PATRIMÔNIO'],
    ['ADICIONAR FINANCIAMENTO','SALVAR FINANCIAMENTO'],
    ['CONCLUIR RENDA E SEGUIR','CONTINUAR'],
    ['CONCLUIR GASTOS E SEGUIR','CONTINUAR'],
    ['CONCLUIR CONTAS E SEGUIR','CONTINUAR'],
    ['CONCLUIR INVESTIMENTOS E SEGUIR','CONTINUAR'],
    ['CONCLUIR PATRIMÔNIO E SEGUIR','CONTINUAR'],
    ['CONCLUIR FINANCIAMENTOS E SEGUIR','CONTINUAR']
  ]);

  const etapaAtual=()=>{
    const txt=document.querySelector('.fxstart-sheet-head small')?.textContent||'';
    const m=txt.match(/ETAPA\s+(\d+)/i);
    return m?Math.max(0,Number(m[1])-1):0;
  };

  const reabrirEtapa=()=>{
    const nav=window.__zoeStartNav;
    if(!nav||nav.cancelado)return;
    if(document.querySelector('.fxstart-sheet'))return;
    const nodes=[...document.querySelectorAll('.fxstart-node')];
    const alvo=nodes[nav.step];
    if(!alvo||alvo.disabled){setTimeout(reabrirEtapa,70);return}
    window.__zoeStartNav=null;
    alvo.click();
  };

  const criarSalvarEContinuar=()=>{
    const sheet=document.querySelector('.fxstart-sheet');
    if(!sheet)return;
    const saves=[...sheet.querySelectorAll('button')].filter(btn=>/^SALVAR\b/i.test((btn.textContent||'').trim())&&!btn.classList.contains('fxstart-save-next'));
    saves.forEach(save=>{
      if(save.nextElementSibling?.classList?.contains('fxstart-save-next'))return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='fxstart-btn wide fxstart-save-next';
      btn.textContent='SALVAR E CONTINUAR';
      btn.style.marginTop='8px';
      btn.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        const atual=etapaAtual();
        window.__zoeStartNav={step:Math.min(7,atual+1),cancelado:false};
        window.__zoeStartAdvanceClick=true;
        save.click();
        window.__zoeStartAdvanceClick=false;
        setTimeout(reabrirEtapa,40);
      });
      save.insertAdjacentElement('afterend',btn);
    });
  };

  const ajustarRotulosStart=()=>{
    document.querySelectorAll('.fxstart-sheet button').forEach(btn=>{
      const atual=(btn.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
      const novo=rotulosStart.get(atual);
      if(novo&&atual!==novo)btn.textContent=novo;
    });
    criarSalvarEContinuar();
    if(window.__zoeStartNav)setTimeout(reabrirEtapa,20);
  };

  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('button');
    if(!btn)return;
    const texto=(btn.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
    if(btn.matches('.fxstart-close')){
      window.__zoeStartNav=null;
      return;
    }
    if(/^SALVAR\b/.test(texto)&&!btn.classList.contains('fxstart-save-next')){
      if(!window.__zoeStartAdvanceClick){
        window.__zoeStartNav={step:etapaAtual(),cancelado:false};
        setTimeout(reabrirEtapa,40);
      }
    }
    if(texto==='CONFIRMAR E SEGUIR'){
      window.__zoeStartNav={step:1,cancelado:false};
      setTimeout(reabrirEtapa,40);
    }
  },true);

  document.addEventListener('mousedown',e=>{
    if(e.target?.classList?.contains('fxstart-sheet-backdrop')){
      e.preventDefault();
      e.stopPropagation();
    }
  },true);

  const observerStart=new MutationObserver(ajustarRotulosStart);
  const iniciarObserver=()=>{
    if(document.body){observerStart.observe(document.body,{childList:true,subtree:true});ajustarRotulosStart()}
    else setTimeout(iniciarObserver,50);
  };
  iniciarObserver();
}

export const METAANUAL_PADRAO = { alvo: 0, ano: new Date().getFullYear() };
export const MESES_LBL = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export const CATEGORIAS_DESPESA = [
  'Moradia','Mercado','Alimentação','Transporte','Saúde','Educação','Beleza e cuidados pessoais',
  'Fitness','Filhos e família','Pets','Carreira','Assinaturas','Compras','Lazer','Viagens','Impostos',
  'Seguros','Consórcio','Financiamento','Presentes e doações','Investimentos','Outros'
];

export const CATEGORIAS_RECEITA = [
  'Salário','Salário PJ','Pró-labore','Trabalho','Renda variável','Rendimentos','Reembolso','Aluguel recebido','Outros'
];

export const TIPOS_CONTA = ['Conta corrente','Conta pagamento','Carteira','Poupança','Investimento'];
export const TIPOS_INVESTIMENTO = ['Reserva','CDB','Tesouro','Fundo','Ações','Previdência','Cripto','Outro'];
export const TIPOS_DIVIDA = ['Financiamento imobiliário','Financiamento de veículo','Financiamento','Consórcio','Empréstimo','Parcelamento','Outro'];
export const TIPOS_PATRIMONIO = ['Imóvel','Veículo','Terreno','Empresa/participação','Bem de valor','Outro'];
export const CONTAS_PADRAO = [];

export const FINANCEIRO_REFERENCIA = {
  azul: '#246BFD', azulEscuro: '#1756D7', verde: '#31B65A', vermelho: '#EF5B5B', roxo: '#8157E8'
};

export const ESTADO_FINANCEIRO_INICIAL = {
  versao: VERSAO_FINANCEIRO,
  onboardingConcluido: false,
  startFinanceiroConcluido: false,
  transacoes: [],
  contas: [],
  cartoes: [],
  investimentos: [],
  dividas: [],
  patrimonios: [],
  receitasRecorrentes: [],
  gastosFixos: [],
  objetivos: [],
  orcamentos: [],
  regrasClassificacao: [],
  importacoes: [],
  configuracao: {
    ocultarValores: false,
    moedaBase: 'BRL',
    metaReserva: 0,
    prazoReserva: '',
    aporteReservaMensal: 0
  },
  gamificacao: {
    xp: 0,
    cristais: 0,
    nivel: 1,
    missoesPremiadas: [],
    ofensiva: null,
    atividadeDias: [],
    bausAbertos: []
  },
  metaAnual: METAANUAL_PADRAO
};

export const cloneFinanceiroInicial = () => JSON.parse(JSON.stringify(ESTADO_FINANCEIRO_INICIAL));
