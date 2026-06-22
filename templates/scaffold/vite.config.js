import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
  },
  server: {
    port: 5173,
    open: true,
  },
})
