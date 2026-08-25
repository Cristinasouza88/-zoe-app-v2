export const VERSAO_FINANCEIRO = 2;

export const MOEDAS = [
  {codigo:'BRL',rotulo:'Real brasileiro',simbolo:'R$'},
  {codigo:'USD',rotulo:'Dólar americano',simbolo:'US$'},
  {codigo:'EUR',rotulo:'Euro',simbolo:'€'},
  {codigo:'GBP',rotulo:'Libra esterlina',simbolo:'£'},
  {codigo:'CAD',rotulo:'Dólar canadense',simbolo:'C$'},
  {codigo:'AUD',rotulo:'Dólar australiano',simbolo:'A$'}
];

export const formatoMoeda=(v,moeda='BRL')=>Number(v??0).toLocaleString('pt-BR',{style:'currency',currency:MOEDAS.some(m=>m.codigo===moeda)?moeda:'BRL'});
export const parseValorMonetario=valor=>{let s=String(valor??'').trim().replace(/\s/g,'').replace(/[^0-9,.-]/g,'');if(!s)return 0;const neg=s.startsWith('-');s=s.replace(/-/g,'');const p=(s.match(/\./g)||[]).length,v=(s.match(/,/g)||[]).length;let z=s;if(p&&v){const up=s.lastIndexOf('.'),uv=s.lastIndexOf(','),dec=up>uv?'.':',',mil=dec==='.'?',':'.';z=s.split(mil).join('').replace(dec,'.')}else if(p||v){const sep=p?'.':',',part=s.split(sep);if(part.length>2){const u=part.pop();z=u.length<=2?part.join('')+'.'+u:part.join('')+u}else{const c=part[1]?.length??0;z=c>0&&c<=2?part[0]+'.'+part[1]:part.join('')}}const n=Number(z);return Number.isFinite(n)?(neg?-n:n):0};

// Lista ampla para seleção sem digitação. O ícone é um identificador visual leve,
// sem depender de assets externos ou logotipos proprietários.
export const INSTITUICOES_FINANCEIRAS=[
 {id:'bb',nome:'Banco do Brasil',icone:'🟨'},{id:'caixa',nome:'Caixa Econômica Federal',icone:'🟦'},
 {id:'itau',nome:'Itaú',icone:'🟧'},{id:'bradesco',nome:'Bradesco',icone:'🔴'},{id:'santander',nome:'Santander',icone:'🔺'},
 {id:'inter',nome:'Banco Inter',icone:'🟧'},{id:'nubank',nome:'Nubank',icone:'🟪'},{id:'c6',nome:'C6 Bank',icone:'⬛'},
 {id:'btg',nome:'BTG Pactual',icone:'🔷'},{id:'xp',nome:'XP Investimentos',icone:'⬛'},{id:'rico',nome:'Rico',icone:'🟨'},
 {id:'clear',nome:'Clear',icone:'🟦'},{id:'neon',nome:'Neon',icone:'🟦'},{id:'picpay',nome:'PicPay',icone:'🟩'},
 {id:'mercadopago',nome:'Mercado Pago',icone:'🩵'},{id:'pagbank',nome:'PagBank',icone:'🟨'},{id:'will',nome:'Will Bank',icone:'🟨'},
 {id:'next',nome:'Next',icone:'🟩'},{id:'original',nome:'Banco Original',icone:'🟩'},{id:'sofisa',nome:'Banco Sofisa Direto',icone:'🟩'},
 {id:'daycoval',nome:'Banco Daycoval',icone:'🟦'},{id:'bmg',nome:'Banco BMG',icone:'🟧'},{id:'pan',nome:'Banco PAN',icone:'🟦'},
 {id:'safra',nome:'Banco Safra',icone:'🟦'},{id:'modal',nome:'Banco Modal',icone:'🟦'},{id:'bv',nome:'Banco BV',icone:'🟦'},
 {id:'banrisul',nome:'Banrisul',icone:'🟦'},{id:'brb',nome:'BRB',icone:'🟦'},{id:'sicredi',nome:'Sicredi',icone:'🟩'},
 {id:'sicoob',nome:'Sicoob',icone:'🟩'},{id:'unicred',nome:'Unicred',icone:'🟩'},{id:'banestes',nome:'Banestes',icone:'🟦'},
 {id:'bancoamazonia',nome:'Banco da Amazônia',icone:'🟩'},{id:'banpara',nome:'Banpará',icone:'🟦'},{id:'bnb',nome:'Banco do Nordeste',icone:'🟦'},
 {id:'agibank',nome:'Agibank',icone:'🟦'},{id:'digio',nome:'Digio',icone:'🟦'},{id:'iti',nome:'iti Itaú',icone:'🟧'},
 {id:'99pay',nome:'99Pay',icone:'🟨'},{id:'recargapay',nome:'RecargaPay',icone:'🟦'},{id:'stone',nome:'Stone',icone:'🟩'},
 {id:'nomad',nome:'Nomad',icone:'🌎'},{id:'avenue',nome:'Avenue',icone:'🌎'},{id:'wise',nome:'Wise',icone:'🌎'},
 {id:'revolut',nome:'Revolut',icone:'🌎'},{id:'interglobal',nome:'Inter Global Account',icone:'🌎'},
 {id:'chase',nome:'JPMorgan Chase',icone:'🌎'},{id:'boa',nome:'Bank of America',icone:'🌎'},{id:'citi',nome:'Citibank',icone:'🌎'},
 {id:'hsbc',nome:'HSBC',icone:'🌎'},{id:'ubs',nome:'UBS',icone:'🌎'},{id:'deutsche',nome:'Deutsche Bank',icone:'🌎'},
 {id:'outro',nome:'Outra instituição',icone:'🏦'}
];

