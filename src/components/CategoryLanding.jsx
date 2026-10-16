// SEO-шаблон категорії (макети SEO-команди, жовтень 2026: «Колекторна шафа»,
// «Колектор для теплої підлоги», «Змішувальний вузол для теплої підлоги»). Вступ з ключами,
// картки типів з якорями до H2, підбір за кількістю виходів, групи товарів під власними H2,
// таблиця моделей, характеристики, таблиця розмірів, порівняння, плитки суміжних товарів
// і FAQ. Кожен блок необовʼязковий: сторінка показує лише те, що є в її конфігу; картки
// типів і вкладки — лише коли груп більше однієї. Тексти й підписи (усі мови) — src/data/category-landing.json,
// числа (розміри, ціни) — з каталогу (utils/categoryLanding.js).
//
// quick — кнопки швидкого вибору над товарами (напр. «Для чого вузол?»): перемикають групу
// фільтра CATEGORY_FILTERS (quick.group, зазвичай hidden у сайдбарі); items[].label — UA-мітка
// опції фільтра, text/sub — підписи мовою сторінки. Видно й на мобільному, де сайдбару нема.
//
// Ліворуч — той самий сайдбар фільтрів, що в інших категоріях (aside, передає CatalogPage):
// ціна «від–до» і тип. Вкладки над товарами — це той самий фільтр типу (tab / onTab),
// тож вони не можуть суперечити сайдбару. Усе це — лише стан React, без зміни URL:
// окремих сторінок під фільтри SEO не хоче (один URL на категорію).
import { useMemo, useState } from 'react'
import { ArrowRight, ChevronRight } from 'lucide-react'
import LLink from './LLink'
import { sizedImg } from '../utils/imgUrl'
import { buildLanding, fillTokens, fmtUah, inRange, priceUah, parseName } from '../utils/categoryLanding'

const H2 = ({ id, children }) => (
  <h2 id={id} className="text-2xl md:text-[28px] font-black text-gray-900 font-['Archivo',sans-serif] leading-tight scroll-mt-24">{children}</h2>
)

