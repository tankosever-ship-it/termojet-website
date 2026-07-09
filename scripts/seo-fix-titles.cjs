#!/usr/bin/env node
/**
 * SEO-фікс seo_title (UA + i18n.en) — ідемпотентний, безпечний для повторного запуску.
 *
 *   node scripts/seo-fix-titles.cjs [шлях-до-БД]            # dry-run (лише показує зміни)
 *   node scripts/seo-fix-titles.cjs [шлях-до-БД] --apply    # застосувати
 *
 * Робить дві речі:
 *   2.3 Дедуплікація 9 пар (колектори (200)/(240) + НГ-52.150 Л) — розрізняльний маркер у UA+EN.
 *   2.2 Скорочення англійських seo_title > 60 символів (обрізаються в SERP) — правила + fit60.
 *
 * ⚠️ Прод-БД лежить у volume (не в git/seed) — тому цей скрипт КОМІТИМО й ганяємо на сервері
 *    після кожної переінсталяції з seed, інакше зміни зникнуть.
 */
const path = require('path')
// better-sqlite3 живе в backend/node_modules (локально) або /app/backend/node_modules (у контейнері,
// куди цей скрипт копіюється через `docker compose cp`, бо в образ scripts/ не входить).
function loadSqlite() {
  const candidates = [
    'better-sqlite3',
    path.join(__dirname, '..', 'backend', 'node_modules', 'better-sqlite3'),
    '/app/backend/node_modules/better-sqlite3',
  ]
  for (const c of candidates) { try { return require(c) } catch { /* далі */ } }
  throw new Error('better-sqlite3 не знайдено (перевір шляхи node_modules)')
}
const Database = loadSqlite()

const DB_PATH = process.argv[2] && !process.argv[2].startsWith('--')
  ? process.argv[2]
  : path.join(__dirname, '..', 'backend', 'data', 'termojet.db')
const APPLY = process.argv.includes('--apply')

// ── 2.3 Дедуплікація: явна мапа UA + EN (усі ≤60) ────────────────────────────
const DEDUPE = {
  'kolektor-k32n-125-200': { ua: 'Колектор К32Н.125(200) 3+1 вниз в теплоізоляції | Termojet', en: 'Manifold К32Н.125(200) 3+1 Outlets Down | Termojet' },
  'kolektor-k32n-125-240': { ua: 'Колектор К32Н.125(240) 3+1 вниз в теплоізоляції | Termojet', en: 'Manifold К32Н.125(240) 3+1 Outlets Down | Termojet' },
  'kolektor-k42n-125-200': { ua: 'Колектор К42Н.125(200) 4+1 вниз в теплоізоляції | Termojet', en: 'Manifold К42Н.125(200) 4+1 Outlets Down | Termojet' },
  'kolektor-k42n-125-240': { ua: 'Колектор К42Н.125(240) 4+1 вниз в теплоізоляції | Termojet', en: 'Manifold К42Н.125(240) 4+1 Outlets Down | Termojet' },
  'kolektor-k42v-125-200': { ua: 'Колектор К42В.125(200) 4+1 вгору в теплоізоляції | Termojet', en: 'Manifold К42В.125(200) 4+1 Outlets Up | Termojet' },
  'kolektor-k42v-125-240': { ua: 'Колектор К42В.125(240) 4+1 вгору в теплоізоляції | Termojet', en: 'Manifold К42В.125(240) 4+1 Outlets Up | Termojet' },
  'kolektor-k52n-125-200': { ua: 'Колектор К52Н.125(200) 5+1 вниз в теплоізоляції | Termojet', en: 'Manifold К52Н.125(200) 5+1 Outlets Down | Termojet' },
  'kolektor-k52n-125-240': { ua: 'Колектор К52Н.125(240) 5+1 вниз в теплоізоляції | Termojet', en: 'Manifold К52Н.125(240) 5+1 Outlets Down | Termojet' },
  'kolektor-k52v-125-200': { ua: 'Колектор К52В.125(200) 5+1 вгору в теплоізоляції | Termojet', en: 'Manifold К52В.125(200) 5+1 Outlets Up | Termojet' },
  'kolektor-k52v-125-240': { ua: 'Колектор К52В.125(240) 5+1 вгору в теплоізоляції | Termojet', en: 'Manifold К52В.125(240) 5+1 Outlets Up | Termojet' },
  // НГ-52.150: варіант «Л» (у назві товару є Л) відрізняємо від базового.
  'ng-52-zi-zmishuvachem-1-1-4': { ua: 'Насосна група НГ-52.150 Л зі змішувачем 1¼″ | Termojet', en: 'Pump group NG-52.150 L with mixer 1¼″ | Termojet' },
}

