/*
 * apply-gs-flanceva.js — додає фланцеві гідрострілки ГС-31Ф…ГС-34Ф у seed-products.json
 * і в живу БД. Ідемпотентний: повторний запуск оновлює вже наявні рядки за id.
 *
 * ПЕРЕД ЗАПУСКОМ:
 *   1) підставити справжні артикули й ціни в tovary.json (зараз заглушки 84040035…38, price 0);
 *   2) покласти картинки з images/ у public/images/gidrostrilky/;
 *   3) залити 3d/*.step і 3d/*.glb у том /uploads/3d/ і додати рядки з models3d-snippet.js
 *      у src/data/models3d.js.
 *
 * Запуск (з кореня сайту):
 *   cp gidrostrilky-mf/tovary.json backend/scripts/gs-flanceva-data.json
 *   cp gidrostrilky-mf/apply-gs-flanceva.js backend/scripts/
 *   docker compose exec -T app node backend/scripts/apply-gs-flanceva.js
 *
 * Переклади (en/pl/fr/de) після додавання:
 *   docker compose exec -T app node backend/scripts/translate-content.js --table products
 *   (потрібен ANTHROPIC_API_KEY; звірити назви й коди з nazvy-en-pl.md)
 */
const path = require('path')
const fs = require('fs')

const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const DATA = path.join(__dirname, 'gs-flanceva-data.json')

const products = JSON.parse(fs.readFileSync(DATA, 'utf8'))

const noPrice = products.filter(p => !p.price)
if (noPrice.length) {
  console.warn(`УВАГА: без ціни ${noPrice.length} поз.: ${noPrice.map(p => p.sku).join(', ')}`)
}

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

const cols = db.prepare('PRAGMA table_info(products)').all().map(c => c.name)
const hasSeo = cols.includes('seo_title') && cols.includes('meta_description')

const tx = db.transaction(() => {
  const ins = db.prepare(`INSERT INTO products (id, wp_id, name, slug, sku, price, category_slug,
      subcategory, image, images, short_desc, description, specs, features, in_stock, is_visible
      ${hasSeo ? ', seo_title, meta_description' : ''})
      VALUES (@id,@wp_id,@name,@slug,@sku,@price,@category_slug,@subcategory,@image,@images,
      @short_desc,@description,@specs,@features,1,1${hasSeo ? ',@seo_title,@meta_description' : ''})`)
  const updt = db.prepare(`UPDATE products SET name=@name, slug=@slug, sku=@sku, price=@price,
      category_slug=@category_slug, subcategory=@subcategory, image=@image, images=@images,
      short_desc=@short_desc, description=@description, specs=@specs, features=@features,
      in_stock=1, is_visible=1${hasSeo ? ', seo_title=@seo_title, meta_description=@meta_description' : ''}
      WHERE id=@id`)
  for (const np of products) {
    const pl = {
      id: np.id, wp_id: np.wpId, name: np.name, slug: np.slug, sku: np.sku,
      price: parseFloat(np.price) || 0, category_slug: np.categorySlug,
      subcategory: np.subcategory, image: np.image, images: JSON.stringify(np.images),
      short_desc: np.shortDesc, description: np.description,
      specs: JSON.stringify(np.specs), features: JSON.stringify(np.features),
    }
    if (hasSeo) { pl.seo_title = np.seoTitle; pl.meta_description = np.metaDescription }
    if (db.prepare('SELECT id FROM products WHERE id=?').get(np.id)) updt.run(pl)
    else ins.run(pl)
    console.log(`  ${np.sku}  ${np.slug}`)
  }
})
tx()
db.close()
console.log('БД оновлено. Готово.')