export default function CategoryLanding({ cfg, lang, catProducts, shownProducts, allProducts, eurRate, Card, aside, tab = 'all', onTab, quickValue = '', onQuick }) {
  const ui = cfg.ui || {}
  const data = useMemo(() => buildLanding(cfg, catProducts, allProducts, eurRate, lang), [cfg, catProducts, allProducts, eurRate, lang])
  const [picked, setPicked] = useState(null)   // кількість виходів, яку підсвічуємо
  const [sort, setSort] = useState('size')
  const fmt = v => fmtUah(v, lang)

  // Товари груп після фільтрів сайдбару (ціна, тип); порядок — як у data (за розміром)
  const shownIds = useMemo(() => new Set(shownProducts.map(p => p.id)), [shownProducts])
  const sorted = items => {
    if (sort === 'priceAsc') return [...items].sort((a, b) => priceUah(a, eurRate) - priceUah(b, eurRate))
    if (sort === 'priceDesc') return [...items].sort((a, b) => priceUah(b, eurRate) - priceUah(a, eurRate))
    return items
  }
  const shownGroups = data.groups
    .filter(g => tab === 'all' || tab === g.key)
    .map(g => ({ ...g, visible: g.items.filter(p => shownIds.has(p.id)) }))
  const shownCount = shownGroups.reduce((n, g) => n + g.visible.length, 0)
  const picker = cfg.picker
  const quick = cfg.quick
  // Колонки параметрів таблиці моделей: cols.params (кілька) або cols.param (одна)
  const modelParamCols = cfg.models ? (cfg.models.cols.params || [cfg.models.cols.param]) : []
  // tabs: false — кілька груп під власними H2, але без карток типів і вкладок (євроконуси та байпас)
  const multi = data.groups.length > 1 && cfg.tabs !== false

  return (
    <div className="space-y-10">
      {/* ── Вступ + картки типів (якорі до H2) ── */}
      <section className={multi ? 'grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start' : ''}>
        <p className="text-gray-600 text-[17px] leading-relaxed max-w-4xl">{fillTokens(cfg.intro, data.ctx, lang)}</p>
        {multi && <div className="grid sm:grid-cols-2 gap-3">
          {data.groups.map(g => (
            <a key={g.key} href={`#grp-${g.key}`}
              className="group flex items-center gap-3 p-3 bg-white border border-[var(--ink-200)] hover:border-[var(--accent)] transition-colors">
              {g.items[0]?.image && (
                <img src={sizedImg(g.items[0].image, 160)} alt="" width="64" height="64" loading="lazy" decoding="async"
                  className="w-16 h-16 object-contain flex-shrink-0 bg-[var(--bg)]" />
              )}
              <span className="min-w-0">
                <span className="block font-bold text-gray-900">{g.cardTitle}</span>
                <span className="block text-xs text-gray-500">{g.cardSub} · {g.items.length} {ui.models}</span>
                {g.min > 0 && (
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
                    {ui.from} {fmt(g.min)} <ArrowRight size={13} />
                  </span>
                )}
              </span>
            </a>
          ))}
        </div>}
      </section>

      {/* ── Сайдбар фільтрів (як в інших категоріях) + усе інше ── */}
      <div className="flex gap-6">
        {aside}
        <div className="flex-1 min-w-0 space-y-12">

          {/* Підбір за кількістю виходів + вкладки + сортування */}
          <section className="space-y-4">
            {picker && (
              <div className="flex flex-col xl:flex-row xl:items-center gap-3 p-4 bg-white border border-[var(--ink-200)]">
                <div className="xl:w-56 flex-shrink-0">
                  <div className="font-bold text-gray-900 text-sm">{picker.title}</div>
                  <div className="text-xs text-gray-500">{picker.sub}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: picker.to - picker.from + 1 }, (_, i) => picker.from + i).map(n => (
                    <button key={n} type="button" onClick={() => setPicked(picked === n ? null : n)}
                      aria-pressed={picked === n}
                      className={`w-10 h-10 text-sm font-semibold border transition-colors ${picked === n
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                        : 'bg-white border-[var(--ink-200)] text-gray-700 hover:border-[var(--accent)]'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quick?.items?.length > 0 && (
              <div className="flex flex-col xl:flex-row xl:items-center gap-3 p-4 bg-white border border-[var(--ink-200)]">
                <div className="xl:w-56 flex-shrink-0">
                  <div className="font-bold text-gray-900 text-sm">{quick.title}</div>
                  {quick.sub && <div className="text-xs text-gray-500">{quick.sub}</div>}
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {[{ label: '', text: ui.all }, ...quick.items].map(q => {
                    const on = quickValue === q.label
                    return (
                      <button key={q.label || 'all'} type="button" aria-pressed={on} onClick={() => onQuick?.(q.label)}
                        className={`px-3.5 py-2 text-left border transition-colors ${on
                          ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                          : 'bg-white border-[var(--ink-200)] text-gray-700 hover:border-[var(--accent)]'}`}>
                        <span className="block text-sm font-semibold leading-tight">{q.text}</span>
                        {q.sub && <span className={`block text-[11px] mt-0.5 ${on ? 'text-white/80' : 'text-gray-400'}`}>{q.sub}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className={`flex flex-wrap items-center gap-3 ${multi ? 'justify-between' : 'justify-end'}`}>
              {multi && <div className="inline-flex bg-white border border-[var(--ink-200)] p-1" role="tablist">
                {[{ key: 'all', tab: ui.all, n: catProducts.length }, ...data.groups.map(g => ({ key: g.key, tab: g.tab, n: g.items.length }))].map(o => (
                  <button key={o.key} type="button" role="tab" aria-selected={tab === o.key} onClick={() => onTab?.(o.key)}
                    className={`px-4 py-1.5 text-sm font-semibold transition-colors ${tab === o.key ? 'bg-[var(--primary)] text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    {o.tab} <span className={tab === o.key ? 'text-white/60' : 'text-gray-400'}>{o.n}</span>
                  </button>
                ))}
              </div>}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{ui.found}: <b className="text-gray-700">{shownCount}</b></span>
                <select value={sort} onChange={e => setSort(e.target.value)} aria-label={ui.sortSize}
                  className="px-3 py-2 border border-gray-200 bg-white text-sm focus:outline-none focus:border-[var(--primary)] text-gray-600">
                  <option value="size">{ui.sortSize}</option>
                  <option value="priceAsc">{ui.sortPriceAsc}</option>
                  <option value="priceDesc">{ui.sortPriceDesc}</option>
                </select>
              </div>
            </div>
          </section>

          {/* Групи товарів під власними H2 */}
          {shownGroups.map(g => (
            <section key={g.key} className="space-y-4">
              {g.h2 && (
                <div>
                  <H2 id={`grp-${g.key}`}>{g.h2}</H2>
                  {g.text && <p className="text-gray-600 mt-2 max-w-3xl">{fillTokens(g.text, g, lang)}</p>}
                </div>
              )}
              {g.visible.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sorted(g.visible).map(p => {
                    const outlets = parseName(p.name).outlets
                    const hit = picked != null && inRange(outlets, picked)
                    return <Card key={p.id} product={p} highlight={hit} dim={picked != null && !hit} />
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-6">{ui.empty}</p>
              )}
            </section>
          ))}

          {/* Таблиця моделей: модель (посилання) — параметр із конфігу — ціна з каталогу */}
          {cfg.models && data.modelRows.length > 0 && (
            <section className="space-y-3 max-w-4xl">
              <H2 id="models">{cfg.models.h2}</H2>
              {cfg.models.text && <p className="text-gray-600">{cfg.models.text}</p>}
              <div className="overflow-x-auto bg-white border border-[var(--ink-200)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-[var(--ink-200)]">
                      <th className="px-4 py-3 font-semibold">{cfg.models.cols.model}</th>
                      {modelParamCols.map(c => <th key={c} className="px-4 py-3 font-semibold">{c}</th>)}
                      <th className="px-4 py-3 font-semibold">{cfg.models.cols.price}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.modelRows.map(r => (
                      <tr key={r.product.id} className="border-b border-[var(--ink-200)] last:border-0">
                        <td className="px-4 py-2.5 font-semibold text-gray-900 whitespace-nowrap">
                          <LLink to={`/catalog/${r.product.categorySlug}/${r.product.slug}`} className="hover:text-[var(--accent)]">{r.model}</LLink>
                        </td>
                        {r.params.map((v, i) => <td key={i} className="px-4 py-2.5 text-gray-700 font-mono whitespace-nowrap">{v}</td>)}
                        <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{r.price > 0 ? fmt(r.price) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Характеристики серії: пари «параметр — значення» */}
          {cfg.specs?.items?.length > 0 && (
            <section className="space-y-3 max-w-4xl">
              <H2 id="specs">{cfg.specs.h2}</H2>
              {cfg.specs.text && <p className="text-gray-600">{cfg.specs.text}</p>}
              <dl className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 bg-white border border-[var(--ink-200)]">
                {cfg.specs.items.map(s => (
                  <div key={s.k} className="px-4 py-3.5 border-b border-[var(--ink-200)] xl:border-b-0">
                    <dt className="text-[11px] text-gray-400">{s.k}</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Таблиця розмірів + порівняння типів */}
          <section className="grid 2xl:grid-cols-2 gap-8 items-start">
            {cfg.sizes && data.sizeRows.length > 0 && (
              <div className="space-y-3">
                <H2 id="sizes">{cfg.sizes.h2}</H2>
                <p className="text-gray-600">{cfg.sizes.text}</p>
                <div className="overflow-x-auto bg-white border border-[var(--ink-200)]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-[var(--ink-200)]">
                        <th className="px-4 py-3 font-semibold">№</th>
                        <th className="px-4 py-3 font-semibold">{ui.outletsCol}</th>
                        {data.groups.map(g => (
                          <th key={g.key} className="px-4 py-3 font-semibold">
                            {g.column}<span className="block normal-case tracking-normal text-gray-400 font-normal">{ui.w}×{g.h}×{g.d}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.sizeRows.map(r => (
                        <tr key={r.num} className={`border-b border-[var(--ink-200)] last:border-0 ${picked != null && inRange(r.outlets, picked) ? 'bg-orange-50' : ''}`}>
                          <td className="px-4 py-2.5 font-semibold text-gray-900">№{r.num}</td>
                          <td className="px-4 py-2.5 text-gray-700">{r.outlets ? `${r.outlets[0]}–${r.outlets[1]}` : '—'}</td>
                          {r.cells.map((c, i) => (
                            <td key={i} className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                              {c ? (
                                <LLink to={`/catalog/${c.product.categorySlug}/${c.product.slug}`} className="hover:text-[var(--accent)]">
                                  <span className="font-mono">{c.width}</span>
                                  {c.price > 0 && <span className="text-gray-400"> · {fmt(c.price)}</span>}
                                </LLink>
                              ) : '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {cfg.compare && (
              <div className="space-y-3">
                <H2 id="compare">{cfg.compare.h2}</H2>
                <p className="text-gray-600">{cfg.compare.text}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {data.groups.map(g => (
                    <div key={g.key} className="p-4 bg-white border border-[var(--ink-200)]">
                      <div className="font-bold text-gray-900 mb-3">{g.column}</div>
                      <dl className="space-y-2.5 text-sm">
                        {[
                          [ui.mount, g.mount],
                          [ui.hd, g.h ? `${g.h} × ${g.d} ${ui.mm}` : null],
                          [ui.width, g.wmin ? `${g.wmin}–${g.wmax} ${ui.mm}` : null],
                          [ui.price, g.min ? `${fmt(g.min)} – ${fmt(g.max)}` : null],
                        ].filter(([, v]) => v).map(([k, v]) => (
                          <div key={k}>
                            <dt className="text-[11px] text-gray-400">{k}</dt>
                            <dd className="text-gray-800">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Що встановити в шафу: плитки → фільтр суміжної категорії */}
          {data.related.length > 0 && (
            <section className="space-y-4">
              <H2 id="related">{cfg.related.h2}</H2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {data.related.map(r => (
                  <LLink key={r.title} to={r.to}
                    className="group flex items-start justify-between gap-2 p-4 bg-white border border-[var(--ink-200)] hover:border-[var(--accent)] transition-colors">
                    <span>
                      <span className="block font-bold text-gray-900 group-hover:text-[var(--accent)] transition-colors">{r.title}</span>
                      {r.sub && <span className="block text-xs text-gray-500 mt-1">{r.sub}</span>}
                    </span>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[var(--accent)] flex-shrink-0 mt-0.5" />
                  </LLink>
                ))}
              </div>
            </section>
          )}

          {/* FAQ (розмітка FAQPage — у серверному JSON-LD) */}
          {cfg.faq?.items?.length > 0 && (
            <section className="grid xl:grid-cols-[1fr_2fr] gap-6 items-start">
              <H2 id="faq">{cfg.faq.h2}</H2>
              <div className="border-t border-[var(--ink-200)]">
                {cfg.faq.items.map((f, i) => (
                  <details key={i} open={i === 0} className="group border-b border-[var(--ink-200)]">
                    <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none font-semibold text-gray-900">
                      {f.q}
                      <span className="text-[var(--accent)] text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="pb-4 text-gray-600 leading-relaxed">{fillTokens(f.a, data.ctx, lang)}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
