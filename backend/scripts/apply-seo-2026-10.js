/*
 * apply-seo-2026-10.js — правки каталогу за ТЗ SEO-команди від 02.10.2026.
 * Ідемпотентний, за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-seo-2026-10.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-seo-2026-10.js --apply
 *
 * Перед --apply — бекап (НЕ cp, база у WAL):
 *   docker compose exec app node backend/scripts/backup-db.cjs seo-2026-10
 *
 * Що робить:
 *  1. БИТІ ПОСИЛАННЯ в описах. Переклади (en/pl/fr/de) деяких описів посилались на
 *     slug-и з помилкою транслітерації (…izolyatsiyi замість …izolyacziyi, hidavlichni,
 *     вигадані назви колекторів) — сторінка віддавала 404. Міняємо href на справжній;
 *     посилання на модель, якої в каталозі немає (K22VN.125(150) Mini), знімаємо,
 *     лишаючи текст. Для старих адрес є 301 у server.js (PRODUCT_SLUG_ALIASES).
 *  2. «3-ходов…» → «триходов…» в українських полях усіх товарів (назва, описи,
 *     SEO-поля). На початку назви/речення — з великої літери.
 *  3. Нова категорія «Змішувальний вузол для теплої підлоги»: переносимо туди вузли
 *     TJ-MU з «Системи підлогового опалення». Старі URL віддають 301 (server.js →
 *     handleProduct: категорія в URL ≠ категорії товару).
 *     TJ-MU-25: два речення про «вбудований» насос переписано (6 мов) — суперечили комплектації.
 *  4. TJ-MU: в опис усіма мовами — «циркуляційний насос у комплект постачання не
 *     входить» (короткі описи не чіпаємо: частина з них обірвана на півслові).
 *
 * Де змінилось українське джерело (п. 2, 4) — переставляємо штамп `_srcHash`, інакше
 * translate-content.js вважав би переклад застарілим і перетер би його машинним.
 * Пише лише в живу БД (як і решта apply-скриптів): seed давно не джерело істини.
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']
const TEXT_FIELDS = ['name', 'short_desc', 'description', 'seo_title', 'meta_description']

const NEW_CAT = 'zmishuvalnyj-vuzol-dlya-teployi-pidlogy'
const TJ_MU_SKUS = ['84040TJ-MU-25', 'TJ-MU-10B', 'TJ-MU-40А'] // «А» — кирилична, як у БД

// ── 1. Биті посилання: шлях (без мовного префікса) → правильний шлях або null (зняти) ──
const LINK_FIX = {
  '/catalog/hidravlichni-rozdilnyky/gidrostrilka-gs-26-v-izolyatsiyi': '/catalog/hidravlichni-rozdilnyky/gidrostrilka-gs-26-v-izolyacziyi',
  '/catalog/hidavlichni-rozdilnyky/gidrostrilka-gs-25-v-izolyacziyi': '/catalog/hidravlichni-rozdilnyky/gidrostrilka-gs-25-v-izolyacziyi',
  '/catalog/rozpodilchi-kolektory/k22v-125150-kolektor-v-teploizolyatsiyi-2-vhoru-1-bokovyy-1': '/catalog/rozpodilchi-kolektory/k22v-125150-kolektor-v-teploizolyatsiyi-2-1-vhoru-staryy-art-sk-211-125-mini',
  '/catalog/kolektory-z-hidrostrilkoyu/khs22vn-125-kolektor-z-gidrostrilkoyu-v-teploizolyatsiyi-2-vgoru-vniz-1-bokoviy-1': '/catalog/kolektory-z-hidrostrilkoyu/khs22vn-125150-kolektor-v-teploizolyatsiyi-1-vhoru-vnyz-1-bokovyy-staryy-art-sk-',
  '/catalog/kolektory-z-hidrostrilkoyu/khs31vn-125-kolektor-z-gidrostrilkoyu-v-teploizolyatsiyi-3-vgoru-1-bokoviy-1': '/catalog/kolektory-z-hidrostrilkoyu/khs31vn-125-kolektor-v-teploizolyatsiyi-2-vhoru-1-vnyz-staryy-art-sk-393-125',
  // моделі K22VN.125(150) Mini немає в каталозі — посилання знімаємо, текст лишаємо
  '/catalog/rozpodilchi-kolektory/k22vn-125-kolektor-v-teploizolyatsiyi-2-vgoru-vniz-1-bokovyy-1': null,
}
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function fixLinks(html) {
  if (!html || !html.includes('href')) return html
  let out = html
  for (const [bad, good] of Object.entries(LINK_FIX)) {
    // з мовним префіксом або без: href="/en/catalog/…", href="/catalog/…", повний домен
    const hrefRe = new RegExp(`((?:https?://(?:www\\.)?termojet\\.com\\.ua)?(?:/(?:en|pl|fr|de|ro))?)${escRe(bad)}(?=["#?])`, 'g')
    if (good) {
      out = out.replace(hrefRe, (_, prefix) => prefix + good)
    } else {
      const aRe = new RegExp(`<a\\b[^>]*href="(?:https?://(?:www\\.)?termojet\\.com\\.ua)?(?:/(?:en|pl|fr|de|ro))?${escRe(bad)}"[^>]*>([\\s\\S]*?)</a>`, 'g')
      out = out.replace(aRe, '$1')
    }
  }
  return out
}

// ── 2. «3-ходов…» → «триходов…» (лише українські поля) ──
function triWay(text) {
  if (!text || !/3-ходов/i.test(text)) return text
  return text.replace(/(^|[.!?]\s+|>\s*|\n\s*)?3-ходов/g, (m, lead) =>
    lead !== undefined ? `${lead}Триходов` : 'триходов')
}

// ── 4. Примітка про насос (TJ-MU) ──
const PUMP_NOTE = {
  uk: 'Циркуляційний насос у комплект постачання не входить — його підбирають окремо.',
  en: 'The circulation pump is not included in the scope of delivery — it is selected separately.',
  pl: 'Pompa obiegowa nie wchodzi w zakres dostawy — dobiera się ją osobno.',
  fr: 'Le circulateur n’est pas inclus dans la livraison — il est choisi séparément.',
  de: 'Die Umwälzpumpe ist nicht im Lieferumfang enthalten — sie wird separat ausgewählt.',
  ro: 'Pompa de circulație nu este inclusă în pachetul de livrare — se alege separat.',
}
// TJ-MU-25: опис стверджував «вбудований насос» і «не потрібно підбирати насос окремо» —
// це суперечить комплектації (насос не входить). Точкові заміни цих двох речень у 6 мовах
// (рішення власниці 02.10.2026).
const TJMU25_SKU = '84040TJ-MU-25'
const TJMU25_FIX = {
  uk: [['вбудований циркуляційний насос забезпечує', 'циркуляційний насос (підбирається окремо) забезпечує'],
       ['Готова збірка — не потрібно підбирати клапан, насос і датчик окремо.', 'Готова збірка — клапан, термоголовка й датчик уже змонтовані, лишається підібрати циркуляційний насос.']],
  en: [['the built-in circulation pump ensures', 'the circulation pump (selected separately) ensures'],
       ['Ready assembly — no need to select a valve, pump and sensor separately.', 'Ready assembly — the valve, thermostatic head and sensor are pre-mounted; only the circulation pump has to be selected.']],
  pl: [['wbudowana pompa obiegowa zapewnia', 'pompa obiegowa (dobierana osobno) zapewnia'],
       ['Gotowy zestaw — nie trzeba dobierać zaworu, pompy i czujnika oddzielnie.', 'Gotowy zestaw — zawór, głowica termostatyczna i czujnik są już zamontowane; pozostaje dobrać pompę obiegową.']],
  fr: [['la pompe de circulation intégrée assure', 'la pompe de circulation (choisie séparément) assure'],
       ["Ensemble prêt à l'emploi — inutile de sélectionner séparément la vanne, la pompe et le capteur.", "Ensemble prêt à l'emploi — la vanne, la tête thermostatique et la sonde sont déjà montées ; il reste à choisir le circulateur."]],
  de: [['Die eingebaute Umwälzpumpe sorgt', 'Die Umwälzpumpe (separat auszuwählen) sorgt'],
       ['Fertige Baugruppe — kein separates Auswählen von Ventil, Pumpe und Fühler erforderlich.', 'Fertige Baugruppe — Ventil, Thermostatkopf und Fühler sind vormontiert; nur die Umwälzpumpe ist separat auszuwählen.']],
  ro: [['pompa de circulație integrată asigură', 'pompa de circulație (aleasă separat) asigură'],
       ['Ansamblu gata montat — nu este necesară selectarea separată a vanei, pompei și senzorului.', 'Ansamblu gata montat — vana, capul termostatic și senzorul sunt deja montate; rămâne de ales pompa de circulație.']],
}
const tjmu25Missing = []
function fixTjmu25(text, lang) {
  let out = text || ''
  for (const [from, to] of TJMU25_FIX[lang] || []) {
    if (out.includes(from)) out = out.split(from).join(to)
    else if (!out.includes(to)) tjmu25Missing.push(`${lang}: «${from.slice(0, 40)}…»`)
  }
  return out
}

const hasPumpNote = (text, lang) => String(text || '').includes(PUMP_NOTE[lang])
const addPumpDesc = (text, lang) => hasPumpNote(text, lang) ? text : `${text || ''}\n\n<p><strong>${PUMP_NOTE[lang]}</strong></p>`

// Штамп _srcHash — рахуємо так само, як translate-content.js (див. apply-perelinkuvannya-kotel.js)
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

const rows = db.prepare(`SELECT id, sku, slug, name, category_slug, short_desc, description, specs,
  seo_title, meta_description, subcategory, i18n FROM products`).all()
const upd = db.prepare(`UPDATE products SET name = @name, short_desc = @short_desc, description = @description,
  seo_title = @seo_title, meta_description = @meta_description, category_slug = @category_slug, i18n = @i18n WHERE id = @id`)

const plan = []
const stats = { links: 0, triway: 0, moved: 0, pump: 0 }

for (const row of rows) {
  let i18n = {}
  try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
  const next = { ...row }
  const notes = []
  let srcChanged = false
  let i18nChanged = false

  // 1. посилання — у всіх мовах
  for (const f of TEXT_FIELDS) {
    const v = fixLinks(next[f]); if (v !== next[f]) { next[f] = v; srcChanged = true; notes.push(`посилання uk:${f}`) }
  }
  for (const lang of LANGS.filter(l => l !== 'uk')) {
    const t = i18n[lang]; if (!t) continue
    for (const f of TEXT_FIELDS) {
      if (typeof t[f] !== 'string') continue
      const v = fixLinks(t[f]); if (v !== t[f]) { t[f] = v; i18nChanged = true; notes.push(`посилання ${lang}:${f}`) }
    }
  }
  if (notes.some(n => n.startsWith('посилання'))) stats.links++

  // 2. триходовий — лише uk
  let tri = false
  for (const f of TEXT_FIELDS) {
    const v = triWay(next[f]); if (v !== next[f]) { next[f] = v; srcChanged = true; tri = true }
  }
  if (tri) { stats.triway++; notes.push(`«3-ходов» → «триходов»: ${next.name.slice(0, 60)}`) }

  // 3–4. TJ-MU
  if (TJ_MU_SKUS.includes(row.sku)) {
    if (next.category_slug !== NEW_CAT) { notes.push(`категорія ${row.category_slug} → ${NEW_CAT}`); next.category_slug = NEW_CAT; stats.moved++ }
    let pump = false
    if (row.sku === TJMU25_SKU) {
      const f = fixTjmu25(next.description, 'uk'); if (f !== next.description) { next.description = f; srcChanged = true; notes.push('TJ-MU-25: речення про «вбудований» насос виправлено (uk)') }
      for (const lang of LANGS.filter(l => l !== 'uk')) {
        const t = i18n[lang]; if (!t || !t.description) continue
        const ft = fixTjmu25(t.description, lang); if (ft !== t.description) { t.description = ft; i18nChanged = true; notes.push(`TJ-MU-25: речення про насос виправлено (${lang})`) }
      }
    }
    const d = addPumpDesc(next.description, 'uk'); if (d !== next.description) { next.description = d; srcChanged = true; pump = true }
    for (const lang of LANGS.filter(l => l !== 'uk')) {
      const t = i18n[lang]; if (!t) continue
      const td = t.description ? addPumpDesc(t.description, lang) : t.description
      if (td !== t.description) { t.description = td; i18nChanged = true; pump = true }
    }
    if (pump) { stats.pump++; notes.push('примітка про насос (6 мов)') }
  }

  if (!srcChanged && !i18nChanged && next.category_slug === row.category_slug) continue

  if (srcChanged) {
    // Українське джерело змінилось, а переклади ми оновили тут же — штамп переставляємо
    const h = srcHash(next)
    i18n._srcHash = i18n._srcHash || {}
    for (const lang of LANGS.filter(l => l !== 'uk')) if (i18n[lang]) i18n._srcHash[lang] = h
  }
  next.i18n = JSON.stringify(i18n)
  if (process.argv.includes('--diff')) {
    // показати, ЩО саме зміниться (uk-поля + переклади), по ±60 символів довкола
    const show = (label, a, b) => {
      if (a === b || a == null) return
      let i = 0; while (i < a.length && a[i] === b[i]) i++
      console.log(`      ${label}: …${a.slice(Math.max(0, i - 40), i + 60).replace(/\n/g, ' ')}…`)
      console.log(`      ${' '.repeat(label.length)}→ …${b.slice(Math.max(0, i - 40), i + 90).replace(/\n/g, ' ')}…`)
    }
    for (const f of TEXT_FIELDS) show(`uk:${f}`, row[f], next[f])
    let old = {}; try { old = JSON.parse(row.i18n || '{}') } catch { /* */ }
    for (const lang of LANGS.filter(l => l !== 'uk')) for (const f of TEXT_FIELDS)
      if (old[lang] && i18n[lang]) show(`${lang}:${f}`, old[lang][f], i18n[lang][f])
  }
  plan.push(next)
  console.log(`• ${row.sku || row.id}  ${row.slug.slice(0, 50)}`)
  for (const n of [...new Set(notes)]) console.log(`    ${n}`)
}

console.log(`\nтоварів до зміни: ${plan.length} — посилання ${stats.links}, «триходовий» ${stats.triway}, ` +
  `перенесено в нову категорію ${stats.moved}, примітка про насос ${stats.pump}`)
if (tjmu25Missing.length) console.log(`⚠️  TJ-MU-25: не знайдено речень для заміни (перевір вручну): ${[...new Set(tjmu25Missing)].join('; ')}`)
const foundTjmu = rows.filter(r => TJ_MU_SKUS.includes(r.sku)).length
if (foundTjmu !== TJ_MU_SKUS.length) console.log(`⚠️  знайдено TJ-MU: ${foundTjmu} з ${TJ_MU_SKUS.length}`)

if (!APPLY) {
  console.log('\nЦе лише показ. Щоб записати: додай --apply')
} else if (plan.length) {
  db.transaction(() => { for (const p of plan) upd.run(p) })()
  console.log(`\n✅ оновлено ${plan.length} товарів у ${DBP}`)
} else {
  console.log('\n✅ змінювати нічого')
}
