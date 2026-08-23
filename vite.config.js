import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import financeiroCategoriasDetalhe from './vite.financeiro.categorias-detalhe.js';
import financeiroPatch from './vite.financeiro.patch.js';
import financeiroAutoV2 from './vite.financeiro.auto-v2.js';
import financeiroReset from './vite.financeiro.reset.js';
import financeiroImpostos from './vite.financeiro.impostos.js';
import financeiroReceitas from './vite.financeiro.receitas.js';
import financeiroPagamentoFatura from './vite.financeiro.pagamento-fatura.js';
import financeiroExcluirConciliacao from './vite.financeiro.excluir-conciliacao.js';

export default defineConfig({
  plugins: [financeiroCategoriasDetalhe(), financeiroPatch(), financeiroAutoV2(), financeiroReset(), financeiroImpostos(), financeiroReceitas(), financeiroPagamentoFatura(), financeiroExcluirConciliacao(), react()],
  base: './'
});
