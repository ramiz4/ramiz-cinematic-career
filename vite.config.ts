import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '.',
        name: 'Ramiz Loki — Technology Leadership',
        short_name: 'Ramiz Loki',
        description: 'Architecture, delivery and technical leadership translated into business leverage.',
        theme_color: '#07130d',
        background_color: '#050806',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        lang: 'en',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,webp}']
      }
    })
  ],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], globals: true, exclude: ['tests/**', 'node_modules/**'] }
});
