/*
 * apply-perelinkuvannya-kotel.js — зворотні посилання на пелетний котел
 * із п'яти карток-компаньйонів. Ідемпотентний, за замовчуванням лише показує.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-perelinkuvannya-kotel.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-perelinkuvannya-kotel.js --apply
 *   прибрати:             docker compose exec -T app node backend/scripts/apply-perelinkuvannya-kotel.js --remove --apply
 *
 * НАВІЩО. Картка котла лінкує на насос, гідрострілку, колектор, клапан і сепаратор
 * (див. розділ «Що потрібно для обв'язки»), але сама має лише два входи — меню й
 * sitemap. Блок «Схожі товари» їй не допоможе: він бере товари ЛИШЕ з тієї самої
 * категорії, а котел у «Пелетних котлах» поки один, тож блок порожній.
 * Тому вагу ведемо назад руками — по одному реченню в п'ять карток.
 *
 * Добір: не «схожі товари», а вузли зі схем обв'язки самої інструкції (рис. 13–16),
 * і кожна пара перевірена числом — 15 кВт при перепаді 15 K це ≈0,86 м³/год.
 *
 * Речення додається в УСІ шість мов і зі штампом `_srcHash`, інакше наступний
 * прогін translate-content.js вважав би опис зміненим і перетер би вивірений
 * переклад машинним.
 *
 * Пише лише в живу БД: описи цих товарів давно розійшлися з seed-products.json
 * (правки в адмінці, i18n-патчі), тож seed тут не джерело істини.
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const REMOVE = process.argv.includes('--remove')

const SLUG = 'kotel-peletnyi-termojet-ignis-pro-15-plus'
const HREF = lang => `${lang === 'uk' ? '' : '/' + lang}/catalog/peletni-kotly/${SLUG}`

const LANGS = ['uk', 'en', 'pl', 'fr', 'de', 'ro']

// Назва котла в тексті посилання + хвіст речення для кожної мови.
const TAIL = {
  uk: l => ` — наприклад, в обв'язці <a href="${l}">пелетного котла Termojet Ignis Pro 15 Plus</a> на 15 кВт.`,
  en: l => ` — for example in the hookup of the 15 kW <a href="${l}">Termojet Ignis Pro 15 Plus pellet boiler</a>.`,
  pl: l => ` — na przykład w obiegu <a href="${l}">kotła na pellet Termojet Ignis Pro 15 Plus</a> o mocy 15 kW.`,
  fr: l => ` — par exemple dans le raccordement de la <a href="${l}">chaudière à granulés Termojet Ignis Pro 15 Plus</a> de 15 kW.`,
  de: l => ` — etwa in der Einbindung des 15-kW-<a href="${l}">Pelletkessels Termojet Ignis Pro 15 Plus</a>.`,
  ro: l => ` — de exemplu la racordarea <a href="${l}">cazanului pe peleți Termojet Ignis Pro 15 Plus</a> de 15 kW.`,
}

// Причина, чому саме цей товар стоїть поруч із котлом. Різна для кожного —
// однакове речення в п'яти картках читалось би як шаблон, а не як підказка.
const CLAUSE = {
  TMV132: {
    uk: 'Такий клапан тримає температуру звороту не нижчою ніж 55 °C і захищає теплообмінник від конденсату',
    en: 'A valve like this keeps the return line at or above 55 °C and protects the heat exchanger from condensate',
    pl: 'Taki zawór utrzymuje temperaturę powrotu nie niższą niż 55 °C i chroni wymiennik przed kondensatem',
    fr: 'Une telle vanne maintient le retour à 55 °C minimum et protège l’échangeur du condensat',
    de: 'Ein solches Ventil hält den Rücklauf bei mindestens 55 °C und schützt den Wärmetauscher vor Kondensat',
    ro: 'O astfel de vană menține returul la cel puțin 55 °C și protejează schimbătorul de condens',
  },
  84040025: {
    uk: 'Гідрострілка розв’язує котловий контур із контурами опалення, коли їх кілька',
    en: 'A hydraulic separator decouples the boiler circuit from the heating circuits when there is more than one',
    pl: 'Sprzęgło hydrauliczne rozdziela obieg kotła od obiegów grzewczych, gdy jest ich kilka',
    fr: 'Une bouteille de découplage sépare le circuit chaudière des circuits de chauffage lorsqu’ils sont plusieurs',
    de: 'Eine hydraulische Weiche entkoppelt den Kesselkreis von mehreren Heizkreisen',
    ro: 'Un separator hidraulic decuplează circuitul cazanului de circuitele de încălzire, când sunt mai multe',
  },
  30256018: {
    uk: 'Насос цього типорозміру закриває котловий контур до 25 кВт',
    en: 'A pump of this size covers a boiler circuit of up to 25 kW',
    pl: 'Pompa tego typoszeregu obsługuje obieg kotła do 25 kW',
    fr: 'Un circulateur de cette taille couvre un circuit chaudière jusqu’à 25 kW',
    de: 'Eine Pumpe dieser Baugröße deckt einen Kesselkreis bis 25 kW ab',
    ro: 'O pompă de această mărime acoperă un circuit de cazan de până la 25 kW',
  },
  TJT6G25: {
    uk: 'Сепаратор бруду ставлять перед котлом, щоб шлам не доходив до теплообмінника й насоса',
    en: 'A dirt separator goes in front of the boiler so that sludge never reaches the heat exchanger or the pump',
    pl: 'Separator zanieczyszczeń montuje się przed kotłem, aby szlam nie dotarł do wymiennika i pompy',
    fr: 'Un séparateur de boues se place devant la chaudière pour que les boues n’atteignent ni l’échangeur ni la pompe',
    de: 'Ein Schlammabscheider sitzt vor dem Kessel, damit Schlamm weder Wärmetauscher noch Pumpe erreicht',
    ro: 'Un separator de impurități se montează înaintea cazanului, ca nămolul să nu ajungă la schimbător și la pompă',
  },
  84040211: {
    uk: 'Колектор 2+1 розводить два контури опалення від одного джерела тепла',
    en: 'A 2+1 manifold distributes two heating circuits from a single heat source',
    pl: 'Kolektor 2+1 rozprowadza dwa obiegi grzewcze z jednego źródła ciepła',
    fr: 'Un collecteur 2+1 répartit deux circuits de chauffage depuis une seule source de chaleur',
    de: 'Ein Verteiler 2+1 versorgt zwei Heizkreise aus einer Wärmequelle',
    ro: 'Un colector 2+1 distribuie două circuite de încălzire de la o singură sursă de căldură',
  },
}

const para = (sku, lang) => `\n\n<p>${CLAUSE[sku][lang]}${TAIL[lang](HREF(lang))}</p>`

// Штамп _srcHash — рахуємо так само, як translate-content.js.
const HASH_FIELDS = ['name', 'short_desc', 'description', 'specs', 'seo_title',
                     'meta_description', 'subcategory']
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

const sel = db.prepare(`SELECT id, sku, name, description, i18n, short_desc, specs,
  seo_title, meta_description, subcategory FROM products WHERE sku = ?`)
const upd = db.prepare('UPDATE products SET description = ?, i18n = ? WHERE id = ?')

let changed = 0, already = 0, missing = []
const plan = []

for (const sku of Object.keys(CLAUSE)) {
  const row = sel.get(sku)
  if (!row) { missing.push(sku); continue }

  let i18n = {}
  try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }

  const has = (text, lang) => String(text || '').includes(`href="${HREF(lang)}"`)
  let desc = row.description || ''
  let touched = false

  for (const lang of LANGS) {
    const cur = lang === 'uk' ? desc : (i18n[lang] && i18n[lang].description) || ''
    if (!cur) continue                       // мови без опису не вигадуємо
    let next = cur
    if (REMOVE) {
      const block = para(sku, lang)
      if (cur.includes(block)) next = cur.replace(block, '')
    } else if (!has(cur, lang)) {
      next = cur + para(sku, lang)
    }
    if (next === cur) continue
    touched = true
    if (lang === 'uk') desc = next
    else i18n[lang] = Object.assign({}, i18n[lang], { description: next })
  }

  if (!touched) { already++; continue }

  // UA-джерело змінилось — переставляємо штамп, інакше перекладач вважатиме
  // рядок несвіжим і перетре вивірений переклад машинним.
  const h = srcHash({ ...row, description: desc })
  i18n._srcHash = i18n._srcHash || {}
  for (const lang of LANGS.filter(l => l !== 'uk')) {
    if (i18n[lang]) i18n._srcHash[lang] = h
  }

  plan.push({ id: row.id, sku, name: row.name, desc, i18n })
  changed++
  console.log(`  ${REMOVE ? 'ПРИБРАТИ' : 'ДОДАТИ'}: ${sku}  ${row.name.slice(0, 52)}`)
  console.log(`      ${CLAUSE[sku].uk.slice(0, 70)}…`)
}

console.log(`\nдо зміни ${changed}, уже як треба ${already}` +
            (missing.length ? `, НЕ ЗНАЙДЕНО: ${missing.join(', ')}` : ''))

if (!APPLY) {
  console.log(`\nЦе лише показ. Щоб записати: додай ${REMOVE ? '--remove --apply' : '--apply'}`)
} else if (changed) {
  db.transaction(() => { for (const p of plan) upd.run(p.desc, JSON.stringify(p.i18n), p.id) })()
  console.log(`\n✅ оновлено ${changed} карток у ${DBP}`)
} else {
  console.log('\n✅ змінювати нічого')
}
