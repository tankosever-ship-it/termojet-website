import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { loadLang } from './i18n/translations'
import { langFromPathname } from './utils/localizedPath'
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

const rootEl = document.getElementById('root')
const app = (initialData) => (
  <StrictMode>
    <App initialData={initialData} />
  </StrictMode>
)

// SSR: сервер уже відрендерив сторінку тим самим <App> (src/entry-server.jsx) і
// поклав дані рендеру в window.__INITIAL_DATA__. Тоді не малюємо заново, а
// гідруємо — DOM лишається тим самим, що користувач уже бачить.
// Без SSR (адмінка, GH Pages, фолбек при помилці рендеру) — звичайний createRoot.
const initialData = window.__INITIAL_DATA__

// Мова першого рендеру: та, з якою відрендерив сервер, інакше — з URL / збережена.
// Її словник (окремий чанк, i18n/translations.js) має бути завантажений ДО гідрації:
// без нього перший клієнтський рендер показав би інший текст, ніж сервер.
function firstLang() {
  if (initialData?.lang) return initialData.lang
  const fromUrl = langFromPathname(window.location.pathname)
  if (fromUrl) return fromUrl
  try { return localStorage.getItem('tj2_lang') || 'uk' } catch { return 'uk' }
}

function start() {
  if (initialData && rootEl.hasChildNodes()) {
    hydrateRoot(rootEl, app(initialData), {
      onRecoverableError(err, info) {
        // Розбіжність серверного й клієнтського HTML — React перемалює піддерево.
        // Не фатально, але саме це ми й прибираємо, тож лишаємо слід у консолі.
        console.warn('[ssr] hydration mismatch:', err?.message || err, info?.componentStack || '')
      },
    })
  } else {
    createRoot(rootEl).render(app(null))
  }
}

loadLang(firstLang()).catch(() => {}).finally(start)

// SSR-lite (фолбек, коли SSR вимкнено або впав): після монтування React прибираємо
// серверний #seo-content, щоб у DOM лишалася лише жива React-версія.
requestAnimationFrame(() => document.getElementById('seo-content')?.remove())
