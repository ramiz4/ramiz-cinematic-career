import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/ramiz-cinematic-career/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Ramiz Loki — Cinematic Career',
        short_name: 'Ramiz Loki',
        description: 'An immersive software engineering career experience.',
        theme_color: '#07130d',
        background_color: '#050806',
        display: 'standalone',
        start_url: '/ramiz-cinematic-career/',
        icons: [
          { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: { navigateFallback: '/ramiz-cinematic-career/index.html', globPatterns: ['**/*.{js,css,html,svg,png,webp}'] }
    })
  ],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], globals: true, exclude: ['tests/**', 'node_modules/**'] }
});