export const METAANUAL_PADRAO={alvo:0,ano:new Date().getFullYear()};
export const MESES_LBL=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
export const CATEGORIAS_DESPESA=['Moradia','Mercado','Alimentação','Transporte','Saúde','Educação','Beleza e cuidados pessoais','Fitness','Filhos e família','Pets','Carreira','Assinaturas','Compras','Lazer','Viagens','Impostos','Seguros','Consórcio','Financiamento','Presentes e doações','Investimentos','Outros'];
export const CATEGORIAS_RECEITA=['Salário','Salário PJ','Pró-labore','Trabalho','Renda variável','Rendimentos','Reembolso','Aluguel recebido','Outros'];
export const TIPOS_CONTA=['Conta corrente','Conta pagamento','Carteira','Poupança','Investimento'];
export const TIPOS_INVESTIMENTO=['Reserva','CDB','Tesouro','Fundo de renda fixa','Fundo imobiliário (FII)','Ações','ETF','Previdência','Cripto','Outro'];
export const TIPOS_DIVIDA=['Financiamento imobiliário - imóvel pronto','Financiamento imobiliário - em construção','Financiamento de veículo','Consórcio imobiliário','Consórcio de veículo','Empréstimo','Parcelamento','Outro compromisso'];
export const TIPOS_PATRIMONIO=['Imóvel','Veículo','Terreno','Empresa/participação','Bem de valor','Outro'];
export const CONTAS_PADRAO=[];
export const FINANCEIRO_REFERENCIA={azul:'#246BFD',azulEscuro:'#1756D7',verde:'#31B65A',vermelho:'#EF5B5B',roxo:'#8157E8'};

export const ESTADO_FINANCEIRO_INICIAL={
 versao:VERSAO_FINANCEIRO,onboardingConcluido:false,startFinanceiroConcluido:false,
 transacoes:[],contas:[],cartoes:[],investimentos:[],dividas:[],patrimonios:[],receitasRecorrentes:[],gastosFixos:[],objetivos:[],orcamentos:[],regrasClassificacao:[],importacoes:[],
 configuracao:{ocultarValores:false,moedaBase:'BRL',metaReserva:0,prazoReserva:'',aporteReservaMensal:0,metaReservaMeses:6,metasPrioritarias:[],trilhasEducacao:[]},
 gamificacao:{xp:0,cristais:0,nivel:1,missoesPremiadas:[],ofensiva:null,atividadeDias:[],bausAbertos:[]},metaAnual:METAANUAL_PADRAO
};
export const cloneFinanceiroInicial=()=>JSON.parse(JSON.stringify(ESTADO_FINANCEIRO_INICIAL));
