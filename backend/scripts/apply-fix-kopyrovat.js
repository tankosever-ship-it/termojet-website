/*
 * apply-fix-kopyrovat.js — прибирає залишок дублювання товару "(Копировать)"
 * з насоса wp_20495 і чистить перехресні лінки на нього в інших товарах.
 *
 * Що робить:
 *   1) wp_20495: знімає маркер копії з назви всіма мовами
 *      (Копировать/Copy/Kopia/Kopie/Copie) + виправляє слаг (…-kopyrovat → …).
 *   2) У решти товарів оновлює лінки в описах (description/short_desc/i18n),
 *      що вказували на старий слаг …-kopyrovat, на новий.
 *
 * Запуск на проді:
 *   docker compose exec -T app node backend/scripts/apply-fix-kopyrovat.js
 */
const path = require('path')
const Database = require('better-sqlite3')

const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)

const OLD_SLUG = 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-ape-25-60-180-mm-kopyrovat'
const NEW_SLUG = 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-ape-25-60-180-mm'

// Маркер копії в дужках наприкінці назви, різними мовами
const COPY_RE = /\s*\((?:Копировать|Копия|Копі[яї]|Copy|Kopia|Kopie|Copie)\)\s*$/iu

const tx = db.transaction(() => {
  // 1) Сам товар: назва (UA) + i18n-назви + слаг
  const p = db.prepare('SELECT id, name, i18n FROM products WHERE id = ?').get('wp_20495')
  if (!p) { console.log('❌ wp_20495 не знайдено — пропускаю'); return }

  const newName = p.name.replace(COPY_RE, '')
  let i18n = {}
  try { i18n = JSON.parse(p.i18n || '{}') } catch {}
  for (const lang of Object.keys(i18n)) {
    const tr = i18n[lang]
    if (tr && typeof tr === 'object' && typeof tr.name === 'string') {
      tr.name = tr.name.replace(COPY_RE, '')
    }
  }
  db.prepare('UPDATE products SET name = ?, slug = ?, i18n = ? WHERE id = ?')
    .run(newName, NEW_SLUG, JSON.stringify(i18n), 'wp_20495')
  console.log('✅ wp_20495')
  console.log('   назва →', newName)
  console.log('   слаг  →', NEW_SLUG)

  // 2) Перехресні лінки на старий слаг у описах інших товарів
  const like = '%' + OLD_SLUG + '%'
  const rows = db.prepare(
    'SELECT id, description, short_desc, i18n FROM products WHERE description LIKE ? OR short_desc LIKE ? OR i18n LIKE ?'
  ).all(like, like, like)
  const upd = db.prepare('UPDATE products SET description = ?, short_desc = ?, i18n = ? WHERE id = ?')
  let cnt = 0
  for (const r of rows) {
    const nd = (r.description || '').split(OLD_SLUG).join(NEW_SLUG)
    const ns = (r.short_desc || '').split(OLD_SLUG).join(NEW_SLUG)
    const ni = (r.i18n || '').split(OLD_SLUG).join(NEW_SLUG)
    upd.run(nd, ns, ni, r.id)
    cnt++
  }
  console.log(`✅ перехресні лінки оновлено у ${cnt} товарах`)
})

tx()
db.close()
console.log('Готово.')
