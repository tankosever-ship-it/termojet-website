// Зменшені копії фото: /img/<ширина>/<шлях до фото>
//   /img/640/wp-content/uploads/2023/08/dsc_0572-scaled.jpg
//   /img/320/images/sbv-klapan.png
//   /img/960/uploads/files/foto.jpg
//
// Навіщо: фото товарів перенесено з WordPress без зменшених копій — лише файли на
// 2560 px (до 150 кБ навіть у WebP), а на телефоні фото займає ~360 px. На повільній
// мережі одне таке фото — це ~1 с LCP. Фронт віддає браузеру srcset із кількома
// ширинами (src/utils/imgUrl.js → srcSet), браузер бере найменшу достатню.
//
// Копія генерується при першому запиті (sharp) і кешується на диску (volume data/),
// далі віддається з кешу. Будь-яка помилка → 302 на оригінал: фото не зникає ніколи.
const express = require('express')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const sharp = require('sharp')

const router = express.Router()

// Лише ці ширини: інакше /img/<будь-яке число>/ дозволяло б забити диск і CPU.
// Список має збігатися з RESIZE_WIDTHS у src/utils/imgUrl.js.
const WIDTHS = new Set([160, 320, 480, 640, 960, 1280])

const DIST = path.join(__dirname, '..', '..', 'dist')
const UPLOADS = path.join(__dirname, '..', 'uploads')
const CACHE_DIR = process.env.IMG_CACHE_DIR || path.join(__dirname, '..', 'data', 'img-cache')
// wp-content роздає nginx із диска хоста (контейнер його не бачить) — беремо по HTTP.
const WP_ORIGIN = process.env.WP_ORIGIN || 'https://termojet.com.ua'
const MAX_SOURCE_BYTES = 25 * 1024 * 1024
const CACHE_HEADER = 'public, max-age=2592000' // 30 днів

fs.mkdirSync(CACHE_DIR, { recursive: true })
sharp.cache(false)        // кеш маємо свій, на диску; пам'ять процесу не роздуваємо
sharp.concurrency(1)      // VPS спільний — не забираємо всі ядра на перший прогрів

const inflight = new Map() // однакові запити, що прийшли одночасно, — одна генерація
// Джерела, що не вдалося обробити (немає файлу, битий формат): 10 хв одразу 302 на
// оригінал, без повторних запитів до origin — інакше випадкові URL гнали б трафік.
const failed = new Map()
const FAIL_TTL_MS = 10 * 60 * 1000

const safeJoin = (root, rel) => {
  const p = path.resolve(root, rel)
  return p.startsWith(root + path.sep) ? p : null
}

// Шлях після /img/<w>/ → опис джерела БЕЗ завантаження (щоб кеш перевірявся
// до будь-якого мережевого запиту) або null, якщо джерело недозволене.
async function resolveSource(rel) {
  if (rel.includes('..') || rel.includes('\0')) return null
  if (rel.startsWith('wp-content/uploads/')) return { remote: rel, version: '' }
  const root = rel.startsWith('uploads/') ? UPLOADS : DIST
  const file = safeJoin(root, rel.startsWith('uploads/') ? rel.slice('uploads/'.length) : rel)
  if (!file) return null
  const st = await fs.promises.stat(file)
  if (!st.isFile() || st.size > MAX_SOURCE_BYTES) return null
  // Версія = mtime: замінили файл у public/uploads — нова копія сама
  return { file, version: String(st.mtimeMs) }
}

// Байти віддаленого оригіналу (лише при промаху кешу)
async function fetchRemote(rel) {
  const res = await fetch(`${WP_ORIGIN}/${rel.split('/').map(encodeURIComponent).join('/')}`, {
    // Оригінал, а не WebP-підміну nginx: перестиснення з оригіналу якісніше
    headers: { Accept: 'image/jpeg,image/png,image/*;q=0.8' },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`origin ${res.status}`)
  if (Number(res.headers.get('content-length') || 0) > MAX_SOURCE_BYTES) throw new Error('source too large')
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length > MAX_SOURCE_BYTES) throw new Error('source too large')
  return buf
}

router.get(/^\/(\d+)\/(.+)$/, async (req, res) => {
  const w = Number(req.params[0])
  let rel
  try { rel = decodeURIComponent(req.params[1]) } catch { return res.status(400).end() }
  const original = '/' + req.params[1]
  if (!WIDTHS.has(w) || !/\.(jpe?g|png|webp)$/i.test(rel)) return res.redirect(302, original)

  const webp = /image\/webp/.test(req.get('Accept') || '')
  const ext = webp ? 'webp' : (/\.png$/i.test(rel) ? 'png' : 'jpg')
  res.setHeader('Vary', 'Accept')

  const failedAt = failed.get(rel)
  if (failedAt && Date.now() - failedAt < FAIL_TTL_MS) return res.redirect(302, original)
  try {
    const src = await resolveSource(rel)
    if (!src) return res.status(404).end()
    const key = crypto.createHash('sha1').update(`${rel}|${src.version}|${w}`).digest('hex')
    const out = path.join(CACHE_DIR, `${key}.${ext}`)

    if (!fs.existsSync(out)) {
      if (!inflight.has(out)) {
        const job = (async () => {
          const input = src.remote ? await fetchRemote(src.remote) : src.file
          let img = sharp(input, { failOn: 'none' })
            .rotate()                                         // EXIF-орієнтація телефонних фото
            .resize({ width: w, withoutEnlargement: true })
          img = ext === 'webp' ? img.webp({ quality: 78, effort: 4 })
            : ext === 'png' ? img.png({ compressionLevel: 9, palette: true })
            : img.jpeg({ quality: 80, mozjpeg: true })
          const tmp = `${out}.${process.pid}.tmp`
          await img.toFile(tmp)
          await fs.promises.rename(tmp, out)                 // атомарно: ніхто не прочитає напівфайл
        })().finally(() => inflight.delete(out))
        inflight.set(out, job)
      }
      await inflight.get(out)
    }
    res.setHeader('Cache-Control', CACHE_HEADER)
    res.type(ext === 'jpg' ? 'jpeg' : ext)
    return res.sendFile(out)
  } catch (e) {
    console.error('[img]', rel, w, e && e.message)
    if (failed.size > 5000) failed.clear()
    failed.set(rel, Date.now())
    return res.redirect(302, original)
  }
})

module.exports = router
