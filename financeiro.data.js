export const formatoMoeda = (v) => Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const METAANUAL_PADRAO = { alvo: 0, ano: new Date().getFullYear() };

export const CATEGORIAS_DESPESA = [];
export const CATEGORIAS_RECEITA = [];
export const CONTAS_PADRAO = [];
export const MESES_LBL = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
export const FINANCEIRO_REFERENCIA = {};
