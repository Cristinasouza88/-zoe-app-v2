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
import financeiroBoasVindasReset from './vite.financeiro.boas-vindas-reset.js';
import financeiroRebuildLimpo from './vite.financeiro.rebuild-limpo.js';
import financeiroProdutoV2 from './vite.financeiro.produto-v2.js';
import campoPrefixo from './vite.ui.campo-prefixo.js';
import zoeOrbAnimado from './vite.zoe-orb.js';

export default defineConfig({
  // O App fica persistido localmente via IndexedDB. O Financeiro possui sua propria
  // persistencia remota dedicada; nao usamos mais a persistencia remota do objeto
  // inteiro porque um snapshot antigo/vazio podia sobrescrever os lancamentos no F5.
  // A trilha aprovada continua como onboarding e o produto v2 nasce da mesma base,
  // ignorando a interface/dados derivados do Financeiro legado.
  plugins: [storageIndexedDb(), persistenciaZoe(), financeiroFluxoDireto(), financeiroCategoriasDetalhe(), financeiroConciliacaoPermanente(), financeiroProdutoIntegrado(), financeiroFluxoPatrimonialV3(), financeiroFluxoPatrimonialV4(), financeiroTrilhaDocumentos(), financeiroMoedaFocus(), financeiroTrilhaFinalV3(), financeiroBoasVindasReset(), financeiroRebuildLimpo(), financeiroProdutoV2(), campoPrefixo(), zoeOrbAnimado(), react()],
  base: './'
});
