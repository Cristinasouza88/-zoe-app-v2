import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import storageIndexedDb from './vite.storage-indexeddb.js';
import persistenciaZoe from './vite.persistencia.js';
import financeiroFluxoDireto from './vite.financeiro.fluxo-direto.js';
import financeiroCategoriasDetalhe from './vite.financeiro.categorias-detalhe.js';
import financeiroConciliacaoPermanente from './vite.financeiro.conciliacao-permanente.js';
import financeiroProdutoIntegrado from './vite.financeiro.produto-integrado-v2.js';
import financeiroFluxoPatrimonialV3 from './vite.financeiro.fluxo-patrimonial-v3.js';
import financeiroFluxoPatrimonialV4 from './vite.financeiro.fluxo-patrimonial-v4.js';
import financeiroTrilhaDocumentos from './vite.financeiro.trilha-documentos.js';
import financeiroTrilhaVisualV2 from './vite.financeiro.trilha-visual-v2.js';
import zoeOrbAnimado from './vite.zoe-orb.js';

export default defineConfig({
  // O App fica persistido localmente via IndexedDB. O Financeiro possui sua propria
  // persistencia remota dedicada; nao usamos mais a persistencia remota do objeto
  // inteiro porque um snapshot antigo/vazio podia sobrescrever os lancamentos no F5.
  plugins: [storageIndexedDb(), persistenciaZoe(), financeiroFluxoDireto(), financeiroCategoriasDetalhe(), financeiroConciliacaoPermanente(), financeiroProdutoIntegrado(), financeiroFluxoPatrimonialV3(), financeiroFluxoPatrimonialV4(), financeiroTrilhaDocumentos(), financeiroTrilhaVisualV2(), zoeOrbAnimado(), react()],
  base: './'
});
