/*
 * apply-newpumps.js — 3 нові серії насосів: GRANDLIFT, MEGA, SILENCER.
 * Дані з Proforma 26GFD40403 + брошур GRANDLIFT/MEGA/SILENCER.
 * Ціни (EUR): SILENCER ×3.5, GRANDLIFT ×4, MEGA ×4.5 від інвойсного EUR, округлено до цілого.
 * Ідемпотентно: оновлює backend/seed-products.json і живу БД (якщо є).
 *   node backend/scripts/apply-newpumps.js
 *   docker compose exec -T app node backend/scripts/apply-newpumps.js
 */
const path = require('path')
const fs = require('fs')
const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const IMG = '/images/nasosy/'

const GL_COMMON = a =>
  `Каналізаційна насосна станція TERMOJET GRANDLIFT ${a} призначена для примусового відведення стічних вод там, де неможливий самопливний дренаж — підвали, цокольні поверхи, санвузли нижче рівня каналізації. Складається з герметичного корозійностійкого PE-бака, занурювального насоса з ріжучим (подрібнювальним) механізмом та інтелектуального блоку керування з РК-дисплеєм. Подрібнювач ефективно ріже засоби гігієни, тканину, волосся та інше сміття. Повний захист: перевантаження, сухий хід, обрив фази, понижена напруга; звуко-світлова сигналізація несправностей. Вбудований нержавіючий зворотний клапан, кілька входів для зручного підключення, повна герметизація — без запахів. Клас захисту насоса IP68.`

const MEGA_DESC = m =>
  `Інтелектуальний циркуляційний насос TERMOJET MEGA ${m} для систем опалення, кондиціонування та ГВП комерційних і великих обʼєктів. Енергоефективний двигун на постійних магнітах із частотним регулюванням забезпечує клас енергоефективності A (EEI ≤ 0,20). Три режими керування: пропорційний тиск, постійний перепад тиску (Δp) та постійна швидкість. Фланцеве зʼєднання DN100, РК-дисплей із відображенням параметрів, захист від сухого ходу. Чавунний корпус, робоче колесо з технополімеру, вал з нержавіючої сталі.`

const SIL_DESC = n =>
  `Підвищувальний (бустерний) насос TERMOJET SILENCER ${n} у шумоізольованому корпусі для автоматичного підвищення тиску води у квартирі, будинку чи системі поливу. Інтелектуальне частотне керування та двигун на постійних магнітах забезпечують стабільний тиск, економію енергії та наднизький рівень шуму (від 45 дБ). Повний набір захистів: перевантаження, сухий хід, пере- та недонапруга, витік. Підходить для питної води. Компактний моноблок — швидкий монтаж.`

