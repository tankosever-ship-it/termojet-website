/*
 * apply-blog-zonalne.js — додає в блог дві статті про зональне керування опаленням
 * (дротове / бездротове), дані — blog-zonalne-data.js.
 *
 * Ідемпотентно: шукає статтю за slug; немає → INSERT, є → UPDATE тих самих полів.
 * Інші статті не чіпає (на відміну від apply-blog.js, який перезаписує весь блог).
 *
 * Переклади (en/pl/fr/de/ro) кладуться в колонку i18n разом зі штампом `_srcHash`,
 * порахованим так само, як translate-content.js (поля ENTITIES.blog_posts, порожні
 * пропускаються). Без штампа наступний прогін перекладача перетер би ручний переклад.
 *
 * Без --apply лише показує, що буде зроблено.
 *   docker compose exec -T app node backend/scripts/apply-blog-zonalne.js
 *   docker compose exec -T app node backend/scripts/apply-blog-zonalne.js --apply
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const posts = require('./blog-zonalne-data')

const HASH_FIELDS = ['title', 'excerpt', 'content', 'category', 'seo_title', 'meta_description']
function srcHash(p) {
  const src = {}
  for (const key of HASH_FIELDS) {
    const raw = p[key]
    if (raw == null || raw === '' || raw === '{}' || raw === '[]') continue
    src[key] = raw
  }
  return crypto.createHash('sha256').update(JSON.stringify(src)).digest('hex').slice(0, 16)
}

const db = new Database(DBP)
// Колонки seo_title/meta_description додає міграція в db/index.js при старті сервера —
// перевіряємо, щоб скрипт на старій БД не впав посеред запису.
const cols = db.prepare('PRAGMA table_info(blog_posts)').all().map(c => c.name)
for (const c of ['seo_title', 'meta_description', 'i18n', 'category', 'published_at']) {
  if (!cols.includes(c)) { console.error(`✗ у blog_posts немає колонки ${c} — спершу перезапустіть сервер з новим кодом`); process.exit(1) }
}

const sel = db.prepare('SELECT id FROM blog_posts WHERE slug = ?')
const ins = db.prepare(`
  INSERT INTO blog_posts (slug, title, excerpt, content, image, tags, published, category, published_at, i18n, seo_title, meta_description, created_at)
  VALUES (@slug, @title, @excerpt, @content, @image, '[]', 1, @category, @published_at, @i18n, @seo_title, @meta_description, @created_at)
`)
const upd = db.prepare(`
  UPDATE blog_posts SET title=@title, excerpt=@excerpt, content=@content, image=@image, published=1, category=@category,
    published_at=@published_at, i18n=@i18n, seo_title=@seo_title, meta_description=@meta_description
  WHERE id=@id
`)

const tx = db.transaction(() => {
  for (const p of posts) {
    const h = srcHash(p)
    const i18n = { ...p.i18n, _srcHash: Object.fromEntries(Object.keys(p.i18n).map(l => [l, h])) }
    // created_at — порядок у списку блогу (ORDER BY created_at DESC); формат як у SQLite datetime()
    const row = {
      ...p, i18n: JSON.stringify(i18n),
      created_at: p.published_at.replace('T', ' ').replace(/Z$/, ''),
    }
    const cur = sel.get(p.slug)
    console.log(`${cur ? 'ОНОВИТИ' : 'ДОДАТИ'}: /blog/${p.slug}`)
    console.log(`    H1:    ${p.title}`)
    console.log(`    title: ${p.seo_title} (${p.seo_title.length})`)
    console.log(`    desc:  ${p.meta_description} (${p.meta_description.length})`)
    console.log(`    мови:  uk, ${Object.keys(p.i18n).join(', ')} · фото ${p.image}`)
    if (!APPLY) continue
    if (cur) upd.run({ ...row, id: cur.id })
    else ins.run(row)
  }
})
tx()
db.close()
console.log(APPLY ? '\n✓ записано' : '\n(попередній перегляд; запис — з --apply)')
