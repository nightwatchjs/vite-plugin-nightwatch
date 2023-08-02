import vue from '@vitejs/plugin-vue'
import nightwatchPlugin from '../../index.js'

// https://vitejs.dev/config/
export default {
  optimizeDeps: {
    include: ['vue']
  },
  plugins: [
    vue(),
    nightwatchPlugin()
  ]
}

