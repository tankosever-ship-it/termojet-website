/*
 * apply-pump-media.js — ідемпотентне застосування фото та графіків продуктивності
 * до насосів APM-F / APM / APE та каналізаційних установок WT.
 *
 * Прив'язка до id товару (стабільно, не залежить від артикулів).
 * Оновлює backend/seed-products.json (джерело правди для нової БД)
 * і, якщо існує, живу базу backend/data/termojet.db.
 *
 * Запуск:  node backend/scripts/apply-pump-media.js
 * У контейнері: docker compose exec app node backend/scripts/apply-pump-media.js
 */
const path = require('path')
const fs = require('fs')

const P = '/images/nasosy/'
const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')

// --- ПОВНА ЗАМІНА фото+галереї (image + images) за id ---
// APM-F: одне фото apm-f.png для всіх + графік останнім; WT: головне з коробкою, чисте другим
const REPLACE = {
  'excel_30400822': ['apm-f.png', ['apm-f.png', 'graph-apm-40-8.png']],   // APM-F 40/8
  'wp_20414':       ['apm-f.png', ['apm-f.png', 'graph-apm-40-15.png']],  // APM-F 40/15
  'wp_20422':       ['apm-f.png', ['apm-f.png', 'graph-apm-40-18.png']],  // APM-F 40/18
  'wp_20369':       ['apm-f.png', ['apm-f.png', 'graph-apm-50-10.png']],  // APM-F 50/10
  'wp_20434':       ['apm-f.png', ['apm-f.png', 'graph-apm-50-12.png']],  // APM-F 50/12
  'wp_20442':       ['apm-f.png', ['apm-f.png', 'graph-apm-65-10.png']],  // APM-F 65/10
  'wp_20450':       ['apm-f.png', ['apm-f.png', 'graph-apm-65-12.png']],  // APM-F 65/12
  'wp_20456':       ['apm-f.png', ['apm-f.png', 'graph-apm-65-15.png']],  // APM-F 65/15
  'new_WT400A':     ['wt400a-box.jpg', ['wt400a-box.jpg', 'wt400a.jpg']], // WT 400-A
  'new_WT400B':     ['wt400b-box.jpg', ['wt400b-box.jpg', 'wt400b.jpg']], // WT 400-B
  'new_WT400C':     ['wt400c-box.jpg', ['wt400c-box.jpg', 'wt400c.jpg']], // WT 400-C
  // Підставка під ТН: оригінальне фото — головне, нове — другим
  'wp_8619':        ['https://termojet.com.ua/wp-content/uploads/2023/08/6d9236fe06f7eef5aaa080381f4685e6_1.jpg',
                     ['https://termojet.com.ua/wp-content/uploads/2023/08/6d9236fe06f7eef5aaa080381f4685e6_1.jpg', 'pidstavka-tn.jpg']],
}

// Колектори теплої підлоги — головне фото за кількістю виходів
const KP = '/images/kolektory/'
for (let n = 2; n <= 15; n++) {                 // з витратомірами (В): TJ-W-02..15 → kolektor-v-NN
  const nn = String(n).padStart(2, '0')
  REPLACE['new_84040TJ_W_' + nn] = [KP + 'kolektor-v-' + nn + '.jpg', [KP + 'kolektor-v-' + nn + '.jpg']]
}
for (let n = 2; n <= 10; n++) {                 // з кранами (К): TJ-R-W-02..10 → kolektor-k-NN
  const nn = String(n).padStart(2, '0')
  REPLACE['new_84040TJ_R_W_' + nn] = [KP + 'kolektor-k-' + nn + '.jpg', [KP + 'kolektor-k-' + nn + '.jpg']]
}
// К на 11 і 12 виходів — фото К10 (окремих немає)
REPLACE['new_84040TJ_R_W_11'] = [KP + 'kolektor-k-10.jpg', [KP + 'kolektor-k-10.jpg']]
REPLACE['new_84040TJ_R_W_12'] = [KP + 'kolektor-k-10.jpg', [KP + 'kolektor-k-10.jpg']]

