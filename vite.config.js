import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_URL || '/termojet-website/',
  server: {
    host: '::',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
})
