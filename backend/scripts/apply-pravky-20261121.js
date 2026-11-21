/*
 * apply-pravky-20261121.js — правки власниці 21.11.2026 (Акція / розпродаж).
 * Ідемпотентний (ключ — SKU), за замовчуванням лише показує план.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-pravky-20261121.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-pravky-20261121.js --apply
 *
 * 1. Прибрати з сайту (is_visible = 0): сепаратори бруду TJ-CD-DN32 (43032160), TJ-CD-DN50M (43050440)
 *    і автоматичні повітровідвідники Air Vent DN15/DN20/DN25 (41015110, 41020110, 41025110).
 *    301 зі старих адрес — PRODUCT_SLUG_ALIASES у server.js.
 * 2. Сепаратор повітря TJ-CA-DN25 (42025185) — фото як у TJ-CA-DN32 (42032200).
 * Перед записом — WAL-безпечний бекап (VACUUM INTO → termojet.db.bak-pravky-20261121-<час>).
 */
const path = require('path')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
const HIDE = ['43032160', '43050440', '41015110', '41020110', '41025110']
const PHOTO_FROM = { '42025185': '42032200' }   // кому → з кого брати фото

const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)
const get = sku => db.prepare('SELECT id, sku, slug, name, is_visible, image, images FROM products WHERE sku = ?').get(sku)

const hide = [], photo = [], missing = []
for (const sku of HIDE) {
  const r = get(sku)
  if (!r) { missing.push(sku); continue }
  if (r.is_visible === 0) continue
  hide.push(r)
  console.log(`• ${sku}  ${String(r.name).slice(0, 80)}\n    приховати (slug ${r.slug})`)
}
for (const [to, from] of Object.entries(PHOTO_FROM)) {
  const t = get(to), f = get(from)
  if (!t || !f) { missing.push(!t ? to : from); continue }
  if (t.image === f.image && t.images === f.images) continue
  photo.push({ id: t.id, image: f.image, images: f.images })
  console.log(`• ${to}  ${String(t.name).slice(0, 80)}\n    фото ${t.image} → ${f.image}`)
}

console.log(`\nприховати: ${hide.length}, замінити фото: ${photo.length}`)
if (missing.length) console.log(`⚠️  SKU, яких нема в БД: ${missing.join(', ')}`)

if (!APPLY) {
  console.log('\nЦе лише показ. Щоб записати: додай --apply')
} else if (hide.length || photo.length) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T-]/g, '')
  const bak = `${DBP}.bak-pravky-20261121-${stamp}`
  db.exec(`VACUUM INTO '${bak.replace(/'/g, "''")}'`)
  console.log(`\nбекап: ${bak}`)
  db.transaction(() => {
    for (const r of hide) db.prepare('UPDATE products SET is_visible = 0 WHERE id = ?').run(r.id)
    for (const p of photo) db.prepare('UPDATE products SET image = @image, images = @images WHERE id = @id').run(p)
  })()
  console.log(`✅ приховано ${hide.length}, фото замінено ${photo.length}`)
} else {
  console.log('\n✅ змінювати нічого')
}
