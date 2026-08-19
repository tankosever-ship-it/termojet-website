#!/usr/bin/env node
/**
 * Авто-переклад контенту з БД (products / blog / portfolio / reviews / faqs) на EN/PL/FR/DE.
 * Заповнює JSON-колонку i18n: { en:{...}, pl:{...}, fr:{...}, de:{...}, _srcHash:{en:'..',..} }.
 * Ідемпотентний: пропускає рядок-мову, якщо хеш UA-джерела не змінився.
 *
 * Запуск:
 *   ANTHROPIC_API_KEY=sk-... node scripts/translate-content.js [--table products] [--limit 10] [--dry-run] [--force]
 * Модель: TRANSLATE_MODEL env (дефолт claude-haiku-4-5). Конкурентність: TRANSLATE_CONCURRENCY (дефолт 5).
 */
const crypto = require('crypto')
const db = require('../db') // тригерить міграції + та сама БД

// Ліниво: SDK потрібен лише для реального прогону (не для --dry-run)
function loadAnthropic() {
  const lib = require('@anthropic-ai/sdk')
  return lib.default || lib
}

const MODEL = process.env.TRANSLATE_MODEL || 'claude-haiku-4-5'
const CONCURRENCY = parseInt(process.env.TRANSLATE_CONCURRENCY || '5', 10)
const LANGS = [
  { code: 'en', name: 'English' },
  { code: 'pl', name: 'Polish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ro', name: 'Romanian' },
]

// --- CLI args ---
const args = process.argv.slice(2)
const getArg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? (args[i + 1] ?? true) : d }
const ONLY_TABLE = getArg('--table', null)
const LIMIT = getArg('--limit', null) ? parseInt(getArg('--limit'), 10) : null
const DRY_RUN = args.includes('--dry-run')
const FORCE = args.includes('--force')

// Які поля кожної таблиці перекладаємо (ключ i18n -> {col, kind})
// kind: 'text' | 'html' | 'json' (specs/tags як JSON-рядок у колонці)
const ENTITIES = {
  products: {
    id: 'id',
    fields: {
      name:        { col: 'name',        kind: 'text' },
      short_desc:  { col: 'short_desc',  kind: 'text' },
      description: { col: 'description', kind: 'html' },
      specs:       { col: 'specs',       kind: 'json' },
      seo_title:   { col: 'seo_title',   kind: 'text' },
      meta_description: { col: 'meta_description', kind: 'text' },
      subcategory: { col: 'subcategory', kind: 'text' },
    },
  },
  blog_posts: {
    id: 'id',
    fields: {
      title:    { col: 'title',    kind: 'text' },
      excerpt:  { col: 'excerpt',  kind: 'text' },
      content:  { col: 'content',  kind: 'html' },
      category: { col: 'category', kind: 'text' },
    },
  },
  portfolio: {
    id: 'id',
    fields: {
      title:       { col: 'title',       kind: 'text' },
      description: { col: 'description', kind: 'html' },
      location:    { col: 'location',    kind: 'text' },
      power:       { col: 'power',       kind: 'text' },
    },
  },
  reviews: {
    id: 'id',
    fields: {
      text:    { col: 'text',    kind: 'text' },
      company: { col: 'company', kind: 'text' },
    },
  },
  faqs: {
    id: 'id',
    fields: {
      question: { col: 'question', kind: 'text' },
      answer:   { col: 'answer',   kind: 'html' },
    },
  },
}

const hash = (s) => crypto.createHash('sha256').update(s || '').digest('hex').slice(0, 16)

// Зібрати об'єкт UA-джерела для рядка (тільки непорожні поля)
function sourceObject(row, fields) {
  const src = {}
  for (const [key, def] of Object.entries(fields)) {
    const raw = row[def.col]
    if (raw == null || raw === '' || raw === '{}' || raw === '[]') continue
    src[key] = { kind: def.kind, value: raw }
  }
  return src
}

const SYS = `You are a professional technical translator for Termojet, a Ukrainian manufacturer of boiler-room equipment (pump groups, manifolds, hydraulic separators, valves, heat pumps).
Translate from Ukrainian to {LANG}. Rules:
- Keep it natural, professional, B2B tone — not word-for-word.
- DO NOT translate: brand names (Termojet, TERMOJET BOX/Mini/Mega, APM, XPS, Grundfos, Wilo), SKU/article codes, numbers, units (мм→mm, кВт→kW, МВт→MW, ₴), model identifiers.
- For HTML fields: preserve ALL tags/attributes exactly; translate only the human-readable text between them.
- For the "specs" object: translate the KEYS (labels like "Підключення до колектора") and any TEXTUAL values; keep numeric/dimension values and units unchanged (e.g. "130 мм"→"130 mm", "1″" stays, "З термокраном"→translate). Keep the same keys count and structure.
- Localize city names (Київ→Kyiv/Kijów/Kiew per language).
Return ONLY the translation in the required structured format.`

