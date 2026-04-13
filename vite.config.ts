import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      base: '/Fat-/',
      manifest: {
        name: 'Fat Tracker',
        short_name: 'FatTracker',
        description: 'Personal weight loss accountability app',
        theme_color: '#10b981',
        background_color: '#f9fafb',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/Fat-/',
        start_url: '/Fat-/',
        icons: [
          { src: '/Fat-/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/Fat-/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: '/Fat-/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  base: '/Fat-/',
})
