/* ══════════ Financeiro — categorias e contas padrão ══════════
   Estrutura inspirada no dashboard do Balancinho (prints enviados pela
   usuária): cards de resumo, gráfico mensal, lançamentos com filtros. */

export const CATEGORIAS_DESPESA = [
  'Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer',
  'Educação', 'Assinaturas', 'Investimentos', 'Cuidados pessoais', 'Outros'
];

export const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Rendimentos', 'Reembolso', 'Outros'];

export const CONTAS_PADRAO = ['Carteira', 'Conta corrente', 'Cartão de crédito'];

export const MESES_LBL = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const formatoMoeda = (v) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
