// Дані для SEO-шаблону категорії (src/data/category-landing.json → CategoryLanding).
// Усе, що залежить від товарів (розміри, діапазони виходів, ціни), рахуємо з каталогу,
// а не пишемо в текст: ціни йдуть з євро за курсом НБУ і змінюються щодня.
// ⚠️ Ту саму логіку цін для JSON-LD (FAQ) дублює backend/server.js → landingPriceCtx().
import { toUAH, formatUahLang } from './currency'
import { effectivePrice } from './sale'

// «Шафа колекторна внутрішня Termojet №03 (8-10 виходів, 715×575×110 мм)»
//   → { outlets: [8, 10], dims: [715, 575, 110], num: '03' }
// «Колектор … на 12 виходів …» → { outlets: [12, 12] }
export function parseName(name = '') {
  const range = name.match(/(\d+)\s*[-–]\s*(\d+)\s*вих(?:ід|од)/i)     // «2-4 виходів»
  const single = name.match(/на\s+(\d+)\s*вих(?:ід|од)/i)               // «на 2 виходи», «на 10 виходів»
  const dims = name.match(/(\d+)\s*[×x]\s*(\d+)\s*[×x]\s*(\d+)\s*мм/i)
  const num = name.match(/№\s*(\d+)/)
  return {
    outlets: range ? [+range[1], +range[2]] : single ? [+single[1], +single[1]] : null,
    dims: dims ? [+dims[1], +dims[2], +dims[3]] : null,
    num: num ? num[1] : null,
  }
}

export const priceUah = (p, eurRate) => toUAH(effectivePrice(p), p.currency, eurRate) || 0
// Сума в ₴ → «1 798 грн» / «UAH 1,798» / «1.798 UAH» — як решта цін сайту цією мовою
export const fmtUah = (v, lang = 'uk') => formatUahLang(v, lang)

const minMax = vals => {
  const v = vals.filter(x => x > 0)
  return v.length ? [Math.min(...v), Math.max(...v)] : [0, 0]
}

const byMatch = (list, match) => (match ? list.filter(p => (p.name || '').toLowerCase().includes(match.toLowerCase())) : list)

// Порядок усередині групи: за номером типорозміру (№00 → №06) або кількістю виходів
// (колектори «на 2 … на 15 виходів»), далі за назвою
const sizeRank = p => {
  const { num, outlets } = parseName(p.name)
  return num != null ? +num : outlets ? outlets[0] : 999
}

export function buildLanding(cfg, catProducts, allProducts, eurRate, lang = 'uk') {
  const ui = cfg.ui || {}
  const groups = cfg.groups.map(g => {
    const items = byMatch(catProducts, g.match).slice().sort((a, b) => sizeRank(a) - sizeRank(b) || (a.name || '').localeCompare(b.name || ''))
    const parsed = items.map(p => parseName(p.name))
    const dims = parsed.map(x => x.dims).filter(Boolean)
    const [min, max] = minMax(items.map(p => priceUah(p, eurRate)))
    return {
      ...g, items, parsed, min, max,
      h: dims[0]?.[1], d: dims[0]?.[2],
      wmin: dims.length ? Math.min(...dims.map(x => x[0])) : null,
      wmax: dims.length ? Math.max(...dims.map(x => x[0])) : null,
    }
  })
  const [min, max] = minMax(catProducts.map(p => priceUah(p, eurRate)))

  // Таблиця розмірів: рядок на типорозмір (№), колонка на групу
  const nums = [...new Set(groups.flatMap(g => g.parsed.map(x => x.num)).filter(Boolean))].sort()
  const sizeRows = nums.map(num => {
    const cells = groups.map(g => {
      const i = g.parsed.findIndex(x => x.num === num)
      return i < 0 ? null : { width: g.parsed[i].dims?.[0], price: priceUah(g.items[i], eurRate), product: g.items[i] }
    })
    const outlets = groups.map(g => g.parsed.find(x => x.num === num)?.outlets).find(Boolean)
    return { num, outlets, cells }
  })

  // Таблиця моделей (cfg.models.rows: { match — підрядок артикула або назви, params — значення
  // колонок параметрів, або param — одне значення }); ціна — з каталогу. Рядки без товару пропускаємо.
  const modelRows = (cfg.models?.rows || []).map(r => {
    const m = r.match.toLowerCase()
    const product = catProducts.find(p => (p.sku || '').toLowerCase().includes(m) || (p.name || '').toLowerCase().includes(m))
    return product && { model: r.model || r.match, params: r.params || [r.param], price: priceUah(product, eurRate), product }
  }).filter(Boolean)

  // Плитки суміжних товарів: r.to — готова адреса, інакше /catalog/<category>?<filter>.
  // r.sub: 'outlets' — діапазон виходів і ціна «від»; токен {min} — мін. ціна товарів плитки.
  const related = (cfg.related?.items || []).map(r => {
    const list = byMatch(allProducts.filter(p => p.categorySlug === r.category), r.match)
    let sub = r.sub
    if (sub && sub.includes('{min}')) {
      const [pmin] = minMax(list.map(p => priceUah(p, eurRate)))
      // немає цін (ще не прийшов курс) — прибираємо «· від {min}» разом із роздільником
      sub = pmin ? sub.replace('{min}', fmtUah(pmin, lang)) : sub.replace(/\s*[·,]?\s*[^·,]*\{min\}/, '')
    }
    if (r.sub === 'outlets') {
      const outs = list.map(p => parseName(p.name).outlets).filter(Boolean)
      const [pmin] = minMax(list.map(p => priceUah(p, eurRate)))
      const lo = outs.length ? Math.min(...outs.map(o => o[0])) : null
      const hi = outs.length ? Math.max(...outs.map(o => o[1])) : null
      sub = [lo != null ? `${lo}–${hi} ${ui.outlets || ''}`.trim() : '', pmin ? `${ui.from || ''} ${fmtUah(pmin, lang)}`.trim() : ''].filter(Boolean).join(' · ')
    }
    const qs = r.filter ? '?' + Object.entries(r.filter).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&') : ''
    return { ...r, sub, to: r.to || `/catalog/${r.category}${qs}` }
  })

  const ctx = { min, max }
  groups.forEach(g => { ctx[`min:${g.key}`] = g.min; ctx[`max:${g.key}`] = g.max })
  return { groups, min, max, sizeRows, modelRows, related, ctx }
}

// «{h}», «{min:int}» тощо → значення; ціни — з валютою за мовою («1 798 грн»)
export function fillTokens(str, vars, lang = 'uk') {
  return String(str || '').replace(/\{([\w:]+)\}/g, (m, k) => {
    const v = vars[k]
    if (v == null || v === '') return m
    return /^(min|max)/.test(k) ? fmtUah(v, lang) : String(v)
  })
}

export function inRange(outlets, n) {
  return !!outlets && n >= outlets[0] && n <= outlets[1]
}
