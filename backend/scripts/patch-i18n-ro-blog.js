/*
 * patch-i18n-ro-blog.js — зливає румунські (ro) переклади СТАТЕЙ БЛОГУ у колонку i18n.
 * Дзеркало patch-i18n-ro.js, але для blog_posts (поля title/excerpt/content/category).
 *
 * Вхід: backend/scripts/blog-ro-i18n.json = { "<id>": { "hash": "<16hex>", "ro": {поля} }, ... }
 * MERGE (не overwrite), хеш-гард проти поточного прод-джерела, _srcHash.ro ставиться.
 * Запуск: docker compose exec -T app node backend/scripts/patch-i18n-ro-blog.js
 */
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const FIELDS = ['title', 'excerpt', 'content', 'category']
function srcHash(row) {
  const src = {}
  for (const key of FIELDS) {
    const raw = row[key]
    if (raw == null || raw === '' || raw === '{}' || raw === '[]') continue
    src[key] = raw
  }
  return crypto.createHash('sha256').update(JSON.stringify(src)).digest('hex').slice(0, 16)
}

const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const DATA = path.join(__dirname, 'blog-ro-i18n.json')
const patch = JSON.parse(fs.readFileSync(DATA, 'utf8'))
const db = new Database(DBP)

const sel = db.prepare('SELECT id, i18n, title, excerpt, content, category FROM blog_posts WHERE id = ?')
const upd = db.prepare('UPDATE blog_posts SET i18n = ? WHERE id = ?')

let applied = 0
const missing = [], mismatch = []
const tx = db.transaction(() => {
  for (const [id, rec] of Object.entries(patch)) {
    const row = sel.get(id)
    if (!row) { missing.push(id); continue }
    const h = srcHash(row)
    if (rec.hash && rec.hash !== h) { mismatch.push(`${id} (${rec.hash}≠${h})`); continue }
    let i18n = {}
    try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
    i18n.ro = Object.assign({}, i18n.ro, rec.ro)
    i18n._srcHash = i18n._srcHash || {}
    i18n._srcHash.ro = h
    upd.run(JSON.stringify(i18n), row.id)
    applied++
  }
})
tx()
db.close()
console.log(`Готово. Оновлено ro (блог): ${applied} з ${Object.keys(patch).length}`)
if (mismatch.length) console.warn(`ПРОПУЩЕНО (хеш): ${mismatch.join(', ')}`)
if (missing.length) console.warn(`НЕ ЗНАЙДЕНО: ${missing.join(', ')}`)
