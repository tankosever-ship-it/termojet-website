/*
 * fix-seo-titles-2026-09.cjs — чистка seo_title (усі 6 мов) за наслідками
 * SEO-перевірки 02.09.2026. Три класи дефектів у ДАНИХ (не в коді):
 *
 *  A. Обірвані розділювачі — title закінчується на «—» або містить «— |»
 *     (залишок від обрізання по довжині у seo-fix-titles.cjs).
 *  B. Дублі title у межах мови — різні товари з ІДЕНТИЧНИМ заголовком.
 *  C. Бренд «Thermojet» замість «Termojet» (німецькі title/description).
 *
 * Пункт B робимо КЕРОВАНИМ ДАНИМИ, а не списком слагів: спершу рахуємо
 * фактичні дублі в кожній мові, і лише для них додаємо розрізнювач.
 * Так само знаходяться дублі, яких нема в українській (напр. пара k32n
 * злилась тільки в pl/fr/de) — і не переписуються 30 заголовків, з яких
 * більшість і так унікальні.
 *
 * Розрізнювачі:
 *   • колектори — типорозмір зі слага kolektor-k<NN><VN>-<dn>-<size>:
 *     «К42В.125» → «К42В.125(200)». Саме так уже зроблено в EN-версіях.
 *   • насосні групи — ліва модифікація («Л» у назві товару):
 *     «НГ-52.150» → «НГ-52.150 Л» (укр), «NG-52.150» → «NG-52.150 L».
 * Групи, які не підпадають під ці правила, НЕ чіпаємо — друкуємо як
 * нерозвʼязані, щоб рішення ухвалила людина.
 *
 * Ідемпотентний: повторний запуск нічого не змінює.
 * Запуск (у контейнері):  node backend/scripts/fix-seo-titles-2026-09.cjs [--dry]
 */
const fs = require('fs')
const path = require('path')
const Database = require(path.join(__dirname, '..', 'node_modules', 'better-sqlite3'))

const DRY = process.argv.includes('--dry')
const dbPath = path.join(__dirname, '..', 'data', 'termojet.db')
const LANGS = ['en', 'pl', 'fr', 'de', 'ro']
const ALL = ['uk', ...LANGS]

const COLLECTOR_RE = /^kolektor-k\d+[a-z]*-(\d+)-(\d+)$/i   // → [, dn, size]

// ── A + C: механічні, застосовуються до всіх ──────────────────────────────
function fixTrunc(t) {
  if (!t) return t
  return t
    .replace(/\s*[—–-]\s*\|/g, ' |')   // «— |» → « |»
    .replace(/\s*[—–-]\s*$/, '')        // хвостове «—»
    .replace(/\s{2,}/g, ' ')
    .trim()
}
const fixBrand = t => (t ? t.replace(/Thermojet/g, 'Termojet') : t)

// ── B: розрізнювачі, застосовуються ТІЛЬКИ до фактичних дублів ────────────
// Типорозмір колектора: «.125» → «.125(200)». Якщо вже є дужка — не чіпаємо.
function addSize(title, slug) {
  const m = slug.match(COLLECTOR_RE)
  if (!m) return null
  const [, dn, size] = m
  if (title.includes(`(${size})`)) return title
  const re = new RegExp(`\\.${dn}(?!\\()`)
  if (!re.test(title)) return null
  return title.replace(re, `.${dn}(${size})`)
}
// Ліва модифікація насосної групи: «НГ-52.150» → «НГ-52.150 Л» / «NG-… L».
function addLeftMark(title, lang) {
  const re = /(НГ|NG)(-\d+(?:\.\d+)?)/
  const m = title.match(re)
  if (!m) return null
  const mark = lang === 'uk' ? 'Л' : 'L'
  const code = m[0]
  if (new RegExp(`${code.replace('.', '\\.')}\\s(?:Л|L)\\b`).test(title)) return title
  // ro подекуди мав кириличний «НГ» — вирівнюємо на латиницю, як в інших мовах
  const norm = lang === 'uk' ? code : code.replace('НГ', 'NG')
  return title.replace(code, `${norm} ${mark}`)
}
const isLeftVariant = name => /\sЛ$|\sЛ\s|\sL$/.test(name || '')

const db = new Database(dbPath)
if (!DRY) {
  const bak = `${dbPath}.bak-seotitles-${new Date().toISOString().slice(0, 19).replace(/[:T-]/g, '')}`
  fs.copyFileSync(dbPath, bak)
  console.log(`бекап БД: ${bak}\n`)
}

const rows = db.prepare('SELECT id, slug, name, is_visible, seo_title, meta_description, i18n FROM products').all()

// Робоча модель: для кожного товару — заголовки всіма мовами + описи.
const work = rows.map(r => {
  let i18n = null
  try { i18n = r.i18n ? JSON.parse(r.i18n) : null } catch {}
  const titles = { uk: r.seo_title || '' }
  const descs = { uk: r.meta_description || '' }
  for (const lg of LANGS) {
    titles[lg] = (i18n && i18n[lg] && i18n[lg].seo_title) || ''
    descs[lg] = (i18n && i18n[lg] && i18n[lg].meta_description) || ''
  }
  return { ...r, i18n, titles, descs, orig: { ...titles }, origD: { ...descs } }
})

