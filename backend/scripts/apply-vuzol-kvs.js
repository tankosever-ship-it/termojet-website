/*
 * apply-vuzol-kvs.js — характеристики змішувальних вузлів TJ-MU: площа опалення, Kvs і
 * приєднання до колектора (дані техспеціаліста Termojet і таблиця з каталогу, 16.10.2026).
 * Ідемпотентний, за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-vuzol-kvs.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-vuzol-kvs.js --apply
 *
 * Пише specs (uk) і specs у перекладах (en/pl/fr/de/ro) в ОДНАКОВОМУ порядку ключів — картка
 * товару зіставляє перекладені значення з українськими за позицією ключа (CatalogPage →
 * extractBadges). Штамп _srcHash переставляємо тим мовам, що були актуальні до зміни, —
 * інакше translate-content.js вважав би переклад застарілим і перетер би машинним.
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['en', 'pl', 'fr', 'de', 'ro']

// Модель → площа (м²), Kvs (м³/год). Приєднання до колектора в усіх — 1" зовнішня різьба.
const DATA = [
  { match: /TJ-MU-10B/i, area: 120, kvs: '2,5' },
  { match: /TJ-MU-25/i,  area: 150, kvs: '3' },
  { match: /TJ-MU-40/i,  area: 200, kvs: '3,5' },
]

// Підписи нових ключів і значень за мовами (ключі першими йдуть наявні: артикул, температура)
const L = {
  uk: { area: ['Площа опалення', a => `до ${a} м²`], kvs: ['Kvs', k => `${k} м³/год`], conn: ['Приєднання до колектора', '1" ЗР'] },
  en: { area: ['Heating area', a => `up to ${a} m²`], kvs: ['Kvs', k => `${k.replace(',', '.')} m³/h`], conn: ['Manifold connection', '1" male'] },
  pl: { area: ['Powierzchnia ogrzewania', a => `do ${a} m²`], kvs: ['Kvs', k => `${k} m³/h`], conn: ['Przyłącze do rozdzielacza', '1" GZ'] },
  fr: { area: ['Surface chauffée', a => `jusqu'à ${a} m²`], kvs: ['Kvs', k => `${k} m³/h`], conn: ['Raccordement au collecteur', '1" mâle'] },
  de: { area: ['Heizfläche', a => `bis ${a} m²`], kvs: ['Kvs', k => `${k} m³/h`], conn: ['Anschluss an den Verteiler', '1" AG'] },
  ro: { area: ['Suprafață încălzită', a => `până la ${a} m²`], kvs: ['Kvs', k => `${k} m³/h`], conn: ['Racord la distribuitor', '1" FE'] },
}

// Додає/оновлює три ключі в кінці об'єкта specs, зберігаючи наявні ключі на своїх позиціях
function withSpecs(specs, lang, d) {
  const l = L[lang]
  const out = {}
  const ours = new Set([l.area[0], l.kvs[0], l.conn[0]])
  for (const [k, v] of Object.entries(specs || {})) if (!ours.has(k)) out[k] = v
  out[l.area[0]] = l.area[1](d.area)
  out[l.kvs[0]] = l.kvs[1](d.kvs)
  out[l.conn[0]] = l.conn[1]
  return out
}

// Хеш джерела — так само, як translate-content.js (ENTITIES.products)
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
const rows = db.prepare(`SELECT * FROM products WHERE category_slug = 'zmishuvalnyj-vuzol-dlya-teployi-pidlogy'`).all()
const upd = db.prepare('UPDATE products SET specs = @specs, i18n = @i18n WHERE id = @id')

const plan = []
for (const row of rows) {
  const d = DATA.find(x => x.match.test(row.name) || x.match.test(row.sku || ''))
  if (!d) { console.log(`· ${row.sku}: немає даних — пропускаю`); continue }
  let specs = {}
  try { specs = JSON.parse(row.specs || '{}') } catch { specs = {} }
  let i18n = {}
  try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }

  const nextSpecs = JSON.stringify(withSpecs(specs, 'uk', d))
  const oldHash = srcHash(row)
  const next = { ...row, specs: nextSpecs }
  const newHash = srcHash(next)
  let changed = nextSpecs !== row.specs
  for (const lang of LANGS) {
    const t = i18n[lang]
    if (!t || typeof t !== 'object') continue
    let ts = t.specs
    if (typeof ts === 'string') { try { ts = JSON.parse(ts) } catch { ts = {} } }
    const ns = withSpecs(ts, lang, d)
    if (JSON.stringify(ns) !== JSON.stringify(t.specs)) { t.specs = ns; changed = true }
    if (i18n._srcHash?.[lang] === oldHash) i18n._srcHash[lang] = newHash
  }
  if (!changed) continue
  next.i18n = JSON.stringify(i18n)
  plan.push(next)
  console.log(`• ${row.sku}: ${nextSpecs}`)
}

console.log(`\nвузлів до оновлення: ${plan.length} (очікується 3 при першому запуску)`)
if (!APPLY) {
  console.log('Це лише показ. Щоб записати: додай --apply')
} else if (plan.length) {
  db.transaction(() => { for (const p of plan) upd.run(p) })()
  console.log(`✅ оновлено ${plan.length} вузлів у ${DBP}`)
} else {
  console.log('✅ змінювати нічого')
}