// Кожен товар: sku, name, price(EUR, ціле), photo(головне), gallery[], desc, specs
const ROWS = [
  {
    sku: 'MEGA100-120F 450',
    name: 'Насос циркуляційний Termojet MEGA 100-120F 450 (DN100)',
    price: 1360,
    photo: 'mega100-120f.jpg',
    gallery: ['mega100-120f.jpg', 'mega100-120f-graph.png'],
    desc: MEGA_DESC('100-120F 450'),
    specs: {
      'Артикул': 'MEGA100-120F 450',
      'Тип': 'Циркуляційний, інтелектуальний',
      "Зʼєднання": 'Фланець DN100',
      'Напруга': '1×230 В, 50/60 Гц',
      'Потужність': '31–1523 Вт',
      'Макс. струм': '0,28–3,21 А',
      'Макс. напір': '12 м',
      'Макс. продуктивність': '66 м³/год',
      'Робочий тиск': 'PN6 / PN10',
      'Монтажна довжина': '450 мм',
      'Режими керування': 'Пропорційний тиск / Постійний Δp / Постійна швидкість',
      'Клас енергоефективності': 'A (EEI ≤ 0,20)',
      'Двигун': 'Постійні магніти (PM)',
      'Вага': '34,5 кг',
      'Виробник': 'TERMOJET',
    },
  },
  {
    sku: 'GRANDLIFT 20-75SW',
    name: 'Каналізаційна насосна станція Termojet GRANDLIFT 20-75SW (0,75 кВт)',
    price: 1387,
    photo: 'grandlift-20-75sw.jpg',
    gallery: ['grandlift-20-75sw.jpg', 'grandlift-20-75sw-graph.png', 'grandlift-20-75sw-drawing.png'],
    desc: GL_COMMON('20-75SW') + ' Одинарна станція з баком 20 л — компактне рішення для невеликих обʼєктів.',
    specs: {
      'Артикул': 'GRANDLIFT 20-75SW',
      'Тип': 'Каналізаційна станція, одинарна, з ріжучим насосом',
      'Потужність': '0,75 кВт',
      'Напруга': '220 В',
      'Макс. напір': '13 м',
      'Макс. продуктивність': '26 м³/год',
      'Обʼєм бака': '20 л',
      'Макс. прохід частинок': '35 мм',
      'Вхід': 'DN100 / DN40',
      'Вихід': 'DN40',
      'Вентиляція': 'DN40',
      'Зворотний клапан': 'DN40 (в комплекті)',
      'Клас захисту': 'IP68 (насос)',
      'Вага': '24 кг',
      'Виробник': 'TERMOJET',
    },
  },
  {
    sku: 'GRANDLIFT 60-75SW',
    name: 'Каналізаційна насосна станція Termojet GRANDLIFT 60-75SW (0,75 кВт)',
    price: 2027,
    photo: 'grandlift-60-75sw.jpg',
    gallery: ['grandlift-60-75sw.jpg', 'grandlift-60-75sw-graph.png', 'grandlift-60-75sw-drawing.png'],
    desc: GL_COMMON('60-75SW') + ' Бак 60 л, вихід DN80 — для побутових та невеликих комерційних систем.',
    specs: {
      'Артикул': 'GRANDLIFT 60-75SW',
      'Тип': 'Каналізаційна станція, одинарна, з ріжучим насосом',
      'Потужність': '0,75 кВт',
      'Напруга': '220 В / 380 В',
      'Макс. напір': '13 м',
      'Макс. продуктивність': '36 м³/год',
      'Обʼєм бака': '60 л',
      'Макс. прохід частинок': '50 мм',
      'Вхід': 'DN150 / DN100',
      'Вихід': 'DN80',
      'Вентиляція': 'DN40',
      'Зворотний клапан': 'DN80 (в комплекті)',
      'Клас захисту': 'IP68 (насос)',
      'Вага': '32 кг',
      'Виробник': 'TERMOJET',
    },
  },
  {
    sku: 'GRANDLIFT 120-220SW',
    name: 'Каналізаційна насосна станція Termojet GRANDLIFT 120-220SW (2,2 кВт)',
    price: 2773,
    photo: 'grandlift-120-220sw.jpg',
    gallery: ['grandlift-120-220sw.jpg', 'grandlift-120-220sw-graph.png', 'grandlift-120-220sw-drawing.png'],
    desc: GL_COMMON('120-220SW') + ' Потужна одинарна станція 2,2 кВт з баком 120 л і напором до 20 м.',
    specs: {
      'Артикул': 'GRANDLIFT 120-220SW',
      'Тип': 'Каналізаційна станція, одинарна, з ріжучим насосом',
      'Потужність': '2,2 кВт',
      'Напруга': '380 В',
      'Макс. напір': '20 м',
      'Макс. продуктивність': '50 м³/год',
      'Обʼєм бака': '120 л',
      'Макс. прохід частинок': '60 мм',
      'Вхід': 'DN150 / DN100',
      'Вихід': 'DN80',
      'Вентиляція': 'DN40',
      'Зворотний клапан': 'DN80 (в комплекті)',
      'Клас захисту': 'IP68 (насос)',
      'Вага': '67 кг',
      'Виробник': 'TERMOJET',
    },
  },
  {
    sku: 'GRANDLIFT 150-370DW',
    name: 'Каналізаційна насосна станція Termojet GRANDLIFT 150-370DW (2×3,7 кВт, двонасосна)',
    price: 4698,
    photo: 'grandlift-150-370dw.png',
    gallery: ['grandlift-150-370dw.png', 'grandlift-150-370dw-graph.png', 'grandlift-150-370dw-drawing.png'],
    desc: GL_COMMON('150-370DW') + ' Двонасосна станція (2×3,7 кВт) з баком 150 л, напором до 26,5 м і продуктивністю до 71 м³/год. Робота насосів по черзі та одночасно за пікового навантаження — максимальна надійність.',
    specs: {
      'Артикул': 'GRANDLIFT 150-370DW',
      'Тип': 'Каналізаційна станція, двонасосна, з ріжучим насосом',
      'Потужність': '2×3,7 кВт',
      'Напруга': '3×380 В',
      'Макс. напір': '26,5 м',
      'Макс. продуктивність': '71 м³/год',
      'Обʼєм бака': '150 л',
      'Макс. прохід частинок': '60 мм',
      'Вхід': 'DN150 / DN100',
      'Вихід': 'DN80',
      'Вентиляція': 'DN40',
      'Зворотний клапан': 'DN80 (в комплекті)',
      'Клас захисту': 'IP68 (насос)',
      'Вага': '135 кг',
      'Виробник': 'TERMOJET',
    },
  },
  {
    sku: 'SILENCER300',
    name: 'Насос підвищувальний Termojet SILENCER 300 (0,32 кВт)',
    price: 207,
    photo: 'silencer300.png',
    gallery: ['silencer300.png', 'silencer-graph.png'],
    desc: SIL_DESC('300'),
    specs: {
      'Артикул': 'SILENCER300',
      'Тип': 'Підвищувальний, інтелектуальний (частотний)',
      'Потужність': '0,32 кВт',
      'Напруга': '1×160–260 В, 50/60 Гц',
      'Макс. напір': '32 м',
      'Макс. продуктивність': '3,6 м³/год',
      "Зʼєднання": '1″ × 1″',
      'Рівень шуму': 'від 45 дБ',
      'Температура середовища': '2–65 °C',
      'Двигун': 'Постійні магніти (PM)',
      'Захист': 'Перевантаження / сухий хід / пере- і недонапруга / витік',
      'Виробник': 'TERMOJET',
    },
  },
  {
    sku: 'SILENCER900',
    name: 'Насос підвищувальний Termojet SILENCER 900 (0,9 кВт)',
    price: 377,
    photo: 'silencer900.png',
    gallery: ['silencer900.png', 'silencer-graph.png'],
    desc: SIL_DESC('900'),
    specs: {
      'Артикул': 'SILENCER900',
      'Тип': 'Підвищувальний, інтелектуальний (частотний)',
      'Потужність': '0,9 кВт',
      'Напруга': '1×180–270 В, 50/60 Гц',
      'Макс. напір': '55 м',
      'Макс. продуктивність': '7,5 м³/год',
      "Зʼєднання": '1½″ × 1½″',
      'Рівень шуму': 'від 45 дБ',
      'Температура середовища': '2–65 °C',
      'Двигун': 'Постійні магніти (PM)',
      'Захист': 'Перевантаження / сухий хід / пере- і недонапруга / витік',
      'Виробник': 'TERMOJET',
    },
  },
]

