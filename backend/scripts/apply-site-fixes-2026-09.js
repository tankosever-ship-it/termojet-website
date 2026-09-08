/*
 * apply-site-fixes-2026-09.js — правки характеристик і описів за звіркою з каталогом
 * (розбір 02.09.2026, подвійно перевірений). Ідемпотентний. Чистить ЖИВУ БД.
 *
 *   попередній перегляд:  docker compose exec -T app node backend/scripts/apply-site-fixes-2026-09.js
 *   застосувати:          docker compose exec -T app node backend/scripts/apply-site-fixes-2026-09.js --apply
 *
 * Блоки A/C/D — 27 карток шістьма мовами: A — TERMOJET BOX (підключення контурів,
 * габарити) і НГ-38А; C — насосні групи (польський ключ глибини, габарити);
 * D — сміття з адмінки в характеристиках і коротких описах.
 * Блок E — усі 343 картки: румунські specs з рядка JSON в обʼєкт.
 *
 * Блок Mega (НГ-62/72 потужності й KVS) СВІДОМО не входить: у каталозі стор.60-61
 * змішувальні групи виходять потужнішими за прямі, що суперечить решті лінійок.
 * Розбираємось окремо.
 *
 * Дві пастки, знайдені прогоном на знімку прод-бази 08.09:
 *  • румунські specs лежали РЯДКОМ JSON, решта мов — обʼєктом. Через це ro мовчки
 *    пропускалась у всіх блоках (див. eachSpecs), а на сторінці товару
 *    `Object.entries()` розсипав таблицю характеристик на окремі символи. Дані
 *    лікує блок E, причину — `patch-i18n-ro.js`;
 *  • французький і румунський ключі довжини насоса звуться не так, як припускала
 *    регулярка, тож замість правки наявного поля дописувався другий рядок.
 */
const path = require('path')
const Database = require('better-sqlite3')

const APPLY = process.argv.includes('--apply')
// TERMOJET_DB дає прогнати правки на знімку прод-бази, не чіпаючи робочу.
const DBP = process.env.TERMOJET_DB || path.join(__dirname, '..', 'data', 'termojet.db')
const db = new Database(DBP)

const log = []
const note = (sku, what) => log.push(`  ${sku.padEnd(18)} ${what}`)

// ── довідники ────────────────────────────────────────────────────────────────
const HEIGHT = /^(Висота|Height|Höhe|Wysokość|Hauteur|Înălțime)$/i
const WIDTH = /^(Ширина|Width|Breite|Szerokość|Largeur|Lățime)$/i
const LENGTH = /^(Довжина|Length|Länge|Długość|Longueur|Lungime)$/i
// Французький і румунський ключі звуться саме так у всіх 27 картках насосних груп
// («Longueur de la pompe», «Lungime pompă»). Помилкові варіанти лишаю в переліку:
// без них put() не впізнавав наявне поле й дописував ДРУГИЙ рядок про довжину насоса.
const PUMPLEN = /^(Довжина насоса|Pump length|Pumpenlänge|Długość pompy|Longueur de (?:la )?pompe|Lungime pompă|Lungimea pompei)$/i
const DEPTH_BAD = /^Głębokość$/
const DEPTH_OK = { uk: 'Глибина', en: 'Depth', de: 'Tiefe', fr: 'Profondeur', ro: 'Adâncime', pl: 'Głębokość' }
// `racord rapid` — те, що реально стоїть у румунських картках BOX; `cuplaj rapid`
// лишаємо на випадок другого варіанта перекладу. Порядок важливий лише тим, що
// французьке `raccord rapide` стоїть раніше й забирає своє слово першим.
const QUICK = /(швидкороз[^\s"]*|quick[- ]?coupling|Schnellkupplung|szybkoz[^\s"]*|raccord rapide|racord rapid|cuplaj rapid)/i
const UNION = { uk: 'накидна гайка', en: 'union nut', de: 'Überwurfmutter', fr: 'écrou-raccord', ro: 'piuliță olandeză', pl: 'nakrętka złączkowa' }
const HDR_K = /^(Характеристика|Characteristic|Kennwert|Charakterystyka|Caractéristique|Caracteristică)$/i
const HDR_V = /^(Одиниця вимірювання|Unit of measurement|Maßeinheit|Jednostka miary|Unité de mesure|Unitate de măsură)$/i
const EDIT = /(Редагувати|Edytuj|Bearbeiten|Editare|Modifier|Edit)(?=[\s:]|$)/

