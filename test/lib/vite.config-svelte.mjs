import { defineConfig } from 'vite';
import nightwatchPlugin from '../../index.js'; 
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte(),
    nightwatchPlugin({
      componentType: 'svelte'
    })
  ]
});