// --- ДОДАТИ графік останнім у галерею (image лишається) за id ---
const APPEND = {
  'wp_20521': 'graph-apm-25-8-32-8.png',    // APM 25/8
  'wp_20516': 'graph-apm-25-12-32-12.png',  // APM 25/12
  'wp_9065':  'graph-apm-25-8-32-8.png',    // APM 32/8
  'wp_9066':  'graph-apm-25-10-32-10.png',  // APM 32/10
  'wp_9067':  'graph-apm-25-12-32-12.png',  // APM 32/12
  'wp_20510': 'graph-ape-6.png',            // APE 20/60/130
  'wp_9060':  'graph-ape-4.png',            // APE 25/40/180
  'wp_9055':  'graph-ape-4.png',            // APE 25/40/130
  'wp_20495': 'graph-ape-6.png',            // APE 25/60/180
  'wp_9062':  'graph-ape-6.png',            // APE 25/60/130
  'wp_9064':  'graph-ape-8.png',            // APE 25/80/130
  'wp_9063':  'graph-ape-8.png',            // APE 25/80/180
  'wp_18514': 'graph-ape-8.png',            // APE 32/80/180
}

// --- ВИПРАВЛЕННЯ артикулів за id ---
// APM 25/8/180 мав помилковий 30401225 (copy-paste коду APM-F 40/12-250) → правильний 30250818
const SKU_FIX = {
  'wp_20521': '30250818',
}

// --- ПЕРЕМІЩЕННЯ між категоріями за id ---
const CATEGORY_FIX = {
  'new_38241225': 'nasosy', // HBS 24-12: з насосних груп → у насоси
}

