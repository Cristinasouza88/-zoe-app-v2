import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// gera UM arquivo html com tudo dentro (react, ícones, app e conteúdo)
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-unico',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } }
  }
});
