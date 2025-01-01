import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {glob} from 'glob';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      // input: 'src/*.ts',
      input: glob.sync('src/*.ts'),
      output: {
        format: 'esm',
        // entryFileNames: 'service-worker.js'
        entryFileNames(chunkInfo) {
          return chunkInfo.name === 'ServiceWorker' ? 'ServiceWorker.js' : '[name]-[hash].js';
        },
      },
    }
  }
})
