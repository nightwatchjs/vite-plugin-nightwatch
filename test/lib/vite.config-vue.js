import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import nightwatchPlugin from '../../index.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    nightwatchPlugin({
      renderPage: './src/vue_renderer.html'
    })
  ]
})
