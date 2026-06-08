/*
 * apply-blog.js — синхронізує таблицю blog_posts у живій БД із seed-blog.json.
 * Потрібно, бо seedBlog() заливає лише в ПОРОЖНЮ таблицю, а в проді вже були старі пости.
 * Повністю перезаписує контент блогу (видаляє все + вставляє з seed). Ідемпотентно.
 *   docker compose exec -T app node backend/scripts/apply-blog.js
 */
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

const SEED = path.join(__dirname, '..', 'seed-blog.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')

const posts = JSON.parse(fs.readFileSync(SEED, 'utf8'))
const db = new Database(DBP)

const insert = db.prepare(`
  INSERT INTO blog_posts (slug, title, excerpt, content, image, tags, published, category, published_at)
  VALUES (@slug, @title, @excerpt, @content, @image, '[]', @published, @category, @published_at)
`)
const tx = db.transaction(rows => {
  db.prepare('DELETE FROM blog_posts').run()
  for (const p of rows) insert.run(p)
})
tx(posts)
const c = db.prepare('SELECT COUNT(*) c FROM blog_posts').get().c
db.close()
console.log(`blog_posts перезаписано: ${c} постів`)