// ── 2.2 Скорочення EN > 60 ───────────────────────────────────────────────────
const RULES = [
  [/Distribution Manifold/g, 'Manifold'],
  [/Manifold with Hydraulic Separator/g, 'Manifold + Separator'],
  [/Underfloor Heating Manifold/g, 'Underfloor Manifold'],
  [/Pump group with thermostatic valve/g, 'Pump group, thermostatic valve'],
  [/ with Ball Valves/g, ', Ball Valves'],
  [/ with Flow Meters/g, ', Flow Meters'],
  [/ with Valves/g, ', Valves'],
  [/ — Stainless Steel AISI 304/g, ''],
  [/ — Stainless Steel/g, ''],
  [/ Outlets Down Insulated/g, ' Outlets Down'],
  [/ Outlets Up Insulated/g, ' Outlets Up'],
  [/ Up\+Down Insulated/g, ' Up+Down'],
  [/ Insulated/g, ''],
]
const BRAND = ' | Termojet'

function normalizeBrand(t) {
  return t
    .replace(/\s*[—–-]\s*Buy\s+Termojet\s*$/i, BRAND)
    .replace(/\s+Buy\s*\|\s*Termojet\s*$/i, BRAND)
    .replace(/\s*[—–-]\s*Buy\s*$/i, BRAND)
    .replace(/\s*[—–-]\s*Termojet\s*$/i, BRAND)
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function fit60(t) {
  if (t.length <= 60) {
    // За можливості додаємо бренд, якщо його нема (консистентність), не перевищуючи 60.
    if (!/Termojet/i.test(t) && t.length + BRAND.length <= 60) return t + BRAND
    return t
  }
  let base = t.endsWith(BRAND) ? t.slice(0, -BRAND.length) : t.replace(/\s*[|–—-]\s*Termojet\s*$/i, '')
  const budget = 60 - BRAND.length
  if (base.length > budget) {
    base = base.slice(0, budget).replace(/[\s,\-–—+]+\S*$/, '').replace(/[\s,\-–—+]+$/, '')
  }
  return (base + BRAND).replace(/\s*Termojet\s*\|\s*Termojet\s*$/, ' | Termojet').replace(/\s{2,}/g, ' ')
}

function shortenEn(t) {
  let out = t
  for (const [re, rep] of RULES) out = out.replace(re, rep)
  out = normalizeBrand(out)
  out = fit60(out)
  return out
}

// ── Виконання ────────────────────────────────────────────────────────────────
const db = new Database(DB_PATH)
const rows = db.prepare('SELECT id, slug, seo_title, i18n FROM products WHERE is_visible = 1').all()
const upd = db.prepare('UPDATE products SET seo_title = ?, i18n = ? WHERE id = ?')

let dedupCount = 0, shortenCount = 0
const changes = []

const tx = db.transaction(() => {
  for (const row of rows) {
    let i18n = {}
    try { i18n = row.i18n ? JSON.parse(row.i18n) : {} } catch { i18n = {} }
    let newUa = row.seo_title
    let newEnMeta = i18n.en && i18n.en.seo_title
    let changed = false, kind = ''

    if (DEDUPE[row.slug]) {
      const d = DEDUPE[row.slug]
      newUa = d.ua
      if (i18n.en) newEnMeta = d.en
      kind = 'dedupe'
    } else if (i18n.en && typeof i18n.en.seo_title === 'string' && i18n.en.seo_title.length > 60) {
      newEnMeta = shortenEn(i18n.en.seo_title)
      kind = 'shorten-en'
    }

    if (newUa !== row.seo_title) changed = true
    if (i18n.en && newEnMeta !== i18n.en.seo_title) { i18n.en.seo_title = newEnMeta; changed = true }

    if (changed) {
      if (kind === 'dedupe') dedupCount++; else shortenCount++
      changes.push({ slug: row.slug, kind, ua: newUa !== row.seo_title ? `${row.seo_title}  →  ${newUa}` : null,
        en: (kind !== 'dedupe' || i18n.en) ? `${(kind === 'dedupe' ? DEDUPE[row.slug].en : newEnMeta)}` : null,
        enLen: newEnMeta ? newEnMeta.length : null })
      if (APPLY) upd.run(newUa, JSON.stringify(i18n), row.id)
    }
  }
})
tx()

for (const c of changes) {
  console.log(`\n[${c.kind}] ${c.slug}`)
  if (c.ua) console.log('  UA:', c.ua)
  if (c.en) console.log(`  EN(${c.enLen}):`, c.en)
}
console.log(`\n──────────\nДедуп: ${dedupCount} · Скорочено EN: ${shortenCount} · Разом: ${changes.length}`)
console.log(APPLY ? '✅ ЗАСТОСОВАНО до БД' : 'ℹ️  DRY-RUN (додай --apply щоб записати)')

// Контроль: скільки EN лишилось > 60 (після симуляції в памʼяті це орієнтир для --apply)
db.close()
