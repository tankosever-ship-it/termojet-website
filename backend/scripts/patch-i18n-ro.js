/*
 * patch-i18n-ro.js — зливає румунські (ro) переклади товарів у колонку i18n прод-БД.
 *
 * «Через мене»-пайплайн (без ANTHROPIC_API_KEY / translate-content.js):
 *   1) локально: експорт uk-джерела → батчі → субагенти перекладають → merge у
 *      backend/scripts/products-ro-i18n.json
 *   2) на проді (з бекапом): docker compose exec -T app node backend/scripts/patch-i18n-ro.js
 *
 * БЕЗПЕЧНО:
 *   • MERGE, не overwrite: i18n.ro = {...наявний ro, ...нові поля}; en/pl/fr/de не чіпаємо.
 *   • Захист за хешем: для кожного товару рахуємо srcHash поточного ПРОД-рядка й звіряємо
 *     з hash, від якого перекладали. Розбіжність → ПРОПУСК + попередження (прод-текст
 *     змінився з моменту перекладу → ro міг би не відповідати). Такі товари треба
 *     перекласти з актуального джерела окремо.
 *   • _srcHash.ro ставимо = хеш прод-джерела → наступний translate-content.js вважає ro свіжим.
 *
 * Вхід products-ro-i18n.json: { "<id>": { "sku": "...", "hash": "<16hex>", "ro": {поля} }, ... }
 * Матч у БД: за sku (стабільніший між середовищами), інакше за id.
 * Ідемпотентний.
 */
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const FIELDS = ['name', 'short_desc', 'description', 'specs', 'seo_title', 'meta_description', 'subcategory']
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
const DATA = path.join(__dirname, 'products-ro-i18n.json')

const patch = JSON.parse(fs.readFileSync(DATA, 'utf8'))
const db = new Database(DBP)

const selById = db.prepare(`SELECT id, i18n, name, short_desc, description, specs,
  seo_title, meta_description, subcategory FROM products WHERE id = ?`)
const selBySku = db.prepare(`SELECT id, i18n, name, short_desc, description, specs,
  seo_title, meta_description, subcategory FROM products WHERE sku = ?`)
const upd = db.prepare('UPDATE products SET i18n = ? WHERE id = ?')

let applied = 0
const missing = [], mismatch = []
const tx = db.transaction(() => {
  for (const [id, rec] of Object.entries(patch)) {
    const row = (rec.sku && selBySku.get(rec.sku)) || selById.get(id)
    if (!row) { missing.push(rec.sku || id); continue }
    const h = srcHash(row)
    if (rec.hash && rec.hash !== h) { mismatch.push(`${rec.sku || id} (перекл ${rec.hash} ≠ прод ${h})`); continue }
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

console.log(`Готово. Оновлено ro: ${applied} з ${Object.keys(patch).length}`)
if (mismatch.length) console.warn(`ПРОПУЩЕНО (хеш не збігся, прод-текст змінився) [${mismatch.length}]:\n  ` + mismatch.join('\n  '))
if (missing.length) console.warn(`НЕ ЗНАЙДЕНО в БД [${missing.length}]: ` + missing.join(', '))
