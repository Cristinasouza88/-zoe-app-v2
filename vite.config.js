import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import storageIndexedDb from './vite.storage-indexeddb.js';
import persistenciaZoe from './vite.persistencia.js';
import campoPrefixo from './vite.ui.campo-prefixo.js';
import zoeOrbAnimado from './vite.zoe-orb.js';

export default defineConfig({
  // Financeiro foi zerado em 24/08/2026 para reconstrução limpa.
  // Nenhuma camada, patch ou transformação antiga do módulo permanece ativa.
  plugins: [storageIndexedDb(), persistenciaZoe(), campoPrefixo(), zoeOrbAnimado(), react()],
  base: './'
});
