/*
 * apply-hbs-thread.js — виправляє приєднувальну різьбу насоса HBS 24-12
 * в описі товару: «1″ ВР (внутрішня різьба накидної гайки)» → «½″ ЗР».
 *
 * Таблиця характеристик товару (specs) від початку мала правильне
 * «G 1/2"», а SEO-опис, дописаний пізніше, суперечив їй і казав 1″ ВР.
 * Правильне значення підтвердив замовник по живому виробу: різьба
 * половина дюйма, зовнішня.
 *
 * Ідемпотентно: якщо старого рядка в описі немає, скрипт нічого не пише.
 *
 *   docker compose exec -T app node backend/scripts/apply-hbs-thread.js
 */
const path = require('path')
const Database = require('better-sqlite3')

const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)

const ID = 'new_38241225'

const REPLACEMENTS = [
  [
    'Підключення: різьба <strong>1″ ВР</strong> (внутрішня різьба накидної гайки).',
    'Підключення: різьба <strong>½″ ЗР</strong> (зовнішня різьба).',
  ],
  [
    '<tr><td>Різьбове підключення</td><td>1″ ВР (внутрішня різьба накидної гайки)</td></tr>',
    '<tr><td>Різьбове підключення</td><td>½″ ЗР (зовнішня різьба)</td></tr>',
  ],
]

const row = db.prepare('SELECT id, description FROM products WHERE id = ?').get(ID)
if (!row) {
  console.log(`товар ${ID} не знайдено — нічого не робимо`)
  process.exit(0)
}

let description = row.description || ''
let changed = 0
for (const [oldText, newText] of REPLACEMENTS) {
  if (description.includes(oldText)) {
    description = description.split(oldText).join(newText)
    changed += 1
  }
}

if (!changed) {
  console.log('різьба вже виправлена — змін не потрібно')
  process.exit(0)
}

db.prepare('UPDATE products SET description = ? WHERE id = ?').run(description, ID)
console.log(`оновлено фрагментів опису: ${changed}`)