function buildSchema(src) {
  const props = {}
  for (const key of Object.keys(src)) {
    if (src[key].kind === 'json') {
      // specs: об'єкт довільних ключів — як рядок JSON, щоб не лочити схему
      props[key] = { type: 'string', description: 'Translated JSON object as a string, same keys/structure' }
    } else {
      props[key] = { type: 'string' }
    }
  }
  return { type: 'object', properties: props, required: Object.keys(props), additionalProperties: false }
}

function buildUserContent(src) {
  const lines = ['Translate these fields. Respond with the same field keys.']
  for (const [key, { kind, value }] of Object.entries(src)) {
    lines.push(`\n### ${key} (${kind})`)
    lines.push(value)
  }
  return lines.join('\n')
}

async function translateRow(client, src, langName) {
  const schema = buildSchema(src)
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYS.replace('{LANG}', langName),
    messages: [{ role: 'user', content: buildUserContent(src) }],
    output_config: { format: { type: 'json_schema', schema } },
  })
  const textBlock = (resp.content || []).find((b) => b.type === 'text')
  if (!textBlock) throw new Error('no text block in response')
  return JSON.parse(textBlock.text)
}

// Простий пул конкурентності
async function runPool(items, worker, concurrency) {
  let i = 0, done = 0
  const results = []
  async function next() {
    while (i < items.length) {
      const idx = i++
      try { results[idx] = await worker(items[idx], idx) }
      catch (e) { results[idx] = { error: e.message } }
      done++
      if (done % 10 === 0 || done === items.length) process.stdout.write(`\r  ${done}/${items.length}`)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next))
  process.stdout.write('\n')
  return results
}

async function main() {
  if (!DRY_RUN && !process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: set ANTHROPIC_API_KEY (or use --dry-run to preview scope).')
    process.exit(1)
  }
  const client = DRY_RUN ? null : new (loadAnthropic())()
  console.log(`Model: ${MODEL} | concurrency: ${CONCURRENCY} | dry-run: ${DRY_RUN} | force: ${FORCE}`)

  const tables = ONLY_TABLE ? [ONLY_TABLE] : Object.keys(ENTITIES)
  for (const table of tables) {
    const cfg = ENTITIES[table]
    if (!cfg) { console.warn(`skip unknown table ${table}`); continue }
    let rows = db.prepare(`SELECT * FROM ${table}`).all()
    if (LIMIT) rows = rows.slice(0, LIMIT)
    console.log(`\n=== ${table} (${rows.length} rows) ===`)

    // Побудувати список одиниць роботи (рядок × мова), що потребують перекладу
    const work = []
    for (const row of rows) {
      const src = sourceObject(row, cfg.fields)
      if (Object.keys(src).length === 0) continue
      const srcHash = hash(JSON.stringify(Object.fromEntries(Object.entries(src).map(([k, v]) => [k, v.value]))))
      let i18n = {}
      try { i18n = JSON.parse(row.i18n || '{}') } catch {}
      for (const lang of LANGS) {
        const fresh = i18n[lang.code] && i18n._srcHash && i18n._srcHash[lang.code] === srcHash
        if (fresh && !FORCE) continue
        work.push({ table, id: row[cfg.id], src, srcHash, lang, i18n })
      }
    }
    console.log(`  needs translation: ${work.length} (row×lang units)`)
    if (DRY_RUN || work.length === 0) continue

    await runPool(work, async (unit) => {
      const tr = await translateRow(client, unit.src, unit.lang.name)
      // нормалізувати specs (рядок JSON → об'єкт), решта — як є
      const langObj = {}
      for (const [key, def] of Object.entries(cfg.fields)) {
        if (tr[key] === undefined) continue
        if (def.kind === 'json') { try { langObj[key] = JSON.parse(tr[key]) } catch { langObj[key] = tr[key] } }
        else langObj[key] = tr[key]
      }
      // зчитати свіжий i18n, оновити свою мову + хеш, записати
      const cur = db.prepare(`SELECT i18n FROM ${unit.table} WHERE ${cfg.id} = ?`).get(unit.id)
      let i18n = {}
      try { i18n = JSON.parse(cur.i18n || '{}') } catch {}
      i18n[unit.lang.code] = langObj
      i18n._srcHash = i18n._srcHash || {}
      i18n._srcHash[unit.lang.code] = unit.srcHash
      db.prepare(`UPDATE ${unit.table} SET i18n = ? WHERE ${cfg.id} = ?`).run(JSON.stringify(i18n), unit.id)
      return { ok: true }
    }, CONCURRENCY)

    const errs = []
    console.log(`  done ${table}`)
  }
  console.log('\nAll done.')
}

main().catch((e) => { console.error(e); process.exit(1) })
