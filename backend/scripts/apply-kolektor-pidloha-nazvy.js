/*
 * apply-kolektor-pidloha-nazvy.js — назви, meta title і description колекторів теплої підлоги
 * TJ-W-02…15 (SEO-команда, 28.10.2026). Ідемпотентний, за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-kolektor-pidloha-nazvy.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-kolektor-pidloha-nazvy.js --apply
 *
 * Перед --apply — бекап (НЕ cp, база у WAL):
 *   docker compose exec app node backend/scripts/backup-db.cjs kolektor-nazvy
 *
 * Назва:  «Колектор для теплої підлоги на {N} контури/контурів з витратомірами Termojet»
 * Title:  «Купити колектор для теплої підлоги на {N} контури/контурів | Termojet»
 * Descr.: «Колектор Termojet на {N} … 0–5 л/хв, AISI 304, 1"–¾". Ціна {price}, доставка по Україні»
 *
 * {price} — токен, сервер (server.js → handleProduct) підставляє актуальну ціну в грн за
 * курсом: ціни колекторів у євро, тож жорстко вписана сума розійшлася б із карткою.
 * Терміни перекладів — як на сторінці категорії (category-landing.json): rozdzielacz / obwody,
 * distribuitor, Heizkreise. Штамп _srcHash переставляємо мовам, що були актуальні.
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']

// Множина: uk/pl — 2–4 (крім 12–14) одна форма, інше — родовий множини
const few = n => n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)
const T = {
  uk: n => {
    const k = `${n} ${few(n) ? 'контури' : 'контурів'}`
    return {
      name: `Колектор для теплої підлоги на ${k} з витратомірами Termojet`,
      seo_title: `Купити колектор для теплої підлоги на ${k} | Termojet`,
      meta_description: `Колектор Termojet на ${k} з витратомірами 0–5 л/хв, нержавіюча сталь AISI 304, підключення 1"–¾". Ціна {price}, доставка по Україні`,
    }
  },
  en: n => ({
    name: `Underfloor heating manifold for ${n} circuits with flow meters Termojet`,
    seo_title: `Buy underfloor heating manifold for ${n} circuits | Termojet`,
    meta_description: `Termojet manifold for ${n} circuits with 0–5 l/min flow meters, AISI 304 stainless steel, 1"–¾" connection. Price {price}, delivery across Ukraine`,
  }),
  pl: n => {
    const k = `${n} ${few(n) ? 'obwody' : 'obwodów'}`
    return {
      name: `Rozdzielacz do ogrzewania podłogowego na ${k} z przepływomierzami Termojet`,
      seo_title: `Kup rozdzielacz do ogrzewania podłogowego na ${k} | Termojet`,
      meta_description: `Rozdzielacz Termojet na ${k} z przepływomierzami 0–5 l/min, stal nierdzewna AISI 304, przyłącze 1"–¾". Cena {price}, dostawa na terenie Ukrainy`,
    }
  },
  fr: n => ({
    name: `Collecteur pour plancher chauffant ${n} circuits avec débitmètres Termojet`,
    seo_title: `Acheter un collecteur plancher chauffant ${n} circuits | Termojet`,
    meta_description: `Collecteur Termojet ${n} circuits avec débitmètres 0–5 l/min, acier inoxydable AISI 304, raccordement 1"–¾". Prix {price}, livraison en Ukraine`,
  }),
  de: n => ({
    name: `Fußbodenheizungsverteiler für ${n} Heizkreise mit Durchflussmessern Termojet`,
    seo_title: `Fußbodenheizungsverteiler ${n} Heizkreise kaufen | Termojet`,
    meta_description: `Termojet Verteiler für ${n} Heizkreise mit Durchflussmessern 0–5 l/min, Edelstahl AISI 304, Anschluss 1"–¾". Preis {price}, Lieferung in der Ukraine`,
  }),
  ro: n => ({
    name: `Distribuitor pentru încălzire prin pardoseală cu ${n} circuite și debitmetre Termojet`,
    seo_title: `Cumpărați distribuitor încălzire prin pardoseală ${n} circuite | Termojet`,
    meta_description: `Distribuitor Termojet cu ${n} circuite și debitmetre 0–5 l/min, oțel inoxidabil AISI 304, racord 1"–¾". Preț {price}, livrare în Ucraina`,
  }),
}

// Штамп _srcHash — так само, як translate-content.js (див. apply-yevrokonusy.js)
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
const rows = db.prepare(`SELECT * FROM products WHERE category_slug = 'kolektor-dlya-teployi-pidlogy' AND sku LIKE '84040TJ-W-%'`).all()
const upd = db.prepare('UPDATE products SET name = @name, seo_title = @seo_title, meta_description = @meta_description, i18n = @i18n WHERE id = @id')

const plan = []
for (const row of rows) {
  const n = parseInt(String(row.sku).match(/TJ-W-(\d+)$/i)?.[1], 10)
  if (!n) { console.log(`· ${row.sku}: не зрозуміла кількість виходів — пропускаю`); continue }
  let i18n = {}
  try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
  const next = { ...row, ...T.uk(n) }
  let changed = ['name', 'seo_title', 'meta_description'].some(f => next[f] !== row[f])
  for (const lang of LANGS.slice(1)) {
    if (!i18n[lang] || typeof i18n[lang] !== 'object') continue
    const v = T[lang](n)
    for (const f of Object.keys(v)) if (i18n[lang][f] !== v[f]) { i18n[lang][f] = v[f]; changed = true }
  }
  if (!changed) continue
  const oldHash = srcHash(row)
  const h = srcHash(next)
  if (i18n._srcHash) for (const lang of LANGS.slice(1)) if (i18n[lang] && i18n._srcHash[lang] === oldHash) i18n._srcHash[lang] = h
  next.i18n = JSON.stringify(i18n)
  plan.push(next)
  console.log(`• ${row.sku}: «${row.name}» → «${next.name}»`)
}

console.log(`\nколекторів до оновлення: ${plan.length} (очікується 14 при першому запуску)`)
if (!APPLY) {
  console.log('Це лише показ. Щоб записати: додай --apply')
} else if (plan.length) {
  db.transaction(() => { for (const p of plan) upd.run(p) })()
  console.log(`✅ оновлено ${plan.length} колекторів у ${DBP}`)
} else {
  console.log('✅ змінювати нічого')
}
