import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/20250907-carousel/old/',
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src-old')
    }
  },
  build: {
    outDir: 'dist-old',
    emptyOutDir: true
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})