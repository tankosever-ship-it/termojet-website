// Mapping: categorySlug → file IDs from files.js
// Shows relevant brochures & instructions directly on product card

export const DOCS_BY_CATEGORY = {
  'termojet-box':             [10],           // Інструкція BOX
  'hidravlichni-rozdilnyky':  [11],           // Інструкція ГС
  'termojet-mega':            [11],           // Інструкція ГС (для ГС-31-34 та НГ-серії)
  'nasosni-hrupy':            [12, 13],       // НГ-47/48/46/67 + НГ-51/52
  'nasosy':                   [],             // документи — лише за серією (див. DOCS_BY_NAME)
  'klapany':                  [18, 31],       // 3-х ходові + брошура сервопривід
  'zonalne-keruvannya':       [18],           // 3-х ходові та сервоприводи
  'rozpodilchi-kolektory':    [14],           // Колектори розподільчі
  'kolektory-z-hidrostrilkoyu': [15],         // КГС
  'kolektory-pidloha':        [16, 30],       // Однобалкові + брошура накидні гайки
  'separatory':               [],
  'avtomatyka':               [22, 23],       // Profi Plus + Light
  'stijky-kaskady':           [14],
  'balancing':                [],
  'dodatkove':                [],
}

// SKU-specific overrides (matched by substring in product name)
export const DOCS_BY_NAME = [
  { match: /НГ-4[678]|НГ-67/i,         ids: [12] },
  { match: /НГ-5[12]/i,                 ids: [13] },
  { match: /APE/i,                      ids: [19, 32] },
  { match: /APM-F/i,                    ids: [20, 33] }, // APM-F (окремого файлу немає — поки APM-документація)
  { match: /\bAPM\b/i,                  ids: [20, 33] }, // APM різьбові
  { match: /XPS|BPS/i,                  ids: [21] },
  { match: /SPE|HBS/i,                  ids: [17] },     // рециркуляційні насоси
  { match: /PROFI\s*PLUS/i,            ids: [22] },
  { match: /LIGHT/i,                    ids: [23] },
  { match: /BOX/i,                      ids: [10] },
]

// Returns deduplicated list of file IDs for a product
export function getDocsForProduct(categorySlug, productName = '') {
  const ids = new Set(DOCS_BY_CATEGORY[categorySlug] || [])
  for (const { match, ids: extraIds } of DOCS_BY_NAME) {
    if (match.test(productName)) extraIds.forEach(id => ids.add(id))
  }
  return [...ids]
}
