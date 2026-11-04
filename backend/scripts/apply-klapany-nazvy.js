/*
 * apply-klapany-nazvy.js — назви товарів /catalog/klapany за документом SEO-команди (11.2026)
 * і підключення TMV122 (¾", а не 1"). Ідемпотентний, за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-klapany-nazvy.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-klapany-nazvy.js --apply
 *
 * Перед --apply — бекап (НЕ cp, база у WAL):
 *   docker compose exec app node backend/scripts/backup-db.cjs klapany-nazvy
 *
 * ⚠️ Назви читають фільтри категорії (CatalogPage → CATEGORY_FILTERS.klapany) і групи сторінки
 * (category-landing.json → groups[].match): міняючи назву, перевіряти їх.
 * RMV03110-034 свідомо без змін (1-ша позиція за «трьохходовий клапан для теплої підлоги»).
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['en', 'pl', 'fr', 'de', 'ro']

const dec = (v, lang) => (lang === 'en' ? v : v.replace('.', ','))
const THREAD = {
  ext: { uk: 'зовнішня різьба', en: 'male thread', pl: 'gwint zewnętrzny', fr: 'filetage mâle', de: 'Außengewinde', ro: 'filet exterior' },
  int: { uk: 'внутрішня різьба', en: 'female thread', pl: 'gwint wewnętrzny', fr: 'filetage femelle', de: 'Innengewinde', ro: 'filet interior' },
}
const size = (dn, inch) => `DN${dn} (${inch}")`
const kran = {
  uk: 'Триходовий змішувальний кран Termojet', en: 'Three-way mixing valve Termojet', pl: 'Trójdrogowy zawór mieszający Termojet',
  fr: 'Vanne mélangeuse trois voies Termojet', de: 'Dreiweg-Mischventil Termojet', ro: 'Robinet de amestec cu trei căi Termojet',
}
const kran4 = {
  uk: 'Чотириходовий змішувальний кран Termojet', en: 'Four-way mixing valve Termojet', pl: 'Czterodrogowy zawór mieszający Termojet',
  fr: 'Vanne mélangeuse quatre voies Termojet', de: 'Vierweg-Mischventil Termojet', ro: 'Robinet amestecător cu patru căi Termojet',
}
const termo = {
  uk: 'Триходовий термостатичний клапан Termojet', en: 'Three-way thermostatic valve Termojet', pl: 'Trójdrogowy zawór termostatyczny Termojet',
  fr: 'Vanne thermostatique trois voies Termojet', de: 'Thermostatisches Dreiwegeventil Termojet', ro: 'Vană termostatică cu trei căi Termojet',
}
const each = fn => Object.fromEntries(['uk', ...LANGS].map(l => [l, fn(l)]))
const mix = (base, dn, inch, kvs, th) => each(l => `${base[l]} ${size(dn, inch)}, Kvs ${dec(kvs, l)}, ${THREAD[th][l]}`)
const tmv = (inch, kvs, t) => each(l => `${termo[l]} ${inch}", Kvs ${dec(kvs, l)}, ${t} °C, ${THREAD.ext[l]}`)
const zone = (dn, inch, kvs, code) => ({
  uk: `Триходовий зональний клапан Termojet ${size(dn, inch)} з електроприводом 230 В, Kvs ${kvs}, ${code}`,
  en: `3-way zone valve Termojet ${size(dn, inch)} with electric actuator 230 V, Kvs ${kvs}, ${code}`,
  pl: `3-drogowy zawór strefowy Termojet ${size(dn, inch)} z siłownikiem elektrycznym 230 V, Kvs ${kvs}, ${code}`,
  fr: `Vanne de zone 3 voies Termojet ${size(dn, inch)} avec actionneur électrique 230 V, Kvs ${kvs}, ${code}`,
  de: `3-Wege-Zonenventil Termojet ${size(dn, inch)} mit elektrischem Stellantrieb 230 V, Kvs ${kvs}, ${code}`,
  ro: `Vană zonală cu 3 căi Termojet ${size(dn, inch)} cu servomotor electric 230 V, Kvs ${kvs}, ${code}`,
})
const DRIVE = { uk: 'Електропривід', en: 'Actuator', pl: 'Siłownik', fr: 'Actionneur', de: 'Stellantrieb', ro: 'Servomotor' }
const FOR_MIX = { uk: 'для змішувального клапана', en: 'for mixing valve', pl: 'do zaworu mieszającego', fr: 'pour vanne mélangeuse', de: 'für Mischventil', ro: 'pentru vană de amestec' }
const POINT3 = { uk: '3-точковий', en: '3-point', pl: '3-punktowy', fr: '3 points', de: '3-Punkt', ro: '3 puncte' }
const U = (l, v) => (l === 'uk' ? `${v} В` : `${v} V`)
const S = (l, v) => (l === 'uk' ? `${v} с` : `${v} s`)
const drive3 = (code, sec) => each(l => `${DRIVE[l]} Termojet ${code} ${FOR_MIX[l]}, ${U(l, 230)}, ${POINT3[l]}, ${S(l, sec)}`)

const NAMES = {
  'RMV03100-034': mix(kran, 20, '¾', '6.3', 'int'),
  'RMV03110-100': mix(kran, 25, '1', '6', 'ext'),
  'RMV03100-100': mix(kran, 25, '1', '10', 'int'),
  'RMV03110-114': mix(kran, 32, '1¼', '12', 'ext'),
  'RMV03100-114': mix(kran, 32, '1¼', '16', 'int'),
  'RMV03110-112': mix(kran, 40, '1½', '18', 'ext'),
  'RMV03100-112': mix(kran, 40, '1½', '25', 'int'),
  'RMV03100-200': mix(kran, 50, '2', '40', 'int'),
  TMV121: tmv('¾', '1.6', '20–43'),
  TMV122: tmv('¾', '1.6', '35–60'),
  TMV131: tmv('1', '1.6', '20–43'),
  TMV132: tmv('1', '1.6', '35–60'),
  TMV231: tmv('1', '2.5', '20–43'),
  TMV232: tmv('1', '2.5', '35–60'),
  47025230: zone(25, '1', '8', 'ABF-ZV3-100'),
  47032230: zone(32, '1¼', '13', 'ABF-ZV3-114'),
  'RMV04110-100': mix(kran4, 25, '1', '12', 'int'),
  'RMV04110-114': mix(kran4, 32, '1¼', '18', 'int'),
  'AQUAO401-3-230-120': drive3('401N', 120),
  'AQUAO405-3-230-060': drive3('405N', 60),
  'AQUA411-0-10-24': {
    uk: 'Електропривід Termojet 411 для змішувального клапана, 24 В, керування 0–10 В, 6 Нм',
    en: 'Actuator Termojet 411 for mixing valve, 24 V, 0–10 V control, 6 Nm',
    pl: 'Siłownik Termojet 411 do zaworu mieszającego, 24 V, sterowanie 0–10 V, 6 Nm',
    fr: 'Actionneur Termojet 411 pour vanne mélangeuse, 24 V, commande 0–10 V, 6 Nm',
    de: 'Stellantrieb Termojet 411 für Mischventil, 24 V, Steuerung 0–10 V, 6 Nm',
    ro: 'Servomotor Termojet 411 pentru vană de amestec, 24 V, comandă 0–10 V, 6 Nm',
  },
  'AQUAO412-3-230-060': {
    uk: 'Електропривід Termojet 412N для зонального клапана, 230 В, двопозиційний, 60 с',
    en: 'Actuator Termojet 412N for zone valve, 230 V, two-position, 60 s',
    pl: 'Siłownik Termojet 412N do zaworu strefowego, 230 V, dwupozycyjny, 60 s',
    fr: 'Actionneur Termojet 412N pour vanne de zone, 230 V, deux positions, 60 s',
    de: 'Stellantrieb Termojet 412N für Zonenventil, 230 V, Zweipunkt, 60 s',
    ro: 'Servomotor Termojet 412N pentru vană zonală, 230 V, bipozițional, 60 s',
  },
  TJ413: {
    uk: 'Електропривід Termojet 413 з контролером і датчиком, 230 В, 3-точковий, 5–90 °C',
    en: 'Actuator Termojet 413 with controller and sensor, 230 V, 3-point, 5–90 °C',
    pl: 'Siłownik Termojet 413 ze sterownikiem i czujnikiem, 230 V, 3-punktowy, 5–90 °C',
    fr: 'Actionneur Termojet 413 avec contrôleur et capteur, 230 V, 3 points, 5–90 °C',
    de: 'Stellantrieb Termojet 413 mit Regler und Sensor, 230 V, 3-Punkt, 5–90 °C',
    ro: 'Servomotor Termojet 413 cu controler și senzor, 230 V, 3 puncte, 5–90 °C',
  },
}

// Штамп _srcHash — так само, як translate-content.js (див. apply-kolektor-pidloha-nazvy.js)
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

// TMV122: у всіх мовах підключення ¾", як у TMV121
const OLD_CONN = 'GZ 1″M'
const NEW_CONN = 'GZ ¾”M'
const fixConn = specs => {
  let changed = false
  for (const k of Object.keys(specs)) if (specs[k] === OLD_CONN) { specs[k] = NEW_CONN; changed = true }
  return changed
}

const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)
const rows = db.prepare(`SELECT * FROM products WHERE category_slug = 'klapany'`).all()
const upd = db.prepare('UPDATE products SET name = @name, specs = @specs, i18n = @i18n WHERE id = @id')

const plan = []
const missing = new Set(Object.keys(NAMES))
for (const row of rows) {
  const t = NAMES[row.sku]
  if (!t) continue
  missing.delete(row.sku)
  let i18n = {}
  try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
  const next = { ...row, name: t.uk }
  let changed = next.name !== row.name
  if (row.sku === 'TMV122') {
    const specs = JSON.parse(row.specs || '{}')
    if (fixConn(specs)) { next.specs = JSON.stringify(specs); changed = true }
  }
  for (const lang of LANGS) {
    const tr = i18n[lang]
    if (!tr || typeof tr !== 'object') continue
    if (tr.name !== t[lang]) { tr.name = t[lang]; changed = true }
    if (row.sku === 'TMV122' && tr.specs) {
      const isStr = typeof tr.specs === 'string'
      const sp = isStr ? JSON.parse(tr.specs) : tr.specs
      if (fixConn(sp)) { tr.specs = isStr ? JSON.stringify(sp) : sp; changed = true }
    }
  }
  if (!changed) continue
  const oldHash = srcHash(row)
  const h = srcHash(next)
  if (i18n._srcHash) for (const lang of LANGS) if (i18n[lang] && i18n._srcHash[lang] === oldHash) i18n._srcHash[lang] = h
  next.i18n = JSON.stringify(i18n)
  plan.push(next)
  console.log(`• ${row.sku}: «${row.name}» → «${next.name}»`)
}

if (missing.size) console.log(`⚠️ не знайдено в категорії: ${[...missing].join(', ')}`)
console.log(`\nтоварів до оновлення: ${plan.length} (очікується 23 при першому запуску)`)
if (!APPLY) {
  console.log('Це лише показ. Щоб записати: додай --apply')
} else if (plan.length) {
  db.transaction(() => { for (const p of plan) upd.run(p) })()
  console.log(`✅ оновлено ${plan.length} товарів у ${DBP}`)
} else {
  console.log('✅ змінювати нічого')
}
