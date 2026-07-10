const express = require('express')
const db = require('../db')
const { requireAdmin } = require('./auth')
const { withI18n } = require('./_i18n')

const router = express.Router()

function parse(r) {
  const obj = { ...r, images: JSON.parse(r.images || '[]'), links: JSON.parse(r.links || '[]') }
  return withI18n(obj, r.i18n, { title: 'title', description: 'description', location: 'location', power: 'power', type: 'type' })
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM portfolio ORDER BY year DESC, id DESC').all().map(parse))
})

router.post('/', requireAdmin, (req, res) => {
  const { title, location, year, power, type, description, images, links, i18n } = req.body
  const result = db.prepare(
    'INSERT INTO portfolio (title, location, year, power, type, description, images, links, i18n) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(title, location||'', year||null, power||'', type||'', description||'', JSON.stringify(images||[]), JSON.stringify(links||[]), i18n ? JSON.stringify(i18n) : '{}')
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/:id', requireAdmin, (req, res) => {
  const { title, location, year, power, type, description, images, links, i18n } = req.body
  // type/links/i18n: якщо поле не надіслано (стара форма) — зберігаємо наявне (COALESCE),
  // щоб курований перелік links і переклади не затирались при редагуванні базових полів.
  db.prepare(`
    UPDATE portfolio SET title=?, location=?, year=?, power=?, type=COALESCE(?, type),
      description=?, images=?, links=COALESCE(?, links), i18n=COALESCE(?, i18n) WHERE id=?
  `).run(
    title, location||'', year||null, power||'',
    type !== undefined ? type : null,
    description||'', JSON.stringify(images||[]),
    links !== undefined ? JSON.stringify(links) : null,
    i18n !== undefined ? JSON.stringify(i18n) : null,
    req.params.id
  )
  res.json({ ok: true })
})

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM portfolio WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
