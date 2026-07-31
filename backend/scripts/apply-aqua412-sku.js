/*
 * apply-aqua412-sku.js — виправляє артикул електропривода в живій БД:
 * AQUAO910-3-230-060 → AQUAO412-3-230-060.
 *
 * У назві товару модель уже вказана правильно — «…2P+AUX (60 сек.) 412N», —
 * а в артикулі стояло 910. Те саме число виправлено в інструкції на приводи
 * AQUA (manuals/pryvody), тож сайт і друкована документація тепер збігаються.
 *
 * Ідемпотентно: шукає товар за внутрішнім id, а не за артикулом, тож
 * повторний запуск нічого не змінює. `id` і `slug` навмисно не чіпаємо —
 * id прив'язує майбутні скрипти, а slug є публічним URL, і його зміна
 * зламала б індексацію та чужі посилання.
 *
 *   docker compose exec -T app node backend/scripts/apply-aqua412-sku.js
 */
const path = require('path')
const Database = require('better-sqlite3')

const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)

const ID = 'new_AQUAO910_3_230_060'
const OLD = 'AQUAO910-3-230-060'
const NEW = 'AQUAO412-3-230-060'

const row = db.prepare('SELECT id, sku, specs FROM products WHERE id = ?').get(ID)
if (!row) {
  console.log(`товар ${ID} не знайдено — нічого не робимо`)
  process.exit(0)
}

let specs = {}
try { specs = JSON.parse(row.specs || '{}') } catch (e) { specs = {} }

if (row.sku === NEW && specs['Артикул'] === NEW) {
  console.log('артикул уже виправлений — змін не потрібно')
  process.exit(0)
}

specs['Артикул'] = NEW
db.prepare('UPDATE products SET sku = ?, specs = ? WHERE id = ?')
  .run(NEW, JSON.stringify(specs), ID)

const after = db.prepare('SELECT sku, specs FROM products WHERE id = ?').get(ID)
console.log(`${OLD} → ${after.sku}`)
console.log('specs.Артикул =', JSON.parse(after.specs)['Артикул'])
