import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/sistema-solar/',
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'prompt',
    includeManifestIcons: false,
    manifest: {
      name: 'Órbita — Exploradores do Sistema Solar',
      short_name: 'Órbita',
      description: 'Explore planetas, descubra luas e conquiste seu passaporte espacial.',
      lang: 'pt-BR',
      start_url: './',
      scope: './',
      display: 'standalone',
      background_color: '#080c18',
      theme_color: '#080c18',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,webp,ktx2,wasm,glb,md,txt}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      navigateFallback: 'index.html',
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      dontCacheBustURLsMatching: /-[a-zA-Z0-9_-]{8}\.(?:js|css)$/,
    },
  })],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: { output: { manualChunks: {
      'three-core': ['three'],
      'react-vendor': ['react', 'react-dom', 'zustand'],
    } } },
  },
});
