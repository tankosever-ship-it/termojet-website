const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')
const { withI18n } = require('./_i18n')

const router = express.Router()

function parse(r) {
  const obj = { ...r, tags: JSON.parse(r.tags || '[]'), published: r.published === 1, publishedAt: r.published_at || '',
    seoTitle: r.seo_title || '', metaDescription: r.meta_description || '' }
  return withI18n(obj, r.i18n, { title: 'title', excerpt: 'excerpt', content: 'content', category: 'category', tags: 'tags',
    seoTitle: 'seo_title', metaDescription: 'meta_description' })
}

router.get('/', (req, res) => {
  const admin = req.query.admin === '1'
  const query = admin
    ? 'SELECT * FROM blog_posts ORDER BY created_at DESC'
    : 'SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC'
  res.json(db.prepare(query).all().map(parse))
})

router.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(req.params.slug)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(parse(row))
})

router.post('/', requireAdmin, (req, res) => {
  const { slug, title, excerpt, content, image, tags, published, category, publishedAt, i18n, seoTitle, metaDescription } = req.body
  const result = db.prepare(`
    INSERT INTO blog_posts (slug, title, excerpt, content, image, tags, published, category, published_at, i18n, seo_title, meta_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(slug, title, excerpt||'', content||'', image||'', JSON.stringify(tags||[]), published ? 1 : 0, category||'', publishedAt||'', i18n ? JSON.stringify(i18n) : '{}', seoTitle||'', metaDescription||'')
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  const { slug, title, excerpt, content, image, tags, published, category, publishedAt, i18n, seoTitle, metaDescription } = req.body
  // seoTitle/metaDescription не прийшли (старий клієнт) → лишаємо як є
  db.prepare(`
    UPDATE blog_posts SET slug=?, title=?, excerpt=?, content=?, image=?, tags=?, published=?, category=?, published_at=?, i18n=COALESCE(?, i18n),
      seo_title=COALESCE(?, seo_title), meta_description=COALESCE(?, meta_description)
    WHERE id=?
  `).run(slug, title, excerpt||'', content||'', image||'', JSON.stringify(tags||[]), published ? 1 : 0, category||'', publishedAt||'', i18n !== undefined ? JSON.stringify(i18n) : null,
    seoTitle !== undefined ? seoTitle : null, metaDescription !== undefined ? metaDescription : null, req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
