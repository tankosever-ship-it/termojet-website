/*
 * apply-restructure-20261113.js — розбивка категорій «Система підлогового опалення» і «Клапани» (13.11.2026).
 * Ідемпотентний (ключ — SKU), за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-restructure-20261113.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-restructure-20261113.js --apply
 *
 * Перед записом скрипт сам робить WAL-безпечний бекап (VACUUM INTO → termojet.db.bak-restructure-<час>),
 * тож окремо backup-db.cjs запускати не обовʼязково.
 *
 * Що робить:
 *  1. kolektory-pidloha → kolektor-dlya-radiatornogo-opalennya: колектори з кранами 84040TJ-R-W-02..12 і комплект кранів 200085.
 *  2. klapany → elektropryvody-dlya-zmishuvalnyh-klapaniv (5 приводів), termostatychni-tryhodovi-klapany (TMV ×6),
 *     zonalni-klapany-z-elektropryvodom (47025230, 47032230).
 *  3. Труба SPY-16X2 — is_visible = 0 (301 на трубу PE-RT 520472 — PRODUCT_SLUG_ALIASES у server.js).
 *  3a. Фольгована плівка 84040TJ-FP-50 — фото (рулон + монтаж), якщо в адмінці не поставили інше.
 *  4. Посилання /catalog/<cat>/<slug> в описах товарів, статтях блогу й портфоліо (усі мови) — одразу на актуальну категорію.
 * Старі URL перенесених товарів віддають 301 самі (server.js → handleProduct: категорія в URL ≠ категорії товару).
 * Відгуки зберігають категорію на момент відгуку — оновлюємо для перенесених товарів.
 *
 * Українське джерело змінюється лише в посиланнях, тож штамп `_srcHash` переставляємо тим мовам, що були актуальні
 * (інакше translate-content.js вважав би переклад застарілим і перетер би його машинним).
 */
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']
const TEXT_FIELDS = ['short_desc', 'description', 'specs', 'seo_title', 'meta_description']

const MOVES = {
  'kolektor-dlya-radiatornogo-opalennya': ['84040TJ-R-W-02', '84040TJ-R-W-03', '84040TJ-R-W-04', '84040TJ-R-W-05', '84040TJ-R-W-06',
    '84040TJ-R-W-07', '84040TJ-R-W-08', '84040TJ-R-W-09', '84040TJ-R-W-10', '84040TJ-R-W-11', '84040TJ-R-W-12', '200085'],
  'elektropryvody-dlya-zmishuvalnyh-klapaniv': ['AQUAO401-3-230-120', 'AQUAO405-3-230-060', 'AQUA411-0-10-24', 'AQUAO412-3-230-060', 'TJ413'],
  'termostatychni-tryhodovi-klapany': ['TMV121', 'TMV122', 'TMV131', 'TMV132', 'TMV231', 'TMV232'],
  'zonalni-klapany-z-elektropryvodom': ['47025230', '47032230'],
}
const FROM = { 'kolektor-dlya-radiatornogo-opalennya': 'kolektory-pidloha' }   // решта — з klapany
const HIDE = ['SPY-16X2']
// Фото товарів без фото (14.11.2026): ставимо, лише якщо головне фото порожнє або вже наше — щоб не перетерти фото з адмінки
const PHOTOS = {
  '84040TJ-FP-50': ['/images/folga-termojet-rulon.jpg', '/images/folga-termojet-montazh.jpg'],
}
const TARGET = new Map()   // sku → нова категорія
for (const [cat, skus] of Object.entries(MOVES)) for (const s of skus) TARGET.set(s, cat)

const HASH_FIELDS = ['name', 'short_desc', 'description', 'specs', 'seo_title', 'meta_description', 'subcategory']
function srcHash(row) {
  const src = {}
  for (const key of HASH_FIELDS) {
    const raw = row[key]
    if (raw == null || raw === '' || raw === '{}' || raw === '[]') continue
    src[key] = raw
  }
  return crypto.createHash('sha256').update(JSON.stringify(src)).digest('hex').slice(0, 16)
}

const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)
const rows = db.prepare(`SELECT id, sku, slug, name, category_slug, is_visible, short_desc, description, specs,
  seo_title, meta_description, subcategory, i18n FROM products`).all()

const fromCat = cat => FROM[cat] || 'klapany'
const newCat = row => {
  const t = TARGET.get(row.sku)
  return t && row.category_slug === fromCat(t) ? t : null
}
// slug → категорія після міграції (приховані — без категорії, їх посилання не чіпаємо)
const FINAL_CAT = new Map(rows.map(r => [r.slug, newCat(r) || r.category_slug]))
const fixLinks = s => (typeof s !== 'string' ? s : s.replace(/\/catalog\/([a-z0-9-]+)\/([a-z0-9-]+)/g, (m, cat, slug) => {
  const real = FINAL_CAT.get(slug)
  return real && real !== cat ? `/catalog/${real}/${slug}` : m
}))
const fixDeep = v => {   // рядки всередині JSON (i18n, links) — рекурсивно
  if (typeof v === 'string') return fixLinks(v)
  if (Array.isArray(v)) return v.map(fixDeep)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fixDeep(x)]))
  return v
}

