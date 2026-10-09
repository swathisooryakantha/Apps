import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Link-preview images need an absolute URL. On Vercel, use the project's production
// domain (or this deployment's URL); SITE_URL overrides it anywhere else.
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
const siteUrl = (process.env.SITE_URL || (host ? `https://${host}` : '')).replace(/\/$/, '')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Wedding Planner',
        short_name: 'Wedding Planner',
        description: 'Track and plan your wedding — budget, guests, vendors, stay, checklist, shopping, and inspiration.',
        theme_color: '#e11d48',
        background_color: '#fff7f5',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,jpg}'],
      },
    }),
  ],
})
