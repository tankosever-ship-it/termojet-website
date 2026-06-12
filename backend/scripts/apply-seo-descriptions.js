/*
 * apply-seo-descriptions.js — оновлює description товарів НОВИМИ SEO-описами (HTML).
 * Джерело: backend/scripts/seo-descriptions-data.json = [{slug, description}]
 * (у backend/, бо саме backend копіюється в Docker-контейнер).
 * Оновлює 3 місця: src/data/products.js (статичний фолбек), backend/seed-products.json,
 * живу БД. Точкова заміна значення description (мінімальний diff). Ідемпотентно.
 *   node backend/scripts/apply-seo-descriptions.js            (локально: products.js + seed + лок.БД)
 *   docker compose exec -T app node backend/scripts/apply-seo-descriptions.js   (на сервері: БД)
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..')
const DATA = path.join(__dirname, 'seo-descriptions-data.json')
const SEED = path.join(__dirname, '..', 'seed-products.json')
const PRODUCTS_JS = path.join(ROOT, 'src', 'data', 'products.js')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')

const updates = JSON.parse(fs.readFileSync(DATA, 'utf8'))  // [{slug, description}]
const seedArr = (() => { const r = JSON.parse(fs.readFileSync(SEED, 'utf8')); return Array.isArray(r) ? r : r.products })()
const bySlug = Object.fromEntries(seedArr.map(p => [p.slug, p]))

// ── 1. seed-products.json (точкова заміна старого значення на нове) ──
function patchTextFile(file, label) {
  if (!fs.existsSync(file)) { console.log(`  ${label}: файл відсутній, пропуск`); return }
  let raw = fs.readFileSync(file, 'utf8')
  let n = 0
  for (const u of updates) {
    const old = bySlug[u.slug]?.description
    if (old == null) continue
    const needle = JSON.stringify(old)          // як рядок виглядає у файлі
    const repl = JSON.stringify(u.description)
    if (raw.includes(needle)) { raw = raw.split(needle).join(repl); n++ }
  }
  fs.writeFileSync(file, raw)
  console.log(`  ${label}: оновлено ${n}/${updates.length}`)
}
patchTextFile(SEED, 'seed-products.json')
patchTextFile(PRODUCTS_JS, 'products.js')

// ── 2. жива БД (якщо доступна) ──
try {
  const Database = require('better-sqlite3')
  if (fs.existsSync(DBP)) {
    const db = new Database(DBP)
    const stmt = db.prepare('UPDATE products SET description = @description WHERE slug = @slug')
    let n = 0
    for (const u of updates) { const r = stmt.run({ slug: u.slug, description: u.description }); n += r.changes }
    db.close()
    console.log(`  БД: оновлено ${n}/${updates.length}`)
  } else { console.log('  БД: файл відсутній (локально без БД) — пропуск') }
} catch (e) { console.log('  БД: пропуск (', e.message, ')') }

console.log('apply-seo-descriptions: готово')