function slugOf(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

const products = ROWS.map(r => ({
  id: 'pump_' + slugOf(r.sku),
  wpId: null,
  name: r.name,
  slug: 'pump-' + slugOf(r.sku),
  sku: r.sku,
  price: String(r.price),
  currency: 'EUR',
  categorySlug: 'nasosy',
  subcategory: '',
  image: IMG + r.photo,
  images: r.gallery.map(g => IMG + g),
  shortDesc: r.desc.slice(0, 160),
  description: r.desc,
  specs: r.specs,
  inStock: true,
  features: [],
}))

// ---------- 1. seed-products.json ----------
const raw = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const arr = Array.isArray(raw) ? raw : raw.products
const byId = new Map(arr.map(p => [p.id, p]))

let added = 0, upd = 0
for (const np of products) {
  if (byId.has(np.id)) { Object.assign(byId.get(np.id), np); upd++ }
  else { arr.push(np); byId.set(np.id, np); added++ }
}
fs.writeFileSync(SEED, JSON.stringify(Array.isArray(raw) ? arr : raw, null, 2) + '\n')
console.log(`seed: нових ${added}, оновлено ${upd}`)

// ---------- 2. жива БД ----------
if (!fs.existsSync(DBP)) { console.log('БД немає — пропуск'); process.exit(0) }
const Database = require('better-sqlite3')
const db = new Database(DBP)
const tx = db.transaction(() => {
  const ins = db.prepare(`INSERT INTO products (id, wp_id, name, slug, sku, price, category_slug, subcategory,
      image, images, short_desc, description, specs, features, in_stock, is_visible)
      VALUES (@id,@wp_id,@name,@slug,@sku,@price,@category_slug,@subcategory,@image,@images,
      @short_desc,@description,@specs,@features,1,1)`)
  const updt = db.prepare(`UPDATE products SET name=@name, slug=@slug, sku=@sku, price=@price,
      category_slug=@category_slug, subcategory=@subcategory, image=@image, images=@images,
      short_desc=@short_desc, description=@description, specs=@specs, features=@features,
      in_stock=1, is_visible=1 WHERE id=@id`)
  for (const np of products) {
    const pl = {
      id: np.id, wp_id: np.wpId, name: np.name, slug: np.slug, sku: np.sku,
      price: parseFloat(np.price) || 0, category_slug: np.categorySlug, subcategory: np.subcategory,
      image: np.image, images: JSON.stringify(np.images), short_desc: np.shortDesc,
      description: np.description, specs: JSON.stringify(np.specs), features: JSON.stringify(np.features),
    }
    if (db.prepare('SELECT id FROM products WHERE id=?').get(np.id)) updt.run(pl)
    else ins.run(pl)
  }
})
tx()
db.close()
console.log('БД оновлено. Готово.')