// --- НОВИЙ товар APM-F 40/12-250 (за зразком 40/15) ---
// ⚠️ sku 30401225 та price 1180 — ТИМЧАСОВІ, уточнити в адмінці.
const NEW_PRODUCTS = [{
  id: 'excel_30401225',
  wpId: null,
  name: 'Насос циркуляційний Termojet AUTO енергозберігаючий APM-F 40/12-250 мм',
  slug: 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-40-12f-250-mm',
  sku: '30401225',
  price: '1180',
  currency: 'EUR',
  categorySlug: 'nasosy',
  subcategory: '',
  image: P + 'apm-f.png',
  images: [P + 'apm-f.png', P + 'graph-apm-40-12.png'],
  shortDesc: 'Опис моделі Висока енергоефективність, коефіцієнт енергоефективності (EEI) < 0. 21. Електрофоретичне покриття корпусу насоса для запобігання корозі. Надійні ущільнення з EPDM-гуми, не потребують об',
  description: 'моделі Висока енергоефективність, коефіцієнт енергоефективності (EEI) < 0. 21. Електрофоретичне покриття корпусу насоса для запобігання корозі. Надійні ущільнення з EPDM-гуми, не потребують обслуговування. Додаткові фланці з різьбою, що полегшую встановлення насоса. Компактний дизайн, що дозволяє економити місце. Захищений двигун, водяне охолодження, рівень шуму роботи до 50 дБ Високоміцний, зносостійкий підшипник забезпечує довгий термін служби. Застосування Системи опалення та охолодження, а також – циркуляція теплоносія в системах сонячної енергії та гарячого водопостачання.',
  specs: {
    'Назва': 'APM-F 40/12',
    'Діаметр': 'Dn 40 фланець',
    'Довжина насоса': '250 мм',
    'Qmax': '24 м³/год',
    'Hmax': '12 м',
    'Споживана потужність': '25-670 W',
    'I max': '3.5 А',
    'Розмір': '415*335*250мм',
    'Маса': '22кг',
    'Температура рідини': '0°C ~ 110°C',
    'Зовнішня температура': '0°C ~ 40°C',
    'Максимальний тиск у системі': '1,0 МПа',
    'Рівень захисту': 'IP44',
    'Напруга': '230 В ± 10% / 50 Гц',
    'Тепловий клас': 'F',
    'Вимоги до перекачуваної рідини': 'чиста, без твердих часток і мінеральних олій, нетоксична, хімічно нейтральна, близька за характеристиками до води',
    'Встановлення': 'вал двигуна повинен знаходитися в горизонтальному положенні',
  },
  inStock: true,
  features: [],
}, {
  id: 'xps_25_6_130',
  wpId: null,
  name: 'Насос циркуляційний Termojet XPS 25/6/130 мм',
  slug: 'nasos-czyrkulyaczijnyj-termojet-xps-25-6-130',
  sku: '33250613',
  price: '60',
  currency: 'EUR',
  categorySlug: 'nasosy',
  subcategory: '',
  image: P + 'xps-25-6-130.jpg',
  images: [P + 'xps-25-6-130.jpg'],
  shortDesc: 'Циркуляційні насоси серії XPS призначені для примусового руху теплоносія в системах опалення та теплої підлоги, охолоджуючого агента в системах кондиціювання.',
  description: 'Циркуляційні насоси серії XPS призначені для примусового руху теплоносія в системах опалення та теплої підлоги, охолоджуючого агента в системах кондиціювання. Насос дозволяє значно збільшити перенесення тепла та підвищити у кілька разів ефективність системи.',
  specs: {
    'Тип насоса': 'Циркуляційний',
    'Міжосьова відстань': '130 мм',
    'Діаметр підключення': '1½″',
    'Тип підключення': 'Конектор',
    'Макс. напір': '6 м',
    'Макс. продуктивність': '3 м³/год',
    'Макс. потужність': '100 Вт',
    'Живлення': '220В / 50 Гц',
    'Макс. температура рідини': '110°C',
    'Рівень захисту': 'IP42',
    'Матеріал корпусу': 'Чавун',
    'Робоче колесо': 'Технополімер',
    'Вал двигуна': 'Кераміка',
    'Обмотка статора двигуна': 'Мідь',
    'Довжина кабелю': '1.3 м',
    'Маса': '3 кг',
    'Гарантія': '2 роки',
    'Виробник': 'TERMOJET',
  },
  inStock: true,
  features: [],
}, {
  id: 'xps_25_6_180b',
  wpId: null,
  name: 'Насос циркуляційний Termojet XPS 25/6/180 мм',
  slug: 'nasos-czyrkulyaczijnyj-termojet-xps-25-6-180b',
  sku: '33250618',
  price: '61.5',
  currency: 'EUR',
  categorySlug: 'nasosy',
  subcategory: '',
  image: P + 'xps-25-6-180b.jpg',
  images: [P + 'xps-25-6-180b.jpg'],
  shortDesc: 'Циркуляційні насоси серії XPS призначені для примусового руху теплоносія в системах опалення та теплої підлоги, охолоджуючого агента в системах кондиціювання.',
  description: 'Циркуляційні насоси серії XPS призначені для примусового руху теплоносія в системах опалення та теплої підлоги, охолоджуючого агента в системах кондиціювання. Насос дозволяє значно збільшити перенесення тепла та підвищити у кілька разів ефективність системи.',
  specs: {
    'Тип насоса': 'Циркуляційний',
    'Міжосьова відстань': '180 мм',
    'Діаметр підключення': '1½″',
    'Тип підключення': 'Ніпель',
    'Макс. напір': '6 м',
    'Макс. продуктивність': '3 м³/год',
    'Макс. потужність': '100 Вт',
    'Живлення': '220В / 50 Гц',
    'Макс. температура рідини': '110°C',
    'Рівень захисту': 'IP42',
    'Матеріал корпусу': 'Чавун',
    'Робоче колесо': 'Технополімер',
    'Вал двигуна': 'Кераміка',
    'Обмотка статора двигуна': 'Мідь',
    'Довжина кабелю': '1.3 м',
    'Маса': '3.2 кг',
    'Гарантія': '2 роки',
    'Виробник': 'TERMOJET',
  },
  inStock: true,
  features: [],
}]

function abs(name) { return (name.startsWith('/') || name.includes('://')) ? name : P + name }

// застосувати зміни до одного товару-обʼєкта (camelCase, як у seed та API)
function applyToObj(p) {
  if (REPLACE[p.id]) {
    const [img, gallery] = REPLACE[p.id]
    p.image = abs(img)
    p.images = gallery.map(abs)
    return true
  }
  if (APPEND[p.id]) {
    const g = abs(APPEND[p.id])
    let imgs = Array.isArray(p.images) ? p.images.slice() : []
    if (p.image && !imgs.includes(p.image)) imgs.unshift(p.image)
    if (!imgs.includes(g)) imgs.push(g)
    p.images = imgs
    return true
  }
  return false
}

let changed = 0, appended = 0, replaced = 0

// ---------- 1. seed-products.json ----------
const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products
const byId = new Map(arr.map(p => [p.id, p]))

