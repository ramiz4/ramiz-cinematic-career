import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/ramiz-cinematic-career/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/ramiz-cinematic-career/',
        name: 'Ramiz Loki — Technology Leadership',
        short_name: 'Ramiz Loki',
        description: 'Architecture, delivery and technical leadership translated into business leverage.',
        theme_color: '#07130d',
        background_color: '#050806',
        display: 'standalone',
        start_url: '/ramiz-cinematic-career/',
        scope: '/ramiz-cinematic-career/',
        lang: 'en',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/ramiz-cinematic-career/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,webp}'],
        globIgnores: ['**/Scene-*.js'],
        runtimeCaching: [{
          urlPattern: /\/assets\/Scene-.*\.js$/,
          handler: 'CacheFirst',
          options: { cacheName: 'cinematic-3d-story', expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 30 } }
        }]
      }
    })
  ],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], globals: true, exclude: ['tests/**', 'node_modules/**'] }
});
