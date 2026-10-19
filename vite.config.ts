import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['promoremind-icon.svg', 'promoremind-icon-192.png', 'promoremind-icon-512.png'],
      manifest: {
        name: 'promoremind',
        short_name: 'promoremind',
        description: 'Domini, database, PEC e abbonamenti di Promotergroup: nessuna scadenza ti sfugge',
        theme_color: '#000814',
        background_color: '#000814',
        display: 'standalone',
        icons: [
          {
            src: 'promoremind-icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'promoremind-icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'promoremind-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