for (const p of arr) {
  if (SKU_FIX[p.id] && p.sku !== SKU_FIX[p.id]) {
    console.log(`  ~ артикул ${p.id}: ${p.sku} → ${SKU_FIX[p.id]}`)
    p.sku = SKU_FIX[p.id]
  }
  if (CATEGORY_FIX[p.id] && p.categorySlug !== CATEGORY_FIX[p.id]) {
    console.log(`  ~ категорія ${p.id}: ${p.categorySlug} → ${CATEGORY_FIX[p.id]}`)
    p.categorySlug = CATEGORY_FIX[p.id]
  }
  if (REPLACE[p.id]) { applyToObj(p); replaced++; changed++ }
  else if (APPEND[p.id]) { applyToObj(p); appended++; changed++ }
}
// нові товари (ідемпотентно)
for (const NP of NEW_PRODUCTS) {
  if (!byId.has(NP.id)) {
    arr.push({ ...NP })
    console.log('  + додано новий товар:', NP.name)
  } else {
    Object.assign(byId.get(NP.id), NP)
    console.log('  ~ товар оновлено:', NP.name)
  }
}
fs.writeFileSync(SEED, JSON.stringify(Array.isArray(raw) ? arr : raw, null, 2) + '\n')
console.log(`seed-products.json: замінено ${replaced}, додано графік ${appended}.`)

// ---------- 2. жива БД (якщо є) ----------
if (!fs.existsSync(DBP)) {
  console.log('БД', DBP, 'не знайдено — пропускаю (оновиться при сидуванні порожньої БД).')
  process.exit(0)
}
const Database = require('better-sqlite3')
const db = new Database(DBP)
const ids = [...Object.keys(REPLACE), ...Object.keys(APPEND)]
const getRow = db.prepare('SELECT id, image, images FROM products WHERE id = ?')
const upd = db.prepare('UPDATE products SET image=@image, images=@images WHERE id=@id')

let dbChanged = 0
const tx = db.transaction(() => {
  for (const id of ids) {
    const row = getRow.get(id)
    if (!row) { console.warn('  ! у БД немає товару', id); continue }
    const p = { id, image: row.image, images: JSON.parse(row.images || '[]') }
    applyToObj(p)
    upd.run({ id, image: p.image, images: JSON.stringify(p.images) })
    dbChanged++
  }
  // виправлення артикулів
  for (const [id, sku] of Object.entries(SKU_FIX)) {
    db.prepare('UPDATE products SET sku=? WHERE id=?').run(sku, id)
  }
  // переміщення категорій
  for (const [id, cat] of Object.entries(CATEGORY_FIX)) {
    db.prepare('UPDATE products SET category_slug=? WHERE id=?').run(cat, id)
  }
  // нові товари
  for (const np of NEW_PRODUCTS) {
    const exists = db.prepare('SELECT id FROM products WHERE id=?').get(np.id)
    const payload = {
      id: np.id, wp_id: np.wpId, name: np.name, slug: np.slug, sku: np.sku,
      price: parseFloat(np.price) || 0, category_slug: np.categorySlug, subcategory: np.subcategory || '',
      image: np.image, images: JSON.stringify(np.images), short_desc: np.shortDesc,
      description: np.description, specs: JSON.stringify(np.specs), features: JSON.stringify(np.features || []),
      in_stock: np.inStock ? 1 : 0, is_visible: 1,
    }
    if (exists) {
      db.prepare(`UPDATE products SET name=@name, slug=@slug, sku=@sku, price=@price,
        category_slug=@category_slug, subcategory=@subcategory, image=@image, images=@images,
        short_desc=@short_desc, description=@description, specs=@specs, features=@features,
        in_stock=@in_stock, is_visible=@is_visible WHERE id=@id`).run(payload)
      console.log('  ~ товар у БД оновлено:', np.name)
    } else {
      db.prepare(`INSERT INTO products (id, wp_id, name, slug, sku, price, category_slug, subcategory,
        image, images, short_desc, description, specs, features, in_stock, is_visible)
        VALUES (@id,@wp_id,@name,@slug,@sku,@price,@category_slug,@subcategory,@image,@images,
        @short_desc,@description,@specs,@features,@in_stock,@is_visible)`).run(payload)
      console.log('  + товар у БД додано:', np.name)
    }
  }
})
tx()
db.close()
console.log(`БД termojet.db: оновлено ${dbChanged} товарів + ${NEW_PRODUCTS.length} нових/категорії.`)
console.log('Готово.')
