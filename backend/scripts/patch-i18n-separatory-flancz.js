/*
 * patch-i18n.js — накладає вивірені переклади коротких полів поверх машинного перекладу.
 *
 * Навіщо: translate-content.js добре пише довгий description, але регулярно псує
 * коди моделей і одиниці (Dn50 → «DU50/GW50» врозбій, ДУ → «DU/GW/FF»).
 * Цей скрипт міняє лише name, short_desc, seo_title, meta_description, subcategory і specs,
 * а description і _srcHash лишає як є — тому наступний прогін перекладача вважає рядок
 * свіжим і не перетирає виправлене.
 *
 * Порядок:
 *   1) node backend/scripts/apply-separatory-flancz.js
 *   2) node backend/scripts/translate-content.js --table products     (потрібен ANTHROPIC_API_KEY)
 *   3) node backend/scripts/patch-i18n.js                              (цей скрипт)
 *
 * Ідемпотентний. Запуск: docker compose exec -T app node backend/scripts/patch-i18n.js
 */
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

// Штамп _srcHash: рахуємо його точно так, як translate-content.js, щоб наступний
// прогін перекладача вважав ці рядки свіжими й не перетер ручний переклад.
// Логіка звідти: беремо непорожні UA-поля в порядку ENTITIES.products.fields,
// лишаємо лише значення, і sha256 від JSON.stringify перших 16 символів.
const crypto = require('crypto')
const FIELDS = ['name', 'short_desc', 'description', 'specs', 'seo_title',
                'meta_description', 'subcategory']
function srcHash(row) {
  const src = {}
  for (const key of FIELDS) {
    const raw = row[key]
    if (raw == null || raw === '' || raw === '{}' || raw === '[]') continue
    src[key] = raw
  }
  return crypto.createHash('sha256').update(JSON.stringify(src)).digest('hex').slice(0, 16)
}


const DBP = path.join(__dirname, '..', 'data', 'termojet.db')
const DATA = path.join(__dirname, 'separatory-flancz-i18n.json')

const patch = JSON.parse(fs.readFileSync(DATA, 'utf8'))
const db = new Database(DBP)

const sel = db.prepare(`SELECT id, i18n, name, short_desc, description, specs,
  seo_title, meta_description, subcategory FROM products WHERE sku = ?`)
const upd = db.prepare('UPDATE products SET i18n = ? WHERE id = ?')

let touched = 0, missing = []
const tx = db.transaction(() => {
  for (const [sku, langs] of Object.entries(patch)) {
    const row = sel.get(sku)
    if (!row) { missing.push(sku); continue }
    let i18n = {}
    try { i18n = JSON.parse(row.i18n || '{}') } catch { i18n = {} }
    const h = srcHash(row)
    i18n._srcHash = i18n._srcHash || {}
    for (const [code, fields] of Object.entries(langs)) {
      i18n[code] = Object.assign({}, i18n[code], fields)
      i18n._srcHash[code] = h        // переклад відповідає поточному UA-джерелу
    }
    upd.run(JSON.stringify(i18n), row.id)
    touched++
    const noDesc = Object.keys(langs).filter(c => !i18n[c].description)
    console.log(`  ${sku}: мов ${Object.keys(langs).length}, hash ${h}` +
      (noDesc.length ? `, БЕЗ ОПИСУ: ${noDesc.join(', ')}` : ', описи на місці'))
  }
})
tx()
db.close()
if (missing.length) console.warn(`НЕ ЗНАЙДЕНО в БД: ${missing.join(', ')}`)
console.log(`Готово. Оновлено товарів: ${touched}`)
