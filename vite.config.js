import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  // SSR-збірка (src/entry-server.jsx → dist-ssr/) бандлить УСІ залежності в себе:
  // рантайм-образ Docker має лише node_modules бекенду, react/router туди не ставимо.
  ssr: {
    noExternal: true,
  },
  base: process.env.VITE_BASE_URL || '/termojet-website/',
  server: {
    host: '::',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  // У SSR-збірці Vite НЕ підставляє process.env.NODE_ENV — без цього бандл обирав
  // би dev-збірку React (у рази повільнішу) скрізь, де змінну не виставлено.
  define: isSsrBuild ? { 'process.env.NODE_ENV': JSON.stringify('production') } : undefined,
  build: isSsrBuild ? {
    outDir: 'dist-ssr',
    emptyOutDir: true,
    copyPublicDir: false, // public/ (фото, відео) уже є в dist/ — не дублюємо 340 МБ
    // .mjs — бо в рантайм-образі нема кореневого package.json з "type":"module",
    // а CJS-бекенд (backend/ssr.js) підтягує бандл через import().
    rollupOptions: {
      output: { format: 'esm', entryFileNames: 'entry-server.mjs', chunkFileNames: 'assets/[name]-[hash].mjs' },
    },
  } : {
    // Маніфест потрібен SSR-серверу, щоб додати <link rel=modulepreload> на
    // lazy-чанк поточної сторінки (інакше гідрація чекає на нього каскадом).
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'vendor-3d'
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons'
          }
          if (
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react/')
          ) {
            return 'vendor-react'
          }
        },
      },
    },
  },
}))
