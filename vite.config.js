import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import financeiroPatch from './vite.financeiro.patch.js';
import financeiroReset from './vite.financeiro.reset.js';
import financeiroImpostos from './vite.financeiro.impostos.js';
import financeiroReceitas from './vite.financeiro.receitas.js';
import financeiroPagamentoFatura from './vite.financeiro.pagamento-fatura.js';

export default defineConfig({
  plugins: [financeiroPatch(), financeiroReset(), financeiroImpostos(), financeiroReceitas(), financeiroPagamentoFatura(), react()],
  base: './'
});