// ── що саме міняємо ──────────────────────────────────────────────────────────
// A2 — габарити BOX: стара величина → нова (шукаємо за ключем і за значенням)
const BOX_DIMS = {
  '84040BOX2': { height: [500, 492], length: [400, 466] },
  '84040BOX3': { height: [500, 492], length: [600, 676] },
}
// C2/C3 — габарити насосних груп (джерело: каталог стор.8 НГ-48А EPP, стор.9 НГ-46 EPP)
const NG_DIMS = {
  '84610470': { h: 395, w: 250, pump: 180 }, // НГ-47 EPP — дописати
  '84324480A': { h: 395, w: 250, pump: 180 }, // НГ-48А EPP Л — дописати
  '84310490': { h: 395, w: 261, pump: 180 }, // НГ-46 EPP Л — дописати, ширина 261!
  '84622480A': { h: 395, w: 250, pump: 180 }, // НГ-48А EPP — виправити з 353×261/130
  '84610490': { h: 395, w: 261, pump: 180 }, // НГ-46 EPP — виправити ширину 250→261
}
const D1_SKUS = ['AQUA411-0-10-24', 'AQUAO405-3-230-060', 'TJ413',
  'TMV121', 'TMV122', 'TMV131', 'TMV132', 'TMV231', 'TMV232']
const D2_SKUS = ['200085', '84040TJ-EC-162', '84130670', '84131670',
  'RMV04110-100', 'RMV04110-114']

// У двох змішувальних кранів увесь короткий опис — дамп таблиці з адмінки ВІД
// ПЕРШОГО символу, тож сама лише обрізка лишила б порожньо в усіх шести мовах.
// Тексти складені з їхніх власних повних описів (DN, Kvs, різьба, матеріали),
// що лишаються на сторінці товару без змін.
const D2_REPLACE = {
  'RMV04110-100': {
    uk: 'Чотириходовий поворотний змішувальний клапан DN25 для захисту котла від конденсаційної корозії. Внутрішня різьба Rp 1", Kvs 12 м³/год, PN 10 бар. Корпус — латунь CW617N, ущільнення EPDM.',
    en: 'Four-way rotary mixing valve DN25 protecting the boiler against condensation corrosion. Female thread Rp 1", Kvs 12 m³/h, PN 10 bar. CW617N brass body, EPDM seals.',
    pl: 'Czterodrogowy obrotowy zawór mieszający DN25 chroniący kocioł przed korozją kondensacyjną. Gwint wewnętrzny Rp 1", Kvs 12 m³/h, PN 10 bar. Korpus z mosiądzu CW617N, uszczelnienia EPDM.',
    de: 'Vier-Wege-Drehmischventil DN25 zum Schutz des Kessels vor Kondensationskorrosion. Innengewinde Rp 1", Kvs 12 m³/h, PN 10 bar. Gehäuse aus Messing CW617N, EPDM-Dichtungen.',
    fr: 'Vanne mélangeuse rotative à quatre voies DN25 protégeant la chaudière de la corrosion par condensation. Filetage femelle Rp 1", Kvs 12 m³/h, PN 10 bar. Corps en laiton CW617N, joints EPDM.',
    ro: 'Vană de amestec rotativă cu patru căi DN25 care protejează cazanul de coroziunea prin condens. Filet interior Rp 1", Kvs 12 m³/h, PN 10 bar. Corp din alamă CW617N, garnituri EPDM.',
  },
  'RMV04110-114': {
    uk: 'Чотириходовий поворотний змішувальний клапан DN32 для захисту котла від конденсаційної корозії. Внутрішня різьба Rp 1¼", Kvs 18 м³/год, PN 10 бар. Корпус — латунь CW617N, ущільнення EPDM.',
    en: 'Four-way rotary mixing valve DN32 protecting the boiler against condensation corrosion. Female thread Rp 1¼", Kvs 18 m³/h, PN 10 bar. CW617N brass body, EPDM seals.',
    pl: 'Czterodrogowy obrotowy zawór mieszający DN32 chroniący kocioł przed korozją kondensacyjną. Gwint wewnętrzny Rp 1¼", Kvs 18 m³/h, PN 10 bar. Korpus z mosiądzu CW617N, uszczelnienia EPDM.',
    de: 'Vier-Wege-Drehmischventil DN32 zum Schutz des Kessels vor Kondensationskorrosion. Innengewinde Rp 1¼", Kvs 18 m³/h, PN 10 bar. Gehäuse aus Messing CW617N, EPDM-Dichtungen.',
    fr: 'Vanne mélangeuse rotative à quatre voies DN32 protégeant la chaudière de la corrosion par condensation. Filetage femelle Rp 1¼", Kvs 18 m³/h, PN 10 bar. Corps en laiton CW617N, joints EPDM.',
    ro: 'Vană de amestec rotativă cu patru căi DN32 care protejează cazanul de coroziunea prin condens. Filet interior Rp 1¼", Kvs 18 m³/h, PN 10 bar. Corp din alamă CW617N, garnituri EPDM.',
  },
}

