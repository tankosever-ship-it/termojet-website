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
  { match: /\bAPM\b(?!-F)/i,            ids: [20, 33] },   // APM різьбові (не APM-F)
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
  { match: /зональн.{0,12}клапан|ABF-ZV/i, ids: [18] },    // 3-ходовий зональний клапан
  { match: /413/,                       ids: [120, 121] }, // контролер/привід AQUA 413 (НГ-48A/52A + TJ413)
  { match: /84142380A/i,                ids: [120, 121] }, // НГ-38-А постачається з приводом AQUA 413
  { match: /GRANDLIFT/i,                ids: [140] },      // брошура GRANDLIFT
  { match: /MEGA\s*100-120/i,           ids: [141] },      // брошура MEGA (лише насос, не категорія)
  { match: /SILENCER/i,                 ids: [142] },      // брошура SILENCER
  { match: /\bTBE\b/i,                  ids: [143] },      // каталог TBE (інлайн з частотним керуванням)
  // Сепаратори — інструкції за артикулом
  { match: /TJ4F/i,                     ids: [130] },      // повітряний клапан
  { match: /TJVT6G/i,                   ids: [134] },      // повітря+бруду
  { match: /TJV6G/i,                    ids: [133] },      // повітря (найближча — swivel)
  { match: /TJV7G/i,                    ids: [133] },      // поворотний повітря
  { match: /TJT6G/i,                    ids: [131] },      // бруд
  { match: /TJT7G/i,                    ids: [132] },      // поворотний бруд
  { match: /TJ7575/i,                   ids: [135] },      // для теплових насосів
  { match: /TJ7590/i,                   ids: [136] },      // антифризний клапан
  { match: /PROFI\s*PLUS/i,            ids: [22] },
  { match: /LIGHT/i,                    ids: [23] },
  { match: /BOX/i,                      ids: [10] },
]

// Returns deduplicated list of file IDs for a product
export function getDocsForProduct(categorySlug, productName = '', sku = '') {
  const hay = `${productName} ${sku}`
  const ids = new Set(DOCS_BY_CATEGORY[categorySlug] || [])
  for (const { match, ids: extraIds } of DOCS_BY_NAME) {
    if (match.test(hay)) extraIds.forEach(id => ids.add(id))
  }
  return [...ids]
}
