import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/service-worker.ts',
      output: {
        format: 'esm',
        entryFileNames: 'service-worker.js',
      },
    }
  }
})
