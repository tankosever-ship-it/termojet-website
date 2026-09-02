/*
 * backup-db.cjs — КОРЕКТНИЙ бекап БД (WAL-safe).
 *
 * ⚠️ ЧОМУ ЦЕ ПОТРІБНО. База працює в режимі journal_mode=wal. Частина
 * закомічених транзакцій живе у файлі `termojet.db-wal`, поки не станеться
 * чекпоінт. Тому `cp termojet.db` / `fs.copyFileSync()` дає НЕПОВНИЙ знімок —
 * стан бази на момент останнього чекпоінта, без усього, що записано пізніше.
 *
 * Реальний випадок (02.09.2026): termojet.db не чекпоінтився з 26.08,
 * termojet.db-wal розрісся до 15.6 МБ (більше за саму базу, 12.5 МБ). Бекап,
 * знятий copyFileSync, містив стан на 26.08 — тиждень правок контенту в ньому
 * просто не було. Відновлення з такого файлу мовчки втратило б ці дані.
 *
 * `VACUUM INTO` виконує SQLite-івський онлайн-бекап: бере узгоджений знімок
 * ВКЛЮЧНО з WAL і кладе його одним самодостатнім файлом (без -wal/-shm).
 *
 * Запуск (у контейнері):
 *   node backend/scripts/backup-db.cjs [суфікс]
 *   → backend/data/termojet.db.bak-<суфікс>-<timestamp>
 */
const fs = require('fs')
const path = require('path')
const Database = require(path.join(__dirname, '..', 'node_modules', 'better-sqlite3'))

const dbPath = path.join(__dirname, '..', 'data', 'termojet.db')
const suffix = process.argv[2] ? `${process.argv[2]}-` : ''
const stamp = new Date().toISOString().slice(0, 19).replace(/[:T-]/g, '')
const out = `${dbPath}.bak-${suffix}${stamp}`

if (fs.existsSync(out)) {
  console.error(`файл уже існує: ${out}`)
  process.exit(1)
}

const db = new Database(dbPath, { readonly: true })
const mode = db.pragma('journal_mode', { simple: true })
const walPath = `${dbPath}-wal`
const walSize = fs.existsSync(walPath) ? fs.statSync(walPath).size : 0
console.log(`journal_mode=${mode}, розмір WAL: ${(walSize / 1048576).toFixed(1)} МБ`)

// VACUUM INTO бачить і базу, і WAL → знімок узгоджений і самодостатній.
db.exec(`VACUUM INTO '${out.replace(/'/g, "''")}'`)
db.close()

// Контроль: знімок відкривається, кількість рядків збігається з джерелом.
const src = new Database(dbPath, { readonly: true })
const dst = new Database(out, { readonly: true })
const tables = src.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(r => r.name)
let ok = true
for (const t of tables) {
  const a = src.prepare(`SELECT COUNT(*) c FROM "${t}"`).get().c
  const b = dst.prepare(`SELECT COUNT(*) c FROM "${t}"`).get().c
  if (a !== b) { ok = false; console.log(`  ❌ ${t}: джерело ${a} ≠ бекап ${b}`) }
}
src.close(); dst.close()

console.log(`бекап: ${out} (${(fs.statSync(out).size / 1048576).toFixed(1)} МБ)`)
console.log(ok ? `✅ звірено ${tables.length} таблиць — кількість рядків збігається` : '❌ РОЗБІЖНІСТЬ, бекап не використовувати')
process.exit(ok ? 0 : 1)
