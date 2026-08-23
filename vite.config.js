import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import financeiroFluxoDireto from './vite.financeiro.fluxo-direto.js';
import financeiroCategoriasDetalhe from './vite.financeiro.categorias-detalhe.js';

export default defineConfig({
  plugins: [financeiroFluxoDireto(), financeiroCategoriasDetalhe(), react()],
  base: './'
});
