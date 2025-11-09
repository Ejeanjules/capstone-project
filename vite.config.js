import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/static/',  // Serve assets from /static/ to match Django's STATIC_URL
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Django dev server
        changeOrigin: true,
        secure: false,
      },
    },
  },
})