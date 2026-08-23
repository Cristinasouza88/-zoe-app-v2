import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import financeiroPatch from './vite.financeiro.patch.js';
import financeiroReset from './vite.financeiro.reset.js';

export default defineConfig({
  plugins: [financeiroPatch(), financeiroReset(), react()],
  base: './'
});
