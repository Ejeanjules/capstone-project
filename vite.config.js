import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Only use /static/ base path in production builds, not in dev server
  base: command === 'build' ? '/static/' : '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Django dev server
        changeOrigin: true,
        secure: false,
      },
    },
  },
}))