// SEO-шаблон категорії (макет SEO-команди, жовтень 2026; перша категорія —
// «Колекторна шафа»). Вступ з ключами, картки типів з якорями до H2, підбір за
// кількістю виходів, групи товарів під власними H2, таблиця розмірів, порівняння,
// плитки суміжних товарів і FAQ. Тексти — src/data/category-landing.json,
// числа (розміри, ціни) — з каталогу (utils/categoryLanding.js).
//
// Фільтри, вкладки й сортування — лише стан React, без <a href> і без зміни URL:
// окремих сторінок під них SEO не хоче (один URL на категорію).
import { useMemo, useState } from 'react'
import { ArrowRight, ChevronRight } from 'lucide-react'
import LLink from './LLink'
import { sizedImg } from '../utils/imgUrl'
import { buildLanding, fillTokens, fmtUah, inRange, priceUah } from '../utils/categoryLanding'

const H2 = ({ id, children }) => (
  <h2 id={id} className="text-2xl md:text-[28px] font-black text-gray-900 font-['Archivo',sans-serif] leading-tight scroll-mt-24">{children}</h2>
)

export default function CategoryLanding({ cfg, catProducts, allProducts, eurRate, Card }) {
  const data = useMemo(() => buildLanding(cfg, catProducts, allProducts, eurRate), [cfg, catProducts, allProducts, eurRate])
  const [picked, setPicked] = useState(null)   // кількість виходів, яку підсвічуємо
  const [tab, setTab] = useState('all')
  const [sort, setSort] = useState('size')

  const sorted = items => {
    if (sort === 'priceAsc') return [...items].sort((a, b) => priceUah(a, eurRate) - priceUah(b, eurRate))
    if (sort === 'priceDesc') return [...items].sort((a, b) => priceUah(b, eurRate) - priceUah(a, eurRate))
    return items
  }
  const shownGroups = data.groups.filter(g => tab === 'all' || tab === g.key)
  const shownCount = shownGroups.reduce((n, g) => n + g.items.length, 0)
  const picker = cfg.picker

  return (
    <div className="space-y-12">
      {/* ── Вступ + картки типів (якорі до H2) ── */}
      <section className="grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
        <p className="text-gray-600 text-[17px] leading-relaxed">{cfg.intro}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.groups.map(g => (
            <a key={g.key} href={`#grp-${g.key}`}
              className="group flex items-center gap-3 p-3 bg-white border border-[var(--ink-200)] hover:border-[var(--accent)] transition-colors">
              {g.items[0]?.image && (
                <img src={sizedImg(g.items[0].image, 160)} alt="" width="64" height="64" loading="lazy" decoding="async"
                  className="w-16 h-16 object-contain flex-shrink-0 bg-[var(--bg)]" />
              )}
              <span className="min-w-0">
                <span className="block font-bold text-gray-900">{g.cardTitle}</span>
                <span className="block text-xs text-gray-500">{g.cardSub} · {g.items.length} моделей</span>
                {g.min > 0 && (
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
                    від {fmtUah(g.min)} грн <ArrowRight size={13} />
                  </span>
                )}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Підбір за кількістю виходів + вкладки + сортування ── */}
      <section className="space-y-4">
        {picker && (
          <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 bg-white border border-[var(--ink-200)]">
            <div className="md:w-60 flex-shrink-0">
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex bg-white border border-[var(--ink-200)] p-1" role="tablist">
            {[{ key: 'all', tab: 'Всі', n: catProducts.length }, ...data.groups.map(g => ({ key: g.key, tab: g.tab, n: g.items.length }))].map(o => (
              <button key={o.key} type="button" role="tab" aria-selected={tab === o.key} onClick={() => setTab(o.key)}
                className={`px-4 py-1.5 text-sm font-semibold transition-colors ${tab === o.key ? 'bg-[var(--primary)] text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                {o.tab} <span className={tab === o.key ? 'text-white/60' : 'text-gray-400'}>{o.n}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Знайдено: <b className="text-gray-700">{shownCount}</b></span>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="px-3 py-2 border border-gray-200 bg-white text-sm focus:outline-none focus:border-[var(--primary)] text-gray-600">
              <option value="size">За розміром</option>
              <option value="priceAsc">Ціна: від низької</option>
              <option value="priceDesc">Ціна: від високої</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Групи товарів під власними H2 ── */}
      {shownGroups.map(g => (
        <section key={g.key} className="space-y-4">
          <div>
            <H2 id={`grp-${g.key}`}>{g.h2}</H2>
            <p className="text-gray-600 mt-2 max-w-3xl">{fillTokens(g.text, g)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sorted(g.items).map(p => {
              const outlets = g.parsed[g.items.indexOf(p)]?.outlets
              const hit = picked != null && inRange(outlets, picked)
              return <Card key={p.id} product={p} highlight={hit} dim={picked != null && !hit} />
            })}
          </div>
        </section>
      ))}

      {/* ── Таблиця розмірів + порівняння типів ── */}
      <section className="grid lg:grid-cols-2 gap-8 items-start">
        {cfg.sizes && data.sizeRows.length > 0 && (
          <div className="space-y-3">
            <H2 id="sizes">{cfg.sizes.h2}</H2>
            <p className="text-gray-600">{cfg.sizes.text}</p>
            <div className="overflow-x-auto bg-white border border-[var(--ink-200)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-[var(--ink-200)]">
                    <th className="px-4 py-3 font-semibold">№</th>
                    <th className="px-4 py-3 font-semibold">Виходів</th>
                    {data.groups.map(g => (
                      <th key={g.key} className="px-4 py-3 font-semibold">
                        {g.column}<span className="block normal-case tracking-normal text-gray-400 font-normal">Ш×{g.h}×{g.d}</span>
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
                              {c.price > 0 && <span className="text-gray-400"> · {fmtUah(c.price)} грн</span>}
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
                      ['Монтаж', g.mount],
                      ['Висота × глибина', g.h ? `${g.h} × ${g.d} мм` : null],
                      ['Ширина', g.wmin ? `${g.wmin}–${g.wmax} мм` : null],
                      ['Ціна', g.min ? `${fmtUah(g.min)} – ${fmtUah(g.max)} грн` : null],
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

      {/* ── Що встановити в шафу: плитки → фільтр суміжної категорії ── */}
      {data.related.length > 0 && (
        <section className="space-y-4">
          <H2 id="related">{cfg.related.h2}</H2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* ── FAQ (розмітка FAQPage — у серверному JSON-LD) ── */}
      {cfg.faq?.items?.length > 0 && (
        <section className="grid lg:grid-cols-[1fr_2fr] gap-6 items-start">
          <H2 id="faq">{cfg.faq.h2}</H2>
          <div className="border-t border-[var(--ink-200)]">
            {cfg.faq.items.map((f, i) => (
              <details key={i} open={i === 0} className="group border-b border-[var(--ink-200)]">
                <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none font-semibold text-gray-900">
                  {f.q}
                  <span className="text-[var(--accent)] text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="pb-4 text-gray-600 leading-relaxed">{fillTokens(f.a, data.ctx)}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
