// Mapping: categorySlug → file IDs from files.js
// Shows relevant brochures & instructions directly on product card

export const DOCS_BY_CATEGORY = {
  'termojet-box':             [10],           // Інструкція BOX
  'hidravlichni-rozdilnyky':  [11],           // Інструкція ГС
  'termojet-mega':            [11],           // Інструкція ГС (для ГС-31-34 та НГ-серії)
  'nasosni-hrupy':            [12, 13],       // НГ-47/48/46/67 + НГ-51/52
  'nasosy':                   [],             // документи — лише за серією (див. DOCS_BY_NAME)
  'klapany':                  [18, 31],       // 3-х ходові + брошура сервопривід
  'zonalne-keruvannya':       [119],          // брошура зонального керування (інструкції — за моделлю)
  'rozpodilchi-kolektory':    [14],           // Колектори розподільчі
  'kolektory-z-hidrostrilkoyu': [15],         // КГС
  'kolektory-pidloha':        [16, 30],       // Однобалкові + брошура накидні гайки
  'separatory':               [],
  'avtomatyka':               [22, 23],       // Profi Plus + Light
  'balancing':                [],
  'dodatkove':                [],
}

// SKU-specific overrides (matched by substring in product name)
export const DOCS_BY_NAME = [
  { match: /НГ-4[678]|НГ-67/i,         ids: [12] },
  { match: /НГ-5[12]/i,                 ids: [13] },
  { match: /APE/i,                      ids: [19, 32] },
  { match: /APM-F/i,                    ids: [100, 101] }, // APM-F власні інструкція + брошура
  { match: /\bAPM\b(?!-F)/i,            ids: [189, 33] },  // APM різьбові (не APM-F)
  { match: /XPS|BPS/i,                  ids: [21] },
  { match: /WT\s?400/i,                 ids: [102] },      // каналізаційна станція WT 400 (не чіпати GRANDLIFT, теж «каналізаційні»)
  { match: /SPE/i,                      ids: [103, 104] }, // SPE12 інструкція + тех.лист
  { match: /HBS/i,                      ids: [17] },       // рециркуляційний (загальна)
  // Зональне керування — за моделлю
  { match: /HT102/i,                    ids: [110] },
  { match: /HT120/i,                    ids: [111] },
  { match: /HT130/i,                    ids: [112] },
  { match: /WT102/i,                    ids: [113] },
  { match: /WT150/i,                    ids: [114] },
  { match: /R06|RO6/i,                  ids: [115] },
  { match: /TRH10/i,                    ids: [116] },
  { match: /TJ03C/i,                    ids: [117] },
  { match: /TJ03RF/i,                   ids: [118] },
  { match: /зональн.{0,12}клапан|ABF-ZV|ABF01-3/i, ids: [186], exclusive: true }, // зональні клапани ABF-ZV3 — двомовна інструкція
  { match: /413/,                       ids: [120, 121] }, // контролер/привід AQUA 413 (НГ-48A/52A + TJ413)
  { match: /84142380A/i,                ids: [120, 121] }, // НГ-38-А постачається з приводом AQUA 413
  { match: /GRANDLIFT/i,                ids: [140] },      // брошура GRANDLIFT (спільна)
  { match: /GRANDLIFT\s*20-75/i,        ids: [147] },      // інструкція GRANDLIFT 20-75SW
  { match: /GRANDLIFT\s*60-75/i,        ids: [148] },      // інструкція GRANDLIFT 60-75SW
  { match: /GRANDLIFT\s*120-220/i,      ids: [149] },      // інструкція GRANDLIFT 120-220SW
  { match: /GRANDLIFT\s*150-370/i,      ids: [150] },      // інструкція GRANDLIFT 150-370DW
  { match: /MEGA\s*100-120/i,           ids: [141, 146] }, // брошура + інструкція MEGA 100 (лише насос, не категорія)
  { match: /SILENCER/i,                 ids: [142, 145] }, // брошура + інструкція SILENCER
  { match: /\bTBE\b/i,                  ids: [143, 188] },   // каталог TBE + наша двомовна інструкція
  { match: /\bTI[\s-]?400\b|титанов\S*\s+акт\S*\s+анод|215001(68|69)/i, ids: [187] },
  // ↑ було `титанов\w*` — у JS `\w` не покриває кирилицю без прапорця `u`,
  // тож правило не спрацьовувало жодного разу й анод лишався без документів.
  // Сепаратори — інструкції за артикулом
  { match: /TJ4F/i,                     ids: [130] },      // повітряний клапан
  { match: /TJVT6G/i,                   ids: [134] },      // повітря+бруду
  { match: /TJV6G/i,                    ids: [133] },      // повітря (найближча — swivel)
  { match: /TJV7G/i,                    ids: [133] },      // поворотний повітря
  { match: /TJT6G/i,                    ids: [131] },      // бруд
  { match: /TJT7G/i,                    ids: [132] },      // поворотний бруд
  { match: /TJ7575/i,                   ids: [135] },      // для теплових насосів
  { match: /TJ7590/i,                   ids: [136] },      // антифризний клапан
  // Інструкції власного видання 2026 — своя на кожен виріб.
  // На сайті лежить лише двомовне видання (українська частина, далі
  // англійська); одномовні PDF існують у manuals/, але не публікуються.
  { match: /\bTMV\d|Термостатичний триходовий клапан/i, ids: [180] },
  { match: /\bRMV0\d|Триходовий змішувальний кран|Чотирьохходовий змішувальний кран/i, ids: [181] },
  { match: /TJ-MU-10B/i,                ids: [182] },
  { match: /TJ-MU-25/i,                 ids: [183] },
  { match: /84040TJ-(R-)?W-\d/i,        ids: [184] },
  { match: /AQUA\s?O?4(0[15]|11|12)/i,  ids: [185] },
  { match: /PROFI\s*PLUS/i,            ids: [22] },
  { match: /LIGHT/i,                    ids: [23] },
  { match: /BOX/i,                      ids: [10] },
]

// Returns deduplicated list of file IDs for a product
export function getDocsForProduct(categorySlug, productName = '', sku = '') {
  const hay = `${productName} ${sku}`
  // Ексклюзивне правило показує ЛИШЕ свої доки (ігнорує категорійні та інші збіги)
  for (const { match, ids: exIds, exclusive } of DOCS_BY_NAME) {
    if (exclusive && match.test(hay)) return [...new Set(exIds)]
  }
  const ids = new Set(DOCS_BY_CATEGORY[categorySlug] || [])
  for (const { match, ids: extraIds } of DOCS_BY_NAME) {
    if (match.test(hay)) extraIds.forEach(id => ids.add(id))
  }
  return [...ids]
}
