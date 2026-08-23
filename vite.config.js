import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import persistenciaZoe from './vite.persistencia.js';
import financeiroFluxoDireto from './vite.financeiro.fluxo-direto.js';
import financeiroCategoriasDetalhe from './vite.financeiro.categorias-detalhe.js';

export default defineConfig({
  plugins: [persistenciaZoe(), financeiroFluxoDireto(), financeiroCategoriasDetalhe(), react()],
  base: './'
});
