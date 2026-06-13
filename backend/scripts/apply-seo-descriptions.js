/*
 * apply-seo-descriptions.js — застосувати описи + SEO title/meta + фікс specs.
 * Джерела (у backend/scripts/, бо саме backend копіюється в Docker):
 *   seo-descriptions-data.json = [{slug, description}]
 *   seo-meta-data.json         = [{slug, seoTitle, metaDescription}]
 * Оновлює: seed-products.json (JSON-парс, надійно) та живу БД. Ідемпотентно.
 *   node backend/scripts/apply-seo-descriptions.js            (локально: seed + лок.БД)
 *   docker compose exec -T app node backend/scripts/apply-seo-descriptions.js   (сервер: seed + БД)
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..')
const DESC = path.join(__dirname, 'seo-descriptions-data.json')
const META = path.join(__dirname, 'seo-meta-data.json')
const SEED = path.join(__dirname, '..', 'seed-products.json')
const DBP = path.join(__dirname, '..', 'data', 'termojet.db')

const desc = JSON.parse(fs.readFileSync(DESC, 'utf8'))                    // [{slug, description}]
const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : []
const descBySlug = Object.fromEntries(desc.map(d => [d.slug, d.description]))
const metaBySlug = Object.fromEntries(meta.map(m => [m.slug, m]))

// Фікс помилки в specs: APM-F 65/15 довжина 240 → 340
const SPEC_FIX = { 'nasos-czyrkulyaczijnyj-termojet-auto-energozberigayuchyj-apm-65-15f-340-mm': { 'Довжина насоса': '340 мм' } }

// ── seed-products.json (JSON-парс → set → write) ──
{
  const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'))
  const arr = Array.isArray(seed) ? seed : seed.products
  let d = 0, m = 0, sf = 0
  for (const p of arr) {
    if (descBySlug[p.slug] != null) { p.description = descBySlug[p.slug]; d++ }
    if (metaBySlug[p.slug]) { p.seoTitle = metaBySlug[p.slug].seoTitle || ''; p.metaDescription = metaBySlug[p.slug].metaDescription || ''; m++ }
    if (SPEC_FIX[p.slug]) { p.specs = { ...(p.specs || {}), ...SPEC_FIX[p.slug] }; sf++ }
  }
  fs.writeFileSync(SEED, JSON.stringify(seed, null, 2) + '\n')
  console.log(`  seed: описів ${d}, seo/meta ${m}, spec-fix ${sf}`)
}

// ── жива БД ──
try {
  const Database = require('better-sqlite3')
  if (fs.existsSync(DBP)) {
    const db = new Database(DBP)
    const cols = db.prepare('PRAGMA table_info(products)').all().map(c => c.name)
    if (!cols.includes('seo_title')) db.exec("ALTER TABLE products ADD COLUMN seo_title TEXT DEFAULT ''")
    if (!cols.includes('meta_description')) db.exec("ALTER TABLE products ADD COLUMN meta_description TEXT DEFAULT ''")
    const updDesc = db.prepare('UPDATE products SET description = @description WHERE slug = @slug')
    const updMeta = db.prepare('UPDATE products SET seo_title = @seoTitle, meta_description = @metaDescription WHERE slug = @slug')
    let d = 0, m = 0
    for (const u of desc) d += updDesc.run({ slug: u.slug, description: u.description }).changes
    for (const u of meta) m += updMeta.run({ slug: u.slug, seoTitle: u.seoTitle || '', metaDescription: u.metaDescription || '' }).changes
    // spec-fix
    let sf = 0
    for (const [slug, patch] of Object.entries(SPEC_FIX)) {
      const row = db.prepare('SELECT specs FROM products WHERE slug = ?').get(slug)
      if (row) { const s = { ...JSON.parse(row.specs || '{}'), ...patch }; db.prepare('UPDATE products SET specs = ? WHERE slug = ?').run(JSON.stringify(s), slug); sf++ }
    }
    db.close()
    console.log(`  БД: описів ${d}, seo/meta ${m}, spec-fix ${sf}`)
  } else { console.log('  БД: файл відсутній — пропуск') }
} catch (e) { console.log('  БД: пропуск (', e.message, ')') }

console.log('apply-seo-descriptions: готово')
