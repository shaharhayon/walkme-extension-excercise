import { defineConfig } from 'vite'
import {glob} from 'glob';
// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: glob.sync('src/Extension/*.ts'),
      output: {
        format: 'esm',
        dir: 'dist/Extension',
        entryFileNames(chunkInfo) {
          return chunkInfo.name === 'ServiceWorker' ? 'ServiceWorker.js' : '[name]-[hash].js';
        },
      },
    }
  }
})


