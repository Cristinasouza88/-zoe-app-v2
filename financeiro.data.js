export const VERSAO_FINANCEIRO = 2;

export const formatoMoeda = (v) => Number(v ?? 0).toLocaleString('pt-BR', {
  style: 'currency', currency: 'BRL'
});

export const METAANUAL_PADRAO = { alvo: 0, ano: new Date().getFullYear() };
export const MESES_LBL = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export const CATEGORIAS_DESPESA = [
  'Moradia','Mercado','Alimentação','Transporte','Saúde','Fitness','Educação','Carreira',
  'Assinaturas','Compras','Lazer','Viagens','Impostos','Seguros','Consórcio','Financiamento',
  'Presentes','Doações','Cuidados pessoais','Outros'
];

export const CATEGORIAS_RECEITA = [
  'Salário','Salário PJ','Trabalho','Rendimentos','Reembolso','Outros'
];

export const TIPOS_CONTA = ['Conta corrente','Conta pagamento','Carteira','Poupança','Investimento'];
export const TIPOS_INVESTIMENTO = ['Reserva','CDB','Tesouro','Fundo','Ações','Previdência','Outro'];
export const TIPOS_DIVIDA = ['Financiamento','Consórcio','Empréstimo','Parcelamento','Outro'];
export const CONTAS_PADRAO = [];

export const FINANCEIRO_REFERENCIA = {
  azul: '#246BFD', azulEscuro: '#1756D7', verde: '#31B65A', vermelho: '#EF5B5B', roxo: '#8157E8'
};

export const ESTADO_FINANCEIRO_INICIAL = {
  versao: VERSAO_FINANCEIRO,
  onboardingConcluido: false,
  transacoes: [],
  contas: [],
  cartoes: [],
  investimentos: [],
  dividas: [],
  objetivos: [],
  orcamentos: [],
  regrasClassificacao: [],
  importacoes: [],
  configuracao: {
    ocultarValores: false,
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
