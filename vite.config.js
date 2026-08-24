import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import storageIndexedDb from './vite.storage-indexeddb.js';
import remotePersist from './vite.remote-persist.js';

export default defineConfig({
  plugins: [storageIndexedDb(), remotePersist(), react()],
  base: './'
});
