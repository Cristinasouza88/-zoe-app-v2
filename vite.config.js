import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import campoPrefixo from './vite.ui.campo-prefixo.js';
import niilOrbAnimado from './vite.niil-orb.js';

export default defineConfig({
  // Financeiro foi zerado em 24/08/2026 para reconstrução limpa.
  // Nenhuma camada, patch ou transformação antiga do módulo permanece ativa.
  plugins: [campoPrefixo(), niilOrbAnimado(), react()],
  base: './'
});