// ── помічники ────────────────────────────────────────────────────────────────
const parse = (s, d) => { try { return JSON.parse(s || '') ?? d } catch { return d } }
const num = (v) => { const m = String(v).match(/(\d+)/); return m ? +m[1] : null }
const unit = (v) => String(v).replace(/[\d\s]+/, '').trim() || 'мм'

/** застосувати fn до українських specs і до кожної мови в i18n
 *
 * ⚠️ Румунський шар тримає specs РЯДКОМ JSON, а en/pl/fr/de — обʼєктом (так його
 * заклав розкат ro 19–25.08). Попередня версія просто передавала значення в fn:
 * для рядка `Object.keys()` давав індекси символів, жоден ключ не збігався, і ro
 * мовчки пропускалась у ВСІХ блоках. Тепер розбираємо, а назад кладемо в тому
 * самому вигляді, щоб не міняти форму відповіді API там, де ми цього не хотіли.
 */
function eachSpecs (row, fn) {
  let touched = false
  const uk = parse(row.specs, {})
  if (fn(uk, 'uk')) { row.specs = JSON.stringify(uk); touched = true }
  const i18n = parse(row.i18n, {})
  let i18nTouched = false
  for (const lang of Object.keys(i18n)) {
    if (lang === '_srcHash' || !i18n[lang] || !i18n[lang].specs) continue
    const raw = i18n[lang].specs
    const wasString = typeof raw === 'string'
    const obj = wasString ? parse(raw, null) : raw
    if (!obj || typeof obj !== 'object') continue
    if (fn(obj, lang)) {
      i18n[lang].specs = wasString ? JSON.stringify(obj) : obj
      i18nTouched = true
    }
  }
  if (i18nTouched) { row.i18n = JSON.stringify(i18n); touched = true }
  return touched
}

/** замінити значення там, де ключ підходить під re, а число збігається зі старим */
function setDim (specs, re, oldN, newN) {
  for (const k of Object.keys(specs)) {
    if (!re.test(k)) continue
    if (oldN !== null && num(specs[k]) !== oldN) continue
    if (num(specs[k]) === newN) return false
    specs[k] = `${newN} ${unit(specs[k])}`
    return true
  }
  return false
}

// ── виконання ────────────────────────────────────────────────────────────────
const rows = db.prepare('SELECT id, sku, name, specs, i18n, short_desc FROM products').all()
const upd = db.prepare('UPDATE products SET specs=@specs, i18n=@i18n, short_desc=@short_desc WHERE id=@id')
const byId = new Map(rows.map(r => [r.sku, r]))
const changedIds = new Set()   // множина, а не лічильник: блок A3 нижче може
                               // зачепити ту саму картку, що й цикл, і подвоїти б її
let roNormalized = 0
const roBroken = []

