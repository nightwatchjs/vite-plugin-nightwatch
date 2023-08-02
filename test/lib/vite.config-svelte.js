import { defineConfig } from 'vite';
import nightwatchPlugin from '../../index.js'; 

let asyncSvelte = async () => {
  const SveltPlugin = await import('@sveltejs/vite-plugin-svelte');
  return SveltPlugin.svelte();
};


export default defineConfig({
  plugins: [
    asyncSvelte(),
    nightwatchPlugin({
      componentType: 'svelte'
    })
  ]
});