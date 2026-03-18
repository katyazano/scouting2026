import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate hace que si subes un cambio a Vercel, 
      // la app se actualice sola en el fondo sin que el usuario tenga que borrar la caché a mano.
      registerType: 'autoUpdate', 
      
      // Archivos estáticos que queremos que guarde para uso offline
      includeAssets: ['logo.svg', 'pwa-192x192.png', 'pwa-512x512.png'], 
      
      // Configuración del Manifiesto (Lo que lee Android/iOS al instalar)
      manifest: {
        name: 'StratosScout Analysis',
        short_name: 'StratosScout',
        description: 'Plataforma de Análisis de Scouting FRC',
        theme_color: '#0f172a', // Color de la barra superior del celular (slate-900)
        background_color: '#020617', // Color de fondo al cargar (slate-950)
        display: 'standalone', // Oculta la barra del navegador, se ve como app nativa
        orientation: 'portrait', // Opcional: fuerza la vista vertical (o usa 'any')
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Ayuda a que el ícono se adapte a las formas de Android
          }
        ]
      },
      
      // Configuración del Service Worker (El "Cerebro" Offline)
      workbox: {
        // Guarda todos estos archivos en la memoria del dispositivo
        globPatterns: ['**/*.{js,css,html,ico,png,svg,csv}'],
        
        // MUY IMPORTANTE: Le dice a la PWA que NO intente interceptar ni cachear 
        // las llamadas a tu servidor local de Python (el bridge.py).
        navigateFallbackDenylist: [/^\/api/] 
      }
    })
  ],
});