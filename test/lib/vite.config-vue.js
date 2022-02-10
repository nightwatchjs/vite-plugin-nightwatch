import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import nightwatchPlugin from '../../index.js'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['vue']
  },
  plugins: [
    vue(),
    nightwatchPlugin({
      renderPage: './src/vue_renderer.html'
    })
  ]
})
