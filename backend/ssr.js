// Серверний рендер (SSR) сторінок тим самим React-деревом, що й у браузері.
//
// Навіщо: раніше (SSR-lite) сервер віддавав у #seo-content окрему спрощену розмітку,
// а React у браузері будував у #root зовсім інший DOM і підміняв її. Користувач
// бачив дві різні сторінки поспіль, а LCP рахувався лише від React-версії.
// Тепер у #root одразу лежить готовий HTML застосунку, і браузер його лише гідрує.
//
// Як працює:
//   1. dist-ssr/entry-server.mjs (vite build --ssr) — бандл <App> для Node.
//   2. loadInitialData() бере дані сторінки з власного /api (ті самі відповіді, що
//      отримав би браузер) → render() → HTML.
//   3. HTML іде в #root, дані — у window.__INITIAL_DATA__ (з них стартує гідрація).
//
// Безпека для проду: будь-яка помилка/таймаут рендеру → віддаємо сторінку як
// раніше (SSR-lite з #seo-content). Вимикач: SSR=0 у середовищі контейнера.
const path = require('path')
const fs = require('fs')
const { pathToFileURL } = require('url')

const SSR_ENABLED = process.env.SSR !== '0'
const ROOT = path.join(__dirname, '..')
const ENTRY = path.join(ROOT, 'dist-ssr', 'entry-server.mjs')
const MANIFEST = path.join(ROOT, 'dist', '.vite', 'manifest.json')
const RENDER_TIMEOUT_MS = 4000
const API_CACHE_MS = 30 * 1000

// Сторінки без SSR: адмінка (своя логіка входу) і кошик (персональний, живе в
// localStorage — сервер однаково відрендерив би порожній кошик). Шлях — без
// кінцевого слеша.
const SKIP = /^\/(?:[a-z]{2}\/)?(admin(\/|$)|cart$)/

// Бандл і маніфест читаються один раз на процес (невдача теж запам'ятовується).
// Нова збірка = новий Docker-контейнер, тож перечитувати з диска не треба.
let _mod = null
let _modFailed = false
async function loadEntry() {
  if (_mod || _modFailed) return _mod
  try {
    _mod = await import(pathToFileURL(ENTRY).href)
  } catch (e) {
    _modFailed = true
    console.error('[ssr] бандл не завантажився, працюємо без SSR:', e.message)
  }
  return _mod
}

let _manifest = null
function manifest() {
  if (_manifest) return _manifest
  try { _manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) } catch { _manifest = {} }
  return _manifest
}

// <link rel=modulepreload> на lazy-чанк сторінки і його залежності: без них
// браузер дізнається про чанк лише після виконання головного бандла, і гідрація
// (а отже, інтерактивність) чекає на ще один круг мережі.
function preloadLinks(srcModules, html) {
  const m = manifest()
  const out = new Set()
  const walk = key => {
    const e = m[key]
    if (!e || out.has(e.file) || key === 'index.html') return
    out.add(e.file)
    for (const imp of e.imports || []) walk(imp)
  }
  for (const m of srcModules) if (m) walk(m)
  return [...out]
    .filter(f => f.endsWith('.js') && !html.includes(`/${f}"`))
    .map(f => `<link rel="modulepreload" crossorigin href="/${f}">`)
    .join('\n    ')
}

// Дані в <script>: екрануємо «<» (щоб рядок «</script>» в описі товару не закрив тег)
// і розділювачі рядків U+2028/2029, які JSON дозволяє, а JS-рядок — ні.
const serialize = obj => JSON.stringify(obj)
  .replace(/</g, '\\u003c')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029')

function makeApi(port) {
  const cache = new Map()
  return async function api(p) {
    const hit = cache.get(p)
    if (hit && Date.now() - hit.ts < API_CACHE_MS) return hit.data
    try {
      // identity — щоб compression() не стискав мегабайтний JSON заради нас самих
      const res = await fetch(`http://127.0.0.1:${port}/api${p}`, { headers: { 'Accept-Encoding': 'identity' } })
      if (!res.ok) return null
      const data = await res.json()
      cache.set(p, { ts: Date.now(), data })
      if (cache.size > 500) cache.delete(cache.keys().next().value)
      return data
    } catch { return null }
  }
}


/**
 * html — готова сторінка з мета-тегами й SSR-lite блоком #seo-content.
 * Повертає HTML з відрендереним #root, або вихідний html, якщо SSR недоступний.
 */
function createSsr({ port, peekEurRate }) {
  const api = makeApi(port)
  return async function ssrPage(req, res, html) {
    const pathname = req.path.replace(/\/+$/, '') || '/'
    if (!SSR_ENABLED || req.method !== 'GET' || SKIP.test(pathname)) return html
    // 404: користувачу досить клієнтської сторінки «не знайдено», а повний рендер
    // із даними для випадкових URL — лише дармова робота сервера.
    if (res.statusCode === 404) return html
    const mod = await loadEntry()
    if (!mod) return html
    // Таймаут ПЕРЕРИВАЄ рендер (signal), а не лише перестає його чекати — інакше
    // під навантаженням завислі рендери накопичувались би далі.
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(new Error(`SSR timeout ${RENDER_TIMEOUT_MS}ms`)), RENDER_TIMEOUT_MS)
    try {
      const aborted = new Promise((_, rej) => ac.signal.addEventListener('abort', () => rej(ac.signal.reason)))
      aborted.catch(() => {}) // таймаут під час render() — уже не unhandled rejection
      const data = await Promise.race([mod.loadInitialData(pathname, { api, eurRate: peekEurRate() }), aborted])
      const { html: app, errors } = await mod.render(req.originalUrl, data, { signal: ac.signal })
      if (ac.signal.aborted) throw ac.signal.reason
      if (errors.length) throw errors[0]
      // + словник мови сторінки (не-uk мови — окремі чанки, main.jsx чекає їх до гідрації)
      const langModule = data.lang && data.lang !== 'uk' ? `src/i18n/lang/${data.lang}.js` : null
      const preload = preloadLinks([mod.pageModule(pathname), langModule], html)
      const script = `<script>window.__INITIAL_DATA__=${serialize(data)}</script>\n  `
      // Замінники — функції: у рядковому вигляді $&, $', $` у тексті сторінки чи JSON
      // String.replace трактував би як спецпослідовності й ламав би HTML.
      let out = html
        .replace('<div id="root"></div>', () => `<div id="root">${app}</div>`)
        // SSR-lite-блок більше не потрібен: той самий контент уже в #root
        .replace(/<div id="seo-content">[\s\S]*?<\/div>\s*(?=<\/body>)/, '')
        .replace('</head>', () => `${preload ? '  ' + preload + '\n' : ''}  </head>`)
      // Останній </body> — справжній (у контенті сторінки теж може трапитись рядок «</body>»)
      const at = out.lastIndexOf('</body>')
      out = out.slice(0, at) + script + out.slice(at)
      return out
    } catch (e) {
      console.error('[ssr]', req.originalUrl, e && e.message)
      return html
    } finally {
      clearTimeout(timer)
    }
  }
}

module.exports = { createSsr }