for (const row of rows) {
  const before = JSON.stringify([row.specs, row.i18n, row.short_desc])

  // A1 — швидкороз'єм → накидна гайка
  eachSpecs(row, (s, lang) => {
    let t = false
    for (const k of Object.keys(s)) {
      if (typeof s[k] === 'string' && QUICK.test(s[k])) {
        s[k] = s[k].replace(QUICK, UNION[lang] || UNION.uk); t = true
        note(row.sku, `A1 «${k}» → ${s[k]}`)
      }
    }
    return t
  })

  // A2 — габарити BOX
  if (BOX_DIMS[row.sku]) {
    const d = BOX_DIMS[row.sku]
    eachSpecs(row, (s) => {
      let t = false
      if (setDim(s, HEIGHT, d.height[0], d.height[1])) t = true
      if (setDim(s, LENGTH, d.length[0], d.length[1])) t = true
      return t
    })
    note(row.sku, `A2 висота ${d.height[0]}→${d.height[1]}, довжина ${d.length[0]}→${d.length[1]}`)
  }

  // C1 — польський ключ Głębokość у не-польських мовах
  eachSpecs(row, (s, lang) => {
    if (lang === 'pl') return false
    let t = false
    for (const k of Object.keys(s)) {
      if (!DEPTH_BAD.test(k)) continue
      const nk = DEPTH_OK[lang] || DEPTH_OK.uk
      if (nk === k) continue
      const ordered = {}
      for (const kk of Object.keys(s)) { if (kk === k) ordered[nk] = s[k]; else ordered[kk] = s[kk] }
      for (const kk of Object.keys(s)) delete s[kk]
      Object.assign(s, ordered)
      note(row.sku, `C1 [${lang}] Głębokość → ${nk}`); t = true
    }
    return t
  })

  // C2/C3 — габарити насосних груп
  if (NG_DIMS[row.sku]) {
    const d = NG_DIMS[row.sku]
    eachSpecs(row, (s, lang) => {
      let t = false
      const K = { uk: ['Висота', 'Ширина', 'Довжина насоса'], en: ['Height', 'Width', 'Pump length'],
        de: ['Höhe', 'Breite', 'Pumpenlänge'], pl: ['Wysokość', 'Szerokość', 'Długość pompy'],
        // назви звірені з базою: саме так підписані всі 27 карток насосних груп
        fr: ['Hauteur', 'Largeur', 'Longueur de la pompe'], ro: ['Înălțime', 'Lățime', 'Lungime pompă'] }
      const [kh, kw, kp] = K[lang] || K.uk
      const u = lang === 'uk' ? 'мм' : 'mm'
      const put = (re, key, val) => {
        for (const k of Object.keys(s)) if (re.test(k)) { if (num(s[k]) === val) return false; s[k] = `${val} ${unit(s[k])}`; return true }
        s[key] = `${val} ${u}`; return true
      }
      if (put(HEIGHT, kh, d.h)) t = true
      if (put(WIDTH, kw, d.w)) t = true
      if (put(PUMPLEN, kp, d.pump)) t = true
      return t
    })
    note(row.sku, `C2/C3 → ${d.h}×${d.w}, насос ${d.pump} мм`)
  }

  // D1 — рядок-заголовок таблиці серед характеристик
  if (D1_SKUS.includes(row.sku)) {
    eachSpecs(row, (s, lang) => {
      let t = false
      for (const k of Object.keys(s)) {
        if (HDR_K.test(k) && HDR_V.test(String(s[k]))) { delete s[k]; note(row.sku, `D1 [${lang}] прибрано «${k}»`); t = true }
      }
      return t
    })
  }

  // D2 — «Редагувати» і злиплий дамп таблиці в кінці опису
  if (D2_SKUS.includes(row.sku)) {
    // Обрізаємо хвіст, а якщо від опису нічого не лишилось — ставимо написаний
    // текст із D2_REPLACE. Ідемпотентно: на другому прогоні EDIT уже не
    // спрацьовує, текст непорожній, і заміна не втручається.
    const rep = D2_REPLACE[row.sku] || {}
    const cut = (txt, lang) => {
      if (!txt) return txt
      const m = txt.match(EDIT)
      const left = m ? txt.slice(0, m.index).replace(/\s+$/, '') : txt
      return left || rep[lang] || left
    }
    const nu = cut(row.short_desc, 'uk')
    if (nu !== row.short_desc) {
      const how = nu === rep.uk ? 'дамп замінено написаним текстом' : `обрізано (${nu.length} символів лишилось)`
      row.short_desc = nu; note(row.sku, `D2 [uk] ${how}`)
    }
    const i18n = parse(row.i18n, {})
    let t = false
    for (const lang of Object.keys(i18n)) {
      if (lang === '_srcHash' || !i18n[lang]) continue
      const n2 = cut(i18n[lang].short_desc, lang)
      if (n2 !== i18n[lang].short_desc) {
        const how = n2 === rep[lang] ? 'дамп замінено написаним текстом' : `обрізано (${n2.length} символів лишилось)`
        i18n[lang].short_desc = n2; note(row.sku, `D2 [${lang}] ${how}`); t = true
      }
    }
    if (t) row.i18n = JSON.stringify(i18n)
  }

  // E — румунські specs: рядок JSON → обʼєкт, як у решти мов.
  //
  // `withI18n` віддає значення полів як є, а ProductDetailPage робить
  // `Object.entries(displaySpecs)`. Для рядка це давало по рядку таблиці НА КОЖЕН
  // СИМВОЛ, тобто таблиця характеристик на румунських сторінках була побита в усіх
  // 343 товарах. Причина — `products-ro-i18n.json` тримає specs рядком, а
  // `patch-i18n-ro.js` клав його в базу дослівно (там теж виправлено).
  //
  // Йде останнім у циклі навмисно: блоки вище могли щойно переписати ro-specs,
  // і нормалізуємо вже підсумкове значення.
  {
    const i18n = parse(row.i18n, {})
    const ro = i18n.ro
    if (ro && typeof ro.specs === 'string') {
      const obj = parse(ro.specs, null)
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        ro.specs = obj
        row.i18n = JSON.stringify(i18n)
        roNormalized++
      } else {
        roBroken.push(row.sku)
      }
    }
  }

  if (JSON.stringify([row.specs, row.i18n, row.short_desc]) !== before) {
    changedIds.add(row.id)
    if (APPLY) upd.run({ id: row.id, specs: row.specs, i18n: row.i18n, short_desc: row.short_desc })
  }
}

