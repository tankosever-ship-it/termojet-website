/*
 * apply-blog-kolektor-links.js — внутрішня лінковка блогу на нову категорію «Колектор для теплої
 * підлоги» (SEO, 16.10.2026). Ідемпотентний, за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-blog-kolektor-links.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-blog-kolektor-links.js --apply
 *
 * Посилання статей (і плитки товарів у портфоліо) на /catalog/kolektory-pidloha («Система підлогового опалення»), чий анкор
 * говорить саме про колектор («колектора теплої підлоги», «колектори з нержавіючої сталі»…),
 * переводимо на /catalog/kolektor-dlya-teployi-pidlogy. Загальні анкори («теплої підлоги»,
 * «систему підлогового опалення») лишаються на батьківській категорії.
 *
 * Рішення приймається за українським анкором; у перекладах міняємо посилання з тим самим
 * порядковим номером — лише якщо їх стільки ж, скільки в українському тексті (інакше мову
 * пропускаємо й показуємо). Штамп _srcHash переставляємо тим мовам, що були актуальні до
 * зміни, — інакше translate-content.js вважав би їх застарілими й перетер би машинним.
 */
const path = require('path')
const crypto = require('crypto')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const LANGS = ['en', 'pl', 'fr', 'de', 'ro']
const OLD = '/catalog/kolektory-pidloha'
const NEW = '/catalog/kolektor-dlya-teployi-pidlogy'
// markdown-посилання на батьківську категорію (з мовним префіксом або без)
const LINK_RE = /\[([^\]]+)\]\(((?:\/[a-z]{2})?)\/catalog\/kolektory-pidloha\)/g
const isManifoldAnchor = a => /колектор/i.test(a)

// Хеш джерела — так само, як translate-content.js (ENTITIES.blog_posts)
const HASH_FIELDS = [['title', 'title', 'text'], ['excerpt', 'excerpt', 'text'], ['content', 'content', 'html'],
  ['category', 'category', 'text'], ['seo_title', 'seo_title', 'text'], ['meta_description', 'meta_description', 'text']]
function srcHash(row) {
  const src = {}
  for (const [key, col] of HASH_FIELDS) {
    const raw = row[col]
    if (raw == null || raw === '' || raw === '{}' || raw === '[]') continue
    src[key] = raw
  }
  return crypto.createHash('sha256').update(JSON.stringify(src)).digest('hex').slice(0, 16)
}

// Замінити посилання з позначеними порядковими номерами
function retarget(text, idxs) {
  let i = -1
  return text.replace(LINK_RE, (m, anchor, prefix) => (++i, idxs.has(i) ? `[${anchor}](${prefix}${NEW})` : m))
}

const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)
const rows = db.prepare(`SELECT * FROM blog_posts WHERE content LIKE ?`).all(`%${OLD})%`)
const upd = db.prepare('UPDATE blog_posts SET content = @content, i18n = @i18n WHERE id = @id')

const plan = []
for (const row of rows) {
  const anchors = [...row.content.matchAll(LINK_RE)].map(m => m[1])
  const idxs = new Set(anchors.map((a, i) => (isManifoldAnchor(a) ? i : -1)).filter(i => i >= 0))
  if (!idxs.size) { console.log(`· ${row.slug}: лишаю на ${OLD} (${anchors.map(a => `«${a}»`).join(', ')})`); continue }

  let i18n = {}
  try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
  const oldHash = srcHash(row)
  const next = { ...row, content: retarget(row.content, idxs) }
  const newHash = srcHash(next)
  const notes = []
  for (const lang of LANGS) {
    const t = i18n[lang]
    if (!t || typeof t.content !== 'string') continue
    const n = [...t.content.matchAll(LINK_RE)].length
    if (n !== anchors.length) { notes.push(`${lang}: ${n} посилань ≠ ${anchors.length} — пропускаю`); continue }
    t.content = retarget(t.content, idxs)
    if (i18n._srcHash?.[lang] === oldHash) i18n._srcHash[lang] = newHash
  }
  next.i18n = JSON.stringify(i18n)
  plan.push(next)
  console.log(`• ${row.slug}: ${[...idxs].map(i => `«${anchors[i]}»`).join(', ')} → ${NEW}`)
  for (const n of notes) console.log(`    ⚠️ ${n}`)
}

// Портфоліо: плитки товарів проєкту (links JSON) з «колектор» у підписі — так само
const pfPlan = []
for (const row of db.prepare('SELECT id, title, links FROM portfolio WHERE links LIKE ?').all(`%"${OLD}"%`)) {
  let links
  try { links = JSON.parse(row.links) } catch { continue }
  let changed = false
  for (const l of links) if (l.url === OLD && isManifoldAnchor(l.label || '')) { l.url = NEW; changed = true }
  if (!changed) continue
  pfPlan.push({ id: row.id, links: JSON.stringify(links) })
  console.log(`• портфоліо #${row.id} «${row.title}»: плитка → ${NEW}`)
}

console.log(`\nстатей до оновлення: ${plan.length}, проєктів портфоліо: ${pfPlan.length}`)
if (!APPLY) {
  console.log('Це лише показ. Щоб записати: додай --apply')
} else if (plan.length || pfPlan.length) {
  const updPf = db.prepare('UPDATE portfolio SET links = @links WHERE id = @id')
  db.transaction(() => { for (const p of plan) upd.run(p); for (const p of pfPlan) updPf.run(p) })()
  console.log(`✅ оновлено ${plan.length} статей і ${pfPlan.length} проєктів у ${DBP}`)
} else {
  console.log('✅ змінювати нічого')
}
