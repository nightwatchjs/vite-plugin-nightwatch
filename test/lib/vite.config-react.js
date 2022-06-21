import {ReactIsLessThan18} from '../../src/utils/react_version.js';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import nightwatchPlugin from '../../index.js'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['react', ReactIsLessThan18() ? 'react-dom' : 'react-dom/client']
  },
  plugins: [
    react(),
    nightwatchPlugin({
      renderPage: './src/react_renderer.html'
    })
  ]
});
