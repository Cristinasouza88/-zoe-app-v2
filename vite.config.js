import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import financeiroPatch from './vite.financeiro.patch.js';

export default defineConfig({
  plugins: [financeiroPatch(), react()],
  base: './'
});
