// Відновлення після «застарілого чанка» (stale chunk) — типова проблема SPA після
// деплою: старі JS-чанки з хешем видаляються, і застаріла вкладка не може їх дотягнути
// → ChunkLoadError → білий екран (React падає без ErrorBoundary).
//
// Рішення: при такій помилці ОДИН раз перезавантажуємо сторінку (свіжий index.html →
// нові чанки). Захист від нескінченного циклу — таймштамп у sessionStorage: не
// перезавантажуємо частіше ніж раз на 10с, тож зламаний деплой не зациклить браузер.

const KEY = 'tj_chunk_reload_ts'
const COOLDOWN_MS = 10000

// Ознаки помилки завантаження динамічного модуля/чанка (різні браузери/движки).
export function isChunkError(err) {
  const msg = String(err?.message || err?.reason?.message || err?.reason || err || '')
  return /ChunkLoadError|Loading chunk [\d]+ failed|dynamically imported module|Importing a module script failed|error loading dynamically imported|Failed to fetch dynamically/i.test(msg)
}

// Перезавантажує сторінку не частіше ніж раз на COOLDOWN_MS. Повертає true, якщо
// перезавантаження запущено (виклик відбувся); false — якщо в cooldown (не зациклюємось).
export function reloadForFreshChunks() {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0)
    const now = Date.now()
    if (now - last > COOLDOWN_MS) {
      sessionStorage.setItem(KEY, String(now))
      window.location.reload()
      return true
    }
  } catch { /* sessionStorage недоступний → нижче фолбек-UI */ }
  return false
}
