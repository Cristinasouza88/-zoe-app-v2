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
