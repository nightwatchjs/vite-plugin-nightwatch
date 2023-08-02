import { defineConfig } from 'vite';
import nightwatchPlugin from '../../index.mjs'; 
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte(),
    nightwatchPlugin({
      componentType: 'svelte'
    })
  ]
});
