import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import nightwatchPlugin from '../../index.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nightwatchPlugin({
      renderPage: './src/react_renderer.html'
    })
  ]
});
