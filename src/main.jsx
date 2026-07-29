import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isChunkError, reloadForFreshChunks } from './utils/chunkReload'

// Vite сигналить окремою подією, коли не вдалося прелоуднути динамічний чанк
// (типово — застарілий чанк після деплою). Тихо перезавантажуємо на свіжу версію.
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault()
  reloadForFreshChunks()
})

// Підстраховка: невловлені реджекти завантаження чанків поза деревом React.
window.addEventListener('unhandledrejection', (e) => {
  if (isChunkError(e.reason)) reloadForFreshChunks()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
