import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['madrem.circle.png'],
      manifest: {
        name: 'MadRem',
        short_name: 'MadRem',
        description: 'Monitoraggio Infrastruttura',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          {
            src: 'madrem.circle.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'madrem.circle.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'madrem.circle.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
  },
})
