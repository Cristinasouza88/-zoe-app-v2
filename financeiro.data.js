/* ══════════ Financeiro — categorias, contas e regras ══════════ */

/* Migração única: limpa apenas o módulo financeiro antigo antes da nova base. */
const RESET_FINANCEIRO_VERSAO = '2026-08-23-v1';
const limparFinanceiroLocalUmaVez = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const marcador = `zoe:migracao:reset-financeiro:${RESET_FINANCEIRO_VERSAO}`;
  if (window.localStorage.getItem(marcador)) return;
  try {
    const chaves = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const chave = window.localStorage.key(i);
      if (chave && chave.startsWith('zoe:dados:')) chaves.push(chave);
    }
    chaves.forEach(chave => {
      const bruto = window.localStorage.getItem(chave);
      if (!bruto) return;
      const dados = JSON.parse(bruto);
      if (!dados || typeof dados !== 'object') return;
      dados.financeiro = {
        transacoes: [], contas: CONTAS_PADRAO, metas: [], dividas: [], investimentos: [],
        pendenciasClassificacao: [], documentos: [], importacoesConciliadas: []
      };
      window.localStorage.setItem(chave, JSON.stringify(dados));
    });
    window.localStorage.setItem(marcador, new Date().toISOString());
  } catch (erro) { console.warn('ZOE: falha na limpeza financeira automática.', erro); }
};

export const CATEGORIAS_DESPESA = [
  'Moradia', 'Mercado', 'Alimentação', 'Transporte', 'Saúde e Cuidados',
  'Saúde e Fitness', 'Educação e Carreira', 'Assinaturas e Serviços', 'Compras',
  'Lazer e Cultura', 'Presentes', 'Viagens', 'Seguros e Proteções', 'Impostos', 'Impostos e Taxas',
  'Consórcio', 'Financiamento', 'Investimentos', 'Pagamento de fatura', 'Cuidados pessoais', 'Doações', 'Outros'
];

export const CATEGORIAS_RECEITA = [
  'Salário PJ', 'Salário', 'Receita de Trabalho', 'Rendimentos', 'Reembolso',
  'Outras entradas', 'Outros'
];

export const CONTAS_PADRAO = [
  'Inter Pessoal', 'Inter Empresas', 'Mercado Pago', 'Reserva Rendimento',
  'Cartão Inter', 'Cartão C6', 'Carteira', 'Conta corrente', 'Cartão de crédito'
];

export const MESES_LBL = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const formatoMoeda = (v) => Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const FINANCEIRO_REFERENCIA = {
  liquidezAtual: 113008.47,
  dataLiquidez: '2026-08-22',
  metaLiquidez: 200000,
  metaLiquidezData: '2026-12-31',
  reservaAutomaticaMensal: 12000,
  reservaPorGasto: 100,
  historicoParcialAte: '2025-12'
};

export const METAANUAL_PADRAO = { alvo: FINANCEIRO_REFERENCIA.metaLiquidez, ano: 2026 };

limparFinanceiroLocalUmaVez();
