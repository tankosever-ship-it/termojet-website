/*
 * apply-pravky-20261021.js — правки товарних карток зі звіту «Правки для termojet.com.ua» (21.10.2026,
 * знайдені під час підготовки termojet.pl). Ідемпотентний, за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-pravky-20261021.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-pravky-20261021.js --apply
 *
 * Перед --apply — бекап (НЕ cp, база у WAL):
 *   docker compose exec app node backend/scripts/backup-db.cjs pravky
 *
 * Що робить:
 *  1. Точкові правки текстів і характеристик з pravky-20261021-data/*.json — для української
 *     і всіх перекладів (en/pl/fr/de/ro). Формати записів:
 *       { sku, lang, field, from, to }   — заміна підрядка в name/short_desc/description/seo_title/meta_description
 *       { sku, lang, spec, value }       — нове значення наявної характеристики
 *       { sku, lang, spec, add: true, value }  — нова характеристика (в кінці)
 *       { sku, lang, spec, remove: true } — прибрати характеристику
 *     Повторний запуск: якщо `from` уже немає (а `to` є або це видалення) — запис вважається застосованим.
 *  2. Короткі описи, що лишились від парсингу старого сайту («Опис …», обрізані на ~200 символах
 *     посеред слова), — збираємо наново з першого абзацу повного опису тієї ж мови: цілі речення
 *     до ~230 символів. Так само для перекладів («Description …», «Opis …», «Beschreibung …»).
 *
 *  3. Ряд колекторів «60, 105 і 175 кВт» у статті блогу (id 133) і FAQ (id 13) → 25, 72, 105 і 175 кВт.
 *
 * Де змінилось українське джерело — переставляємо штамп `_srcHash` тим мовам, що були
 * актуальні, інакше translate-content.js вважав би переклад застарілим і перетер би машинним.
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']
const TEXT_FIELDS = ['name', 'short_desc', 'description', 'seo_title', 'meta_description']
const DATA_DIR = path.join(__dirname, 'pravky-20261021-data')

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

// ── Короткий опис із повного ────────────────────────────────────────────────
const ENT = { nbsp: ' ', amp: '&', quot: '"', lt: '<', gt: '>', laquo: '«', raquo: '»', ndash: '–', mdash: '—', hellip: '…', apos: "'" }
const plain = s => String(s || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(#\d+|[a-z]+);/gi, (m, e) => (e[0] === '#' ? String.fromCharCode(+e.slice(1)) : ENT[e.toLowerCase()] ?? ' '))
  .replace(/\s+/g, ' ')
  .replace(/\s+([,.;:!?)])/g, '$1') // пробіл перед розділовим знаком — слід від тегів (<strong>…</strong> ,)
  .trim()
// Кінець речення: . ! ? (з можливою лапкою/дужкою) перед пробілом і великою літерою/цифрою/лапкою, або кінець тексту.
// «0,5 м», «1.5 m», «ΔT=10 °C», «т. ч.» не ріжуть — після крапки там мала літера або цифра без пробілу.
const SENT_END = /[.!?…][»"”)]?(?=\s+[A-ZА-ЯІЇЄҐÀ-ÖØ-ÞĂÂÎȘȚŁŚŻŹĆŃÓĘĄ0-9«"„(]|\s*$)/g
function sentences(text) {
  const out = []
  let last = 0
  SENT_END.lastIndex = 0
  let m
  while ((m = SENT_END.exec(text))) {
    out.push(text.slice(last, m.index + m[0].length).trim())
    last = m.index + m[0].length
  }
  const tail = text.slice(last).trim()
  if (tail) out.push(tail)
  return out.filter(Boolean)
}
const LIMIT = 230
function shortFrom(description) {
  const paras = [...String(description || '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => plain(m[1]))
  const first = paras.find(p => p.length >= 60 && !/[?:]$/.test(p)) || plain(description)
  const sent = sentences(first)
  if (!sent.length) return ''
  let out = sent[0]
  for (const s of sent.slice(1)) {
    if ((out + ' ' + s).length > LIMIT) break
    out += ' ' + s
  }
  return /[.!?…»"”)]$/.test(out) ? out : out + '.'
}
const LEGACY_SHORT = /^\s*(<p>)?\s*(Опис|Description|Opis|Beschreibung|Descriere)(?=\s|$)/

// ── Дані правок ─────────────────────────────────────────────────────────────
const edits = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort()
  .flatMap(f => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')).map((e, i) => ({ ...e, _src: `${f}#${i}` })))

const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)
const rows = db.prepare(`SELECT id, sku, name, short_desc, description, specs, seo_title, meta_description,
  subcategory, i18n FROM products`).all()
const bySku = new Map(rows.map(r => [r.sku, r]))
const upd = db.prepare(`UPDATE products SET name = @name, short_desc = @short_desc, description = @description,
  specs = @specs, seo_title = @seo_title, meta_description = @meta_description, i18n = @i18n WHERE id = @id`)

const errors = []
const work = new Map() // sku → { row, next, i18n }
function slot(sku) {
  if (!work.has(sku)) {
    const row = bySku.get(sku)
    if (!row) return null
    let i18n = {}
    try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
    work.set(sku, { row, next: { ...row }, i18n, notes: [] })
  }
  return work.get(sku)
}
// Доступ до полів мови: uk — колонки рядка (specs — JSON-рядок), інші — об'єкт i18n[lang] (specs — об'єкт)
function getText(w, lang, f) { return lang === 'uk' ? w.next[f] : w.i18n[lang]?.[f] }
function setText(w, lang, f, v) { if (lang === 'uk') w.next[f] = v; else w.i18n[lang][f] = v }
function getSpecs(w, lang) {
  if (lang === 'uk') { try { return JSON.parse(w.next.specs || '{}') } catch { return {} } }
  const s = w.i18n[lang].specs
  if (typeof s === 'string') { try { return JSON.parse(s) } catch { return {} } }
  return s || {}
}
function setSpecs(w, lang, obj) { if (lang === 'uk') w.next.specs = JSON.stringify(obj); else w.i18n[lang].specs = obj }

const stats = { text: 0, spec: 0, already: 0, short: 0 }
for (const e of edits) {
  const w = slot(e.sku)
  if (!w) { errors.push(`${e._src}: товару ${e.sku} немає`); continue }
  if (!LANGS.includes(e.lang)) { errors.push(`${e._src}: невідома мова ${e.lang}`); continue }
  if (e.lang !== 'uk' && (!w.i18n[e.lang] || typeof w.i18n[e.lang] !== 'object')) { errors.push(`${e._src}: у ${e.sku} немає перекладу ${e.lang}`); continue }
  if (e.field) {
    if (!TEXT_FIELDS.includes(e.field)) { errors.push(`${e._src}: поле ${e.field} не підтримується`); continue }
    const cur = getText(w, e.lang, e.field) || ''
    // Вставка (to починається з from) уже зроблена — інакше повторний запуск дописав би вдруге
    if (e.to && e.to.includes(e.from) && cur.includes(e.to)) stats.already++
    else if (cur.includes(e.from)) {
      setText(w, e.lang, e.field, cur.split(e.from).join(e.to))
      stats.text++
      w.notes.push(`${e.lang}.${e.field}: «${e.from.slice(0, 60)}» → «${e.to.slice(0, 60)}»`)
    } else if (!e.to || cur.includes(e.to)) stats.already++ // видалення або заміна вже застосовані
    else errors.push(`${e._src}: ${e.sku} ${e.lang}.${e.field} — не знайдено «${e.from.slice(0, 80)}»`)
  } else if (e.spec) {
    const specs = getSpecs(w, e.lang)
    const has = Object.prototype.hasOwnProperty.call(specs, e.spec)
    if (e.remove) {
      if (!has) { stats.already++; continue }
      delete specs[e.spec]
    } else {
      if (!has && !e.add) { errors.push(`${e._src}: ${e.sku} ${e.lang} — немає характеристики «${e.spec}»`); continue }
      if (specs[e.spec] === e.value) { stats.already++; continue }
      specs[e.spec] = e.value
    }
    setSpecs(w, e.lang, specs)
    stats.spec++
    w.notes.push(`${e.lang}.specs «${e.spec}» → ${e.remove ? '(прибрано)' : `«${e.value}»`}`)
  } else errors.push(`${e._src}: незрозумілий запис`)
}

// Короткі описи: усі товари, де українська або перекладна версія — залишок старого сайту
for (const row of rows) {
  const hit = LEGACY_SHORT.test(row.short_desc || '') ||
    LANGS.slice(1).some(l => { try { return LEGACY_SHORT.test(JSON.parse(row.i18n || '{}')[l]?.short_desc || '') } catch { return false } })
  if (!hit) continue
  const w = slot(row.sku)
  for (const lang of LANGS) {
    if (lang !== 'uk' && !w.i18n[lang]) continue
    const cur = getText(w, lang, 'short_desc') || ''
    if (!LEGACY_SHORT.test(cur)) continue
    const s = shortFrom(getText(w, lang, 'description'))
    if (!s) { errors.push(`${row.sku} ${lang}: порожній опис — короткий не з чого скласти`); continue }
    setText(w, lang, 'short_desc', s)
    stats.short++
    if (process.argv.includes('--show-short')) w.notes.push(`${lang}.short_desc → «${s}»`)
  }
}

// Ряд колекторів за потужністю в загальних текстах: «60, 105 і 175 кВт» → реальні 25/72/105/175 кВт,
// і серії до 8+1 (є 6+1, 8+1). Стаття блогу про Moldova Cazan та FAQ «Як обрати колектор…».
const SITE_TEXT = [
  { table: 'blog_posts', id: 133, cols: ['content', 'i18n'], pairs: [
    ['на 60, 105 і 175 кВт', 'на 25, 72, 105 і 175 кВт'],
    ['in 60, 105 and 175 kW versions', 'in 25, 72, 105 and 175 kW versions'],
    ['w wersjach 60, 105 i 175 kW', 'w wersjach 25, 72, 105 i 175 kW'],
    ['existent en 60, 105 et 175 kW', 'existent en 25, 72, 105 et 175 kW'],
    ['gibt es für 60, 105 und 175 kW', 'gibt es für 25, 72, 105 und 175 kW'],
    ['în variante de 60, 105 și 175 kW', 'în variante de 25, 72, 105 și 175 kW'],
  ] },
  { table: 'faqs', id: 13, cols: ['answer', 'i18n'], pairs: [
    ['від 2+1 до 5+1', 'від 2+1 до 8+1'],
    ['60, 105 або 175 кВт', '25, 72, 105 або 175 кВт'],
    ['from 2+1 to 5+1', 'from 2+1 to 8+1'],
    ['is 60, 105 or 175 kW', 'is 25, 72, 105 or 175 kW'],
  ] },
]
const siteUpd = []
for (const t of SITE_TEXT) {
  const row = db.prepare(`SELECT ${t.cols.join(', ')} FROM ${t.table} WHERE id = ?`).get(t.id)
  if (!row) { console.log(`· ${t.table}#${t.id} немає — пропускаю`); continue }
  const next = { ...row }
  let n = 0
  for (const [from, to] of t.pairs) {
    for (const c of t.cols) if (next[c]?.includes(from)) { next[c] = next[c].split(from).join(to); n++ }
  }
  const missing = t.pairs.filter(([from, to]) => !t.cols.some(c => next[c]?.includes(to)))
  if (missing.length) errors.push(`${t.table}#${t.id}: не знайдено ${missing.map(m => `«${m[0]}»`).join(', ')}`)
  if (n) { siteUpd.push({ t, next }); console.log(`• ${t.table}#${t.id}: замін ${n}`) }
}

const plan = []
for (const w of work.values()) {
  const { row, next, i18n } = w
  const srcChanged = HASH_FIELDS.some(f => next[f] !== row[f])
  if (srcChanged) {
    const oldHash = srcHash(row)
    const h = srcHash(next)
    if (i18n._srcHash) for (const lang of LANGS.slice(1)) if (i18n[lang] && i18n._srcHash[lang] === oldHash) i18n._srcHash[lang] = h
  }
  next.i18n = JSON.stringify(i18n)
  if (next.i18n === row.i18n && !srcChanged) continue
  plan.push(next)
  if (w.notes.length) {
    console.log(`• ${row.sku}  ${row.name.slice(0, 80)}`)
    for (const n of w.notes) console.log(`    ${n}`)
  }
}

console.log(`\nзаписів правок: ${edits.length}; текстових замін: ${stats.text}, характеристик: ${stats.spec}, уже застосовано: ${stats.already}`)
console.log(`коротких описів складено наново: ${stats.short}; товарів до оновлення: ${plan.length}`)
if (errors.length) {
  console.log(`\n❌ помилок: ${errors.length}`)
  for (const e of errors) console.log('   ' + e)
  if (APPLY) { console.log('\nНічого не записано — спершу виправ дані.'); process.exit(1) }
}

if (!APPLY) {
  console.log('\nЦе лише показ. Щоб записати: додай --apply')
} else if (plan.length || siteUpd.length) {
  db.transaction(() => {
    for (const p of plan) upd.run(p)
    for (const { t, next } of siteUpd) {
      db.prepare(`UPDATE ${t.table} SET ${t.cols.map(c => `${c} = @${c}`).join(', ')} WHERE id = @id`).run({ ...next, id: t.id })
    }
  })()
  console.log(`\n✅ оновлено ${plan.length} товарів у ${DBP}`)
} else {
  console.log('\n✅ змінювати нічого')
}