const plan = []
const stats = { moved: 0, hidden: 0, links: 0 }
const found = new Set()
for (const row of rows) {
  const next = { ...row }
  const notes = []
  const nc = newCat(row)
  if (nc) { next.category_slug = nc; stats.moved++; notes.push(`категорія ${row.category_slug} → ${nc}`) }
  if (HIDE.includes(row.sku) && row.is_visible !== 0) { next.is_visible = 0; stats.hidden++; notes.push('приховано (is_visible = 0)') }
  if (TARGET.has(row.sku) || HIDE.includes(row.sku)) found.add(row.sku)

  let i18n = {}
  try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
  let srcChanged = false, linksChanged = false
  for (const f of TEXT_FIELDS) {
    const v = fixLinks(next[f]); if (v !== next[f]) { next[f] = v; srcChanged = true; linksChanged = true }
  }
  for (const lang of LANGS.filter(l => l !== 'uk')) {
    const t = i18n[lang]; if (!t || typeof t !== 'object') continue
    const fixed = fixDeep(t)
    if (JSON.stringify(fixed) !== JSON.stringify(t)) { i18n[lang] = fixed; linksChanged = true }
  }
  if (linksChanged) { stats.links++; notes.push('посилання → актуальні адреси') }
  if (!notes.length) continue
  if (srcChanged) {
    const oldHash = srcHash(row), h = srcHash(next)
    i18n._srcHash = i18n._srcHash || {}
    for (const lang of LANGS.filter(l => l !== 'uk')) if (i18n[lang] && i18n._srcHash[lang] === oldHash) i18n._srcHash[lang] = h
  }
  next.i18n = JSON.stringify(i18n)
  plan.push(next)
  console.log(`• ${row.sku || row.id}  ${String(row.name).slice(0, 70)}`)
  for (const n of notes) console.log(`    ${n}`)
}

// Блог і портфоліо: посилання на товари в тексті
const extra = []   // { table, id, sets }
const scan = (table, cols, jsonCols) => {
  const has = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table)
  if (!has) return
  for (const r of db.prepare(`SELECT id, ${[...cols, ...jsonCols].join(', ')} FROM ${table}`).all()) {
    const sets = {}
    for (const c of cols) { const v = fixLinks(r[c]); if (v !== r[c]) sets[c] = v }
    for (const c of jsonCols) {
      let o; try { o = JSON.parse(r[c] || 'null') } catch { continue }
      if (o == null) continue
      const s = JSON.stringify(fixDeep(o)); if (s !== JSON.stringify(o)) sets[c] = s
    }
    if (Object.keys(sets).length) { extra.push({ table, id: r.id, sets }); console.log(`• ${table} #${r.id}: посилання → ${Object.keys(sets).join(', ')}`) }
  }
}
scan('blog_posts', ['content', 'excerpt'], ['i18n'])
scan('portfolio', ['description'], ['i18n', 'links'])

// Відгуки до товару зберігають категорію на момент відгуку
const hasReviews = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='product_reviews'").get()
const revMoves = rows.filter(r => newCat(r)).map(r => ({ slug: r.slug, from: r.category_slug, to: newCat(r) }))
if (hasReviews && revMoves.length) {
  let n = 0
  for (const m of revMoves) n += db.prepare('SELECT COUNT(*) c FROM product_reviews WHERE category_slug = ? AND product_slug = ?').get(m.from, m.slug).c
  console.log(`\nвідгуки на перенесених товарах: ${n}`)
}

// Фото
const photoPlan = []
for (const [sku, imgs] of Object.entries(PHOTOS)) {
  const r = db.prepare('SELECT id, image, images FROM products WHERE sku = ?').get(sku)
  if (!r) { console.log(`⚠️  фото: SKU ${sku} нема в БД`); continue }
  const want = JSON.stringify(imgs)
  if (r.image && !imgs.includes(r.image)) { console.log(`• ${sku}: фото вже є (${r.image}) — не чіпаю`); continue }
  if (r.image === imgs[0] && r.images === want) continue
  photoPlan.push({ id: r.id, image: imgs[0], images: want })
  console.log(`• ${sku}: фото → ${imgs.join(', ')}`)
}

const missing = [...TARGET.keys(), ...HIDE].filter(s => !found.has(s))
console.log(`\nперенесено: ${stats.moved} (очікується ${TARGET.size} на чистій прод-БД), приховано: ${stats.hidden}, товарів із виправленими посиланнями: ${stats.links}, блог/портфоліо: ${extra.length}`)
if (missing.length) console.log(`⚠️  SKU, яких нема в БД: ${missing.join(', ')}`)

if (!APPLY) {
  console.log('\nЦе лише показ. Щоб записати: додай --apply')
} else if (plan.length || extra.length || photoPlan.length) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T-]/g, '')
  const bak = `${DBP}.bak-restructure-${stamp}`
  db.exec(`VACUUM INTO '${bak.replace(/'/g, "''")}'`)   // WAL-безпечний знімок
  console.log(`\nбекап: ${bak}`)
  const upd = db.prepare(`UPDATE products SET name = @name, short_desc = @short_desc, description = @description, specs = @specs,
    seo_title = @seo_title, meta_description = @meta_description, category_slug = @category_slug, is_visible = @is_visible, i18n = @i18n WHERE id = @id`)
  db.transaction(() => {
    for (const p of plan) upd.run(p)
    for (const e of extra) {
      const cols = Object.keys(e.sets)
      db.prepare(`UPDATE ${e.table} SET ${cols.map(c => `${c} = @${c}`).join(', ')} WHERE id = @id`).run({ ...e.sets, id: e.id })
    }
    for (const ph of photoPlan) db.prepare('UPDATE products SET image = @image, images = @images WHERE id = @id').run(ph)
    if (hasReviews) for (const m of revMoves) db.prepare('UPDATE product_reviews SET category_slug = ? WHERE category_slug = ? AND product_slug = ?').run(m.to, m.from, m.slug)
  })()
  console.log(`✅ оновлено ${plan.length} товарів, фото: ${photoPlan.length}, ${extra.length} записів блогу/портфоліо у ${DBP}`)
} else {
  console.log('\n✅ змінювати нічого')
}
