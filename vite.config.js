import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'https://agreeable-field-0f19c7800.7.azurestaticapps.net',
        changeOrigin: true,
        secure: false,
      }
    }
  }
}))