// A3 — НГ-38А: звести характеристики до шаблону НГ-38, і то всіма мовами.
//
// НГ-38А — та сама група НГ-38 плюс електропривід, тож правильна картка = повний
// набір характеристик НГ-38 і поле привода в кінці. Дописування п'яти полів лише
// в українські specs робило картку повною однією мовою і лишало куцою рештою
// пʼятьох. Ключ привода беремо з самої НГ-38А: у кожній мові він свій
// (Привід / Drive / Napęd / Antrieb / Entraînement / Servomotor), і значення
// «AQUA 413» — єдине, чим вона відрізняється від базової.
{
  const a = byId.get('84142380A'); const b = byId.get('84142380')
  if (a && b) {
    const aI = parse(a.i18n, {}); const bI = parse(b.i18n, {})
    const langs = ['uk', ...Object.keys(aI).filter(l => l !== '_srcHash' && aI[l] && aI[l].specs)]
    let touched = false
    for (const lang of langs) {
      const srcRaw = lang === 'uk' ? b.specs : (bI[lang] || {}).specs
      const dstRaw = lang === 'uk' ? a.specs : aI[lang].specs
      // та сама пастка, що й у eachSpecs: ro лежить рядком
      const src = typeof srcRaw === 'string' ? parse(srcRaw, null) : srcRaw
      const dst = typeof dstRaw === 'string' ? parse(dstRaw, null) : dstRaw
      if (!src || !dst || typeof src !== 'object' || typeof dst !== 'object') continue
      if (!Object.keys(src).length) continue
      const drive = Object.entries(dst).find(([, v]) => /AQUA/i.test(String(v)))
      const next = { ...src }
      if (drive) next[drive[0]] = drive[1]
      if (JSON.stringify(next) === JSON.stringify(dst)) continue
      const added = Object.keys(next).filter(k => dst[k] === undefined)
      const gone = Object.keys(dst).filter(k => next[k] === undefined)
      if (lang === 'uk') a.specs = JSON.stringify(next)
      else aI[lang].specs = typeof dstRaw === 'string' ? JSON.stringify(next) : next
      note('84142380A', `A3 [${lang}] +${added.length}: ${added.join(', ')}`
        + (gone.length ? ` · натомість ${gone.join(', ')}` : ''))
      touched = true
    }
    if (touched) {
      a.i18n = JSON.stringify(aI); changedIds.add(a.id)
      if (APPLY) upd.run({ id: a.id, specs: a.specs, i18n: a.i18n, short_desc: a.short_desc })
    }
  }
}

console.log(log.join('\n') || '  (змін немає — база вже приведена)')
if (roNormalized) console.log(`\n  E  румунські specs рядок → обʼєкт: ${roNormalized} карток`)
if (roBroken.length) console.log(`  ⚠️  ro-specs не розібрались як JSON (${roBroken.length}): ${roBroken.join(', ')}`)
console.log(`\n${APPLY ? 'ЗАСТОСОВАНО' : 'ПОПЕРЕДНІЙ ПЕРЕГЛЯД'}: товарів до зміни — ${changedIds.size}`)
if (!APPLY) console.log('Щоб записати, запусти з ключем --apply')
db.close()
