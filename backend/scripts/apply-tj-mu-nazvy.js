/*
 * apply-tj-mu-nazvy.js — нові назви (= H1 картки) змішувальних вузлів TJ-MU у 6 мовах
 * (SEO-команда, 06.11.2026). Ідемпотентний, за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-tj-mu-nazvy.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-tj-mu-nazvy.js --apply
 *
 * Перед --apply — бекап (НЕ cp, база у WAL):
 *   docker compose exec app node backend/scripts/backup-db.cjs tj-mu-nazvy
 *
 * Формат: «Змішувальний вузол для теплої підлоги до {S} м² Termojet {модель}».
 * Модель у назві — латиницею (TJ-MU-40A), хоча артикул 40А має кириличну «А»: так назву
 * знаходять за запитом «TJ-MU-40A»; рядок таблиці лендінгу збігається за артикулом.
 * Штамп _srcHash переставляємо мовам, що були актуальні (див. apply-kolektor-pidloha-nazvy.js).
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']

const MODELS = [
  { sku: 'TJ-MU-10B', model: 'TJ-MU-10B', area: 120 },
  { sku: '84040TJ-MU-25', model: 'TJ-MU-25', area: 150 },
  { sku: 'TJ-MU-40А', model: 'TJ-MU-40A', area: 200 },
]
const T = {
  uk: (s, m) => `Змішувальний вузол для теплої підлоги до ${s} м² Termojet ${m}`,
  en: (s, m) => `Underfloor heating mixing unit up to ${s} m² Termojet ${m}`,
  pl: (s, m) => `Węzeł mieszający do ogrzewania podłogowego do ${s} m² Termojet ${m}`,
  fr: (s, m) => `Groupe de mélange pour plancher chauffant jusqu'à ${s} m² Termojet ${m}`,
  de: (s, m) => `Mischeinheit für Fußbodenheizung bis ${s} m² Termojet ${m}`,
  ro: (s, m) => `Grup de amestec pentru încălzire prin pardoseală până la ${s} m² Termojet ${m}`,
}

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
const sel = db.prepare('SELECT * FROM products WHERE sku = ?')
const upd = db.prepare('UPDATE products SET name = @name, i18n = @i18n WHERE id = @id')

const plan = []
for (const { sku, model, area } of MODELS) {
  const row = sel.get(sku)
  if (!row) { console.log(`· ${sku}: товару немає — пропускаю`); continue }
  let i18n = {}
  try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
  const next = { ...row, name: T.uk(area, model) }
  let changed = next.name !== row.name
  for (const lang of LANGS.slice(1)) {
    if (!i18n[lang] || typeof i18n[lang] !== 'object') continue
    const v = T[lang](area, model)
    if (i18n[lang].name !== v) { i18n[lang].name = v; changed = true }
  }
  if (!changed) continue
  const oldHash = srcHash(row)
  const h = srcHash(next)
  if (i18n._srcHash) for (const lang of LANGS.slice(1)) if (i18n[lang] && i18n._srcHash[lang] === oldHash) i18n._srcHash[lang] = h
  next.i18n = JSON.stringify(i18n)
  plan.push(next)
  console.log(`• ${sku}: «${row.name}» → «${next.name}»`)
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
