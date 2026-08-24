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
import financeiroMoedaFocus from './vite.financeiro.moeda-focus.js';
import financeiroTrilhaFinalV3 from './vite.financeiro.trilha-final-v3.js';
import campoPrefixo from './vite.ui.campo-prefixo.js';
import zoeOrbAnimado from './vite.zoe-orb.js';

export default defineConfig({
  // O App fica persistido localmente via IndexedDB. O Financeiro possui sua propria
  // persistencia remota dedicada; nao usamos mais a persistencia remota do objeto
  // inteiro porque um snapshot antigo/vazio podia sobrescrever os lancamentos no F5.
  // A trilha financeira final substitui as camadas visuais anteriores para evitar
  // conflitos entre patches da etapa 3/5 e manter um único fluxo de onboarding.
  plugins: [storageIndexedDb(), persistenciaZoe(), financeiroFluxoDireto(), financeiroCategoriasDetalhe(), financeiroConciliacaoPermanente(), financeiroProdutoIntegrado(), financeiroFluxoPatrimonialV3(), financeiroFluxoPatrimonialV4(), financeiroTrilhaDocumentos(), financeiroMoedaFocus(), financeiroTrilhaFinalV3(), campoPrefixo(), zoeOrbAnimado(), react()],
  base: './'
});
