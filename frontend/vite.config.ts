import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuración para 'npm run dev'
  server: {
    port: 3030,      // Cambia este número al que quieras (ej. 3000, 8080)
    strictPort: false 
  },

  // Configuración para 'npm run preview'
  preview: {
    port: 5000,      // Puedes usar el mismo o uno diferente
  }
})