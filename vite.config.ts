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
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
    name: 'S6 Gezinsapp',      // De volledige naam
    short_name: 'S6 Hub',      // De naam onder het icoontje op je gsm
    description: 'Centrale hub voor de familie Steelant',
    theme_color: '#06080F',    // Match dit met je nieuwe donkere achtergrond
    background_color: '#06080F',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
    }),
  ],
})