const express = require('express')
const db = require('../db')
const { requireAdmin, checkAdmin } = require('./auth')
const { withI18n } = require('./_i18n')

const router = express.Router()

function parseProduct(row) {
  if (!row) return null
  const obj = {
    id:           row.id,
    wpId:         row.wp_id,
    name:         row.name,
    slug:         row.slug,
    sku:          row.sku,
    price:        row.price,
    salePrice:    row.sale_price || 0,
    currency:     row.currency || 'UAH',
    categorySlug: row.category_slug,
    subcategory:  row.subcategory,
    image:        row.image,
    images:       JSON.parse(row.images || '[]'),
    shortDesc:    row.short_desc,
    description:  row.description,
    seoTitle:     row.seo_title || '',
    metaDescription: row.meta_description || '',
    specs:        JSON.parse(row.specs || '{}'),
    features:     JSON.parse(row.features || '[]'),
    inStock:      row.in_stock === 1,
    isVisible:    row.is_visible === 1,
    createdAt:    row.created_at,
  }
  // Пласкі переклади: name_<lang>, desc_<lang>, specs_<lang>, shortDesc_<lang>, тощо.
  // Фронт читає `name_${lang}` (Navbar/Catalog/PDP) і `desc_${lang}` (PDP).
  return withI18n(obj, row.i18n, {
    name: 'name', desc: 'description', shortDesc: 'short_desc',
    specs: 'specs', features: 'features', subcategory: 'subcategory',
    seoTitle: 'seo_title', metaDescription: 'meta_description',
  })
}

// GET /api/products
router.get('/', (req, res) => {
  const { category, search, page = 1, limit = 100 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  // Адмін (з валідним токеном) бачить усі товари, включно з прихованими
  const isAdmin = req.query.admin && checkAdmin(req)
  let query = isAdmin ? 'SELECT * FROM products WHERE 1 = 1' : 'SELECT * FROM products WHERE is_visible = 1'
  const params = []

  if (category) {
    query += ' AND category_slug = ?'
    params.push(category)
  }
  if (search) {
    query += ' AND (name LIKE ? OR sku LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  const total = db.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as c')).get(...params).c
  query += ' ORDER BY name LIMIT ? OFFSET ?'
  params.push(parseInt(limit), offset)

  const rows = db.prepare(query).all(...params)
  res.json({ products: rows.map(parseProduct), total, page: parseInt(page) })
})

// GET /api/products/:slug
router.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(parseProduct(row))
})

// POST /api/products — admin
router.post('/', requireAdmin, (req, res) => {
  const p = req.body
  const stmt = db.prepare(`
    INSERT INTO products (id, wp_id, name, slug, sku, price, sale_price, category_slug, subcategory,
      image, images, short_desc, description, specs, features, in_stock, i18n)
    VALUES (@id, @wp_id, @name, @slug, @sku, @price, @sale_price, @category_slug, @subcategory,
      @image, @images, @short_desc, @description, @specs, @features, @in_stock, @i18n)
  `)
  const id = p.id || `p_${Date.now()}`
  stmt.run({
    id, wp_id: p.wpId || null, name: p.name, slug: p.slug, sku: p.sku || '',
    price: parseFloat(p.price) || 0, sale_price: parseFloat(p.salePrice) || 0,
    category_slug: p.categorySlug || '',
    subcategory: p.subcategory || '', image: p.image || '',
    images: JSON.stringify(p.images || []), short_desc: p.shortDesc || '',
    description: p.description || '', specs: JSON.stringify(p.specs || {}),
    features: JSON.stringify(p.features || []), in_stock: p.inStock !== false ? 1 : 0,
    i18n: p.i18n ? JSON.stringify(p.i18n) : '{}',
  })
  res.status(201).json({ id })
})

// PUT /api/products/:id — admin
router.put('/:id', requireAdmin, (req, res) => {
  const p = req.body
  db.prepare(`
    UPDATE products SET
      name = @name, slug = @slug, sku = @sku, price = @price, sale_price = @sale_price,
      category_slug = @category_slug, subcategory = @subcategory,
      image = @image, images = @images, short_desc = @short_desc,
      description = @description, specs = @specs, features = @features,
      in_stock = @in_stock, is_visible = @is_visible, i18n = COALESCE(@i18n, i18n)
    WHERE id = @id
  `).run({
    id: req.params.id, name: p.name, slug: p.slug, sku: p.sku || '',
    price: parseFloat(p.price) || 0, sale_price: parseFloat(p.salePrice) || 0,
    category_slug: p.categorySlug || '',
    subcategory: p.subcategory || '', image: p.image || '',
    images: JSON.stringify(p.images || []), short_desc: p.shortDesc || '',
    description: p.description || '', specs: JSON.stringify(p.specs || {}),
    features: JSON.stringify(p.features || []),
    in_stock: p.inStock !== false ? 1 : 0,
    is_visible: p.isVisible !== false ? 1 : 0,
    i18n: p.i18n !== undefined ? JSON.stringify(p.i18n) : null,
  })
  res.json({ ok: true })
})

// DELETE /api/products/:id — admin
router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