const log = { trunc: [], brand: [], dupe: [], unresolved: [] }

// ── Прохід 1: A + C ───────────────────────────────────────────────────────
for (const w of work) {
  for (const lg of ALL) {
    if (w.titles[lg]) {
      const a = fixTrunc(w.titles[lg])
      if (a !== w.titles[lg]) { log.trunc.push(`  ${lg} ${w.slug}\n     - ${w.titles[lg]}\n     + ${a}`); w.titles[lg] = a }
      const c = fixBrand(w.titles[lg])
      if (c !== w.titles[lg]) { log.brand.push(`  ${lg} ${w.slug}: ${w.titles[lg]} → ${c}`); w.titles[lg] = c }
    }
    if (w.descs[lg]) w.descs[lg] = fixBrand(w.descs[lg])
  }
}

// ── Прохід 2: B — розрізнювачі лише для фактичних дублів ──────────────────
const visible = work.filter(w => w.is_visible !== 0)
for (const lg of ALL) {
  const groups = {}
  for (const w of visible) if (w.titles[lg]) (groups[w.titles[lg]] ||= []).push(w)
  for (const [title, members] of Object.entries(groups)) {
    if (members.length < 2) continue
    // Варіант 1: усі учасники — колектори з типорозміром у слазі
    if (members.every(w => COLLECTOR_RE.test(w.slug))) {
      let allOk = true
      const proposed = members.map(w => { const t = addSize(w.titles[lg], w.slug); if (!t) allOk = false; return [w, t] })
      if (allOk && new Set(proposed.map(([, t]) => t)).size === members.length) {
        for (const [w, t] of proposed) {
          if (t !== w.titles[lg]) { log.dupe.push(`  ${lg} ${w.slug}\n     - ${w.titles[lg]}\n     + ${t}`); w.titles[lg] = t }
        }
        continue
      }
    }
    // Варіант 2: пара «звичайна / ліва (Л)» — позначаємо ліву
    const left = members.filter(w => isLeftVariant(w.name))
    if (left.length === 1 && members.length === 2) {
      const w = left[0]
      const t = addLeftMark(w.titles[lg], lg)
      if (t && t !== w.titles[lg] && !members.some(o => o !== w && o.titles[lg] === t)) {
        log.dupe.push(`  ${lg} ${w.slug}\n     - ${w.titles[lg]}\n     + ${t}`)
        w.titles[lg] = t
        continue
      }
    }
    log.unresolved.push(`  ${lg} "${title}" → ${members.map(w => w.slug).join(', ')}`)
  }
}

// ── Запис ─────────────────────────────────────────────────────────────────
const upd = db.prepare('UPDATE products SET seo_title = ?, meta_description = ?, i18n = ? WHERE id = ?')
let touched = 0
const apply = db.transaction(() => {
  for (const w of work) {
    const changed = ALL.some(lg => w.titles[lg] !== w.orig[lg] || w.descs[lg] !== w.origD[lg])
    if (!changed) continue
    touched++
    if (DRY) continue
    const i18n = w.i18n || {}
    for (const lg of LANGS) {
      if (!i18n[lg]) continue
      if (w.orig[lg]) i18n[lg].seo_title = w.titles[lg]
      if (w.origD[lg]) i18n[lg].meta_description = w.descs[lg]
    }
    upd.run(w.titles.uk || w.seo_title, w.descs.uk || w.meta_description, w.i18n ? JSON.stringify(i18n) : w.i18n, w.id)
  }
})
apply()

// ── Звіт ──────────────────────────────────────────────────────────────────
const section = (name, arr) => {
  console.log(`\n=== ${name}: ${arr.length} ===`)
  arr.forEach(s => console.log(s))
}
section('A. Обірвані розділювачі', log.trunc)
section('C. Бренд Thermojet → Termojet', log.brand)
section('B. Розрізнювачі для дублів', log.dupe)
section('⚠️ Нерозвʼязані дублі (потрібне рішення людини)', log.unresolved)
console.log(`\n${DRY ? '[DRY] ' : ''}товарів змінено: ${touched}`)

// ── Контроль: дублі після фіксу (на робочій моделі, працює і в --dry) ─────
console.log('\n=== Дублі title ПІСЛЯ фіксу ===')
for (const lg of ALL) {
  const seen = {}
  for (const w of visible) if (w.titles[lg]) (seen[w.titles[lg]] ||= []).push(w.slug)
  const d = Object.entries(seen).filter(([, v]) => v.length > 1)
  console.log(`  ${lg}: ${d.length}`)
  d.forEach(([t, v]) => console.log(`     "${t}" → ${v.join(', ')}`))
}
db.close()
