import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // Exponer explícitamente las variables de entorno
    define: {
      'import.meta.env.VITE_API_BASE': JSON.stringify(
        env.VITE_API_BASE || 'http://localhost:8000'
      )
    }
  }
})