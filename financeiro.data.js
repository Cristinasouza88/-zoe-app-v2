/* ══════════ Financeiro — categorias e contas padrão ══════════
   Estrutura inspirada no dashboard do Balancinho (prints enviados pela
   usuária): cards de resumo, gráfico mensal, lançamentos com filtros. */

/*
 * Migração única — 23/08/2026
 *
 * A base financeira que já estava salva no navegador precisa ser zerada antes
 * da nova importação consolidada. A limpeza é propositalmente limitada ao
 * campo `financeiro`: perfil, trilhas, agenda, saúde, cursos e demais módulos
 * permanecem intactos.
 *
 * O marcador impede que a limpeza rode novamente depois que o novo CSV for
 * importado.
 */
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
        transacoes: [],
        contas: ['Carteira', 'Conta corrente', 'Cartão de crédito'],
        metas: [],
        dividas: [],
        pendenciasClassificacao: [],
        documentos: []
      };
      window.localStorage.setItem(chave, JSON.stringify(dados));
    });

    window.localStorage.setItem(marcador, new Date().toISOString());
  } catch (erro) {
    console.warn('ZOE: não foi possível executar a limpeza financeira automática.', erro);
  }
};

limparFinanceiroLocalUmaVez();

export const CATEGORIAS_DESPESA = [
  'Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer',
  'Educação', 'Assinaturas', 'Consórcio', 'Financiamento', 'Investimentos', 'Cuidados pessoais', 'Outros'
];

export const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Rendimentos', 'Reembolso', 'Outros'];

export const CONTAS_PADRAO = ['Carteira', 'Conta corrente', 'Cartão de crédito'];

export const MESES_LBL = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const formatoMoeda = (v) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* Meta de acúmulo/economia do ano — placeholder até a usuária mandar a
   planilha real com o cálculo exato (referência: barra de meta do Fastic). */
export const METAANUAL_PADRAO = { alvo: 80000, ano: new Date().getFullYear() };
