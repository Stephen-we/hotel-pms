import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'hotel.stephenweb.space',
      'api.hotel.stephenweb.space'
    ],
    host: true, // Allow external access
    port: 5173
  }
})
