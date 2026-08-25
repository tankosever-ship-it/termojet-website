/*
 * apply-pidloha-articles.js — проставляє артикули чотирьом монтажним позиціям
 * теплої підлоги, які досі йшли без артикула ні на сайті, ні в 1С.
 *
 * Труба отримує код 520472, що вже стояв у її назві в 1С; решта — фірмовий ряд
 * 84040TJ, той самий, що в євроконусів (84040TJ-EC-162) і байпаса (84040TJ-B-1),
 * тож у 1С вони не можуть зіткнутися з чужим товаром.
 *
 * Ідемпотентно: шукає товар за внутрішнім id, а не за артикулом, і мовчки
 * пропускає ті, де артикул уже стоїть. `id` і `slug` не чіпаємо — slug є
 * публічним URL, його зміна зламала б індексацію.
 *
 * specs['Артикул'] навмисно НЕ додаємо: у категорії теплої підлоги його має
 * лише 2 товари з 49, і migrateSpecsArticle() у db/index.js додає ключ тільки
 * тим, у кого він уже є.
 *
 *   docker compose exec -T app node backend/scripts/apply-pidloha-articles.js
 */
const path = require('path')
const Database = require('better-sqlite3')

const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)

const ARTICLES = {
  'new_truba-termojet-pe-rt-16-2-6-bar-70-c-500m': '520472',
  'new_skoba-do-takera-45-mm-300-st': '84040TJ-SK-45',
  'new_folsgovana-plivka-z-rozmitkoc': '84040TJ-FP-50',
  'new_taker-termojet-dlh-skob-40-60-mm': '84040TJ-TK-4060',
}

const sel = db.prepare('SELECT id, name, sku FROM products WHERE id = ?')
const upd = db.prepare('UPDATE products SET sku = ? WHERE id = ?')

let set = 0
let skipped = 0
let missing = 0

for (const [id, sku] of Object.entries(ARTICLES)) {
  const row = sel.get(id)
  if (!row) {
    console.log(`✗ ${id} — товару немає в базі`)
    missing++
    continue
  }
  if (row.sku === sku) {
    console.log(`· ${sku} — уже стоїть (${row.name})`)
    skipped++
    continue
  }
  if (row.sku) {
    console.log(`⚠ ${row.name}: артикул уже ${row.sku}, перезаписую на ${sku}`)
  }
  upd.run(sku, id)
  console.log(`✓ ${sku} — ${row.name}`)
  set++
}

console.log(`\nпроставлено: ${set}, уже було: ${skipped}, не знайдено: ${missing}`)

const left = db
  .prepare("SELECT COUNT(*) AS c FROM products WHERE sku IS NULL OR TRIM(sku) = ''")
  .get().c
console.log(`товарів без артикула в базі лишилось: ${left}`)
