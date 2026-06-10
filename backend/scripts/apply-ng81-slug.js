/*
 * apply-ng81-slug.js — виправляє кириличний слаг товару НГ-81 у живій БД.
 * Було: ...zmishuvача... (кирилиця у URL → проблема SEO/URL).
 * Стало: ...zmishuvacha... (повна латиниця).
 *   docker compose exec -T app node backend/scripts/apply-ng81-slug.js
 */
const path = require('path')
const Database = require('better-sqlite3')

const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const OLD = 'ng-81-nasosna-hrupa-bez-zmishuvача-du65-termojet-mega'
const NEW = 'ng-81-nasosna-hrupa-bez-zmishuvacha-du65-termojet-mega'

const db = new Database(DBP)
const r = db.prepare('UPDATE products SET slug = ? WHERE slug = ?').run(NEW, OLD)
console.log(`Оновлено рядків: ${r.changes} (${OLD} → ${NEW})`)
db.close()
