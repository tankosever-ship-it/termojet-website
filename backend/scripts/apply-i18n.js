#!/usr/bin/env node
/**
 * Заливка перекладів у прод-БД: оновлює ЛИШЕ колонку i18n по id.
 * Вхід: JSON-файл { "products": { "<id>": <i18nObj>, ... }, "blog_posts": {...} }
 *
 *   node scripts/apply-i18n.js <i18n.json>
 *
 * Безпечно: не торкається name/price/orders тощо — тільки products/blog_posts.i18n.
 */
const fs = require('fs')
const db = require('../db')

const file = process.argv[2]
if (!file) { console.error('usage: node apply-i18n.js <i18n.json>'); process.exit(1) }
const data = JSON.parse(fs.readFileSync(file, 'utf-8'))

for (const table of Object.keys(data)) {
  const rows = data[table]
  const ids = Object.keys(rows)
  const upd = db.prepare(`UPDATE ${table} SET i18n = ? WHERE id = ?`)
  let applied = 0, missing = 0
  const tx = db.transaction(() => {
    for (const id of ids) {
      const res = upd.run(JSON.stringify(rows[id]), id)
      if (res.changes) applied++; else missing++
    }
  })
  tx()
  console.log(`${table}: applied ${applied}, no-match ${missing} (of ${ids.length})`)
}
console.log('Done.')
