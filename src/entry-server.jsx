// Серверний рендер (SSR). Збирається окремо: `vite build --ssr src/entry-server.jsx`
// → dist-ssr/entry-server.js, який підхоплює backend/ssr.js.
//
// Рендеримо ТЕ САМЕ дерево <App>, що й браузер, тому HTML до і після завантаження JS
// однаковий, а браузер лише «оживляє» його (hydrateRoot у main.jsx), без перемальовування.
//
// prerenderToNodeStream чекає на всі Suspense/lazy() — тож lazy-сторінки потрапляють
// у HTML повністю, а не як спінер-заглушка.
import { prerenderToNodeStream } from 'react-dom/static'
import App from './App'
import { PUBLIC_LANG_CODES } from './i18n/translations'
import { CATEGORIES } from './data/categories'
import { SALE_CATEGORY_SLUG, isOnSale } from './utils/sale'
import { mapPortfolio, blogLinksFrom, mergeBlogLinks, mergeFiles } from './context/normalize'
import { BLOG_POSTS } from './data/blog'
import { PORTFOLIO } from './data/portfolio'
import { FILES } from './data/files'
import { getDocsForProduct } from './data/docsMapping'

const INTL = PUBLIC_LANG_CODES.filter(c => c !== 'uk')

// /en/catalog/x → { lang: 'en', path: '/catalog/x' }
function splitLang(pathname) {
  const m = pathname.match(/^\/([a-z]{2})(\/.*|)$/)
  if (m && INTL.includes(m[1])) return { lang: m[1], path: m[2] || '/' }
  return { lang: 'uk', path: pathname }
}

const safeDecode = s => { try { return decodeURIComponent(s) } catch { return s } }

// Сторінка (модуль із src/), яку рендерить шлях — щоб додати modulepreload на її
// lazy-чанк. Дзеркало дерева роутів у App.jsx (лише lazy-сторінки).
const PAGE_MODULES = [
  [/^\/catalog(\/[^/]+)?$/, 'CatalogPage'],
  [/^\/catalog\/[^/]+\/[^/]+$/, 'ProductDetailPage'],
  [/^\/blog$/, 'BlogPage'],
  [/^\/blog\/[^/]+$/, 'BlogPostPage'],
  ...['cart:CartPage', 'about:AboutPage', 'contacts:ContactPage', 'portfolio:PortfolioPage',
    'service:ServicePage', 'files:FilesPage', 'prays:PraysPage', 'faq:FaqPage',
    'delivery:DeliveryPage', 'privacy:PrivacyPage', 'terms:TermsPage', 'oem:OEMPage',
    'returns:ReturnPage', 'partners:PartnersPage', 'navchannya:TrainingPage', 'reviews:ReviewsPage',
  ].map(s => { const [p, m] = s.split(':'); return [new RegExp(`^/${p}$`), m] }),
]
export function pageModule(pathname) {
  const { path } = splitLang(pathname.replace(/\/+$/, '') || '/')
  const hit = PAGE_MODULES.find(([re]) => re.test(path))
  return hit ? `src/pages/${hit[1]}.jsx` : null
}

// Поля товару, які не потрібні жодному рендеру списку (картки, фільтри, мегаменю):
// SEO-поля сторінки товару й зайві фото. Різати їх — мінус ~20% JSON у HTML.
const LIST_DROP = ['metaDescription', 'seoTitle', 'createdAt', 'images']
const slimForList = p => {
  const o = { ...p }
  for (const k of LIST_DROP) delete o[k]
  for (const k of Object.keys(o)) if (/^(seoTitle|metaDescription)_/.test(k)) delete o[k]
  return o
}
// Товари інших категорій на сторінці категорії потрібні лише для лічильників у
// смузі категорій (catCounts) — віддаємо від них тільки поля, з яких ті рахуються.
const countStub = p => ({ id: p.id, categorySlug: p.categorySlug, price: p.price, salePrice: p.salePrice })

const catMatches = (p, c) => p.categorySlug === c.id || p.categorySlug === c.slug

// Статті блогу без повного тексту (content*, i18n) — для головної і списку /blog,
// де видно лише заголовок/анонс/обкладинку. Повний блог на проді важить ~480 кБ
// (текст × 6 мов). _slim каже AppContext дотягнути повні статті одразу після
// гідрації, а не на простої браузера.
const slimPost = p => {
  const o = { ...p, _slim: true }
  for (const k of Object.keys(o)) if (k === 'content' || k === 'i18n' || k.startsWith('content_')) delete o[k]
  return o
}

/**
 * Дані для першого рендеру сторінки — ті самі, що браузер отримав би з /api,
 * перетворені тими самими функціями (context/normalize.js). Беремо лише потрібне
 * цій сторінці: усе інше AppContext дотягне сам уже після гідрації.
 *
 * api(path) — GET до власного /api (backend/ssr.js), повертає JSON або null.
 */
export async function loadInitialData(pathname, { api, eurRate }) {
  const { lang, path } = splitLang(pathname.replace(/\/+$/, '') || '/')
  const L = encodeURIComponent(lang)
  const data = { lang, eurRate: eurRate || null }

  const settings = await api('/settings')
  if (settings) data.settings = settings

  const seg = path.split('/').filter(Boolean)
  const tasks = []

  if (seg[0] === 'catalog') {
    tasks.push(api(`/products?limit=500&slim=1&lang=${L}`).then(async res => {
      const all = res?.products?.length ? res.products : null
      if (!all) return
      const catSlug = seg[1] ? safeDecode(seg[1]) : null
      const cat = catSlug ? CATEGORIES.find(c => c.slug === catSlug) : null
      if (!catSlug || !cat) {
        // «Усі товари» (або невідома категорія → сторінка теж показує всі) — повні картки
        data.products = all.map(slimForList)
      } else {
        const inCat = cat?.slug === SALE_CATEGORY_SLUG
          ? p => isOnSale(p) || (cat && catMatches(p, cat))
          : p => (cat ? catMatches(p, cat) : p.categorySlug === catSlug)
        data.products = all.map(p => (inCat(p) ? slimForList(p) : countStub(p)))
      }
      if (seg[2]) {
        const slug = safeDecode(seg[2])
        const full = await api(`/products/${encodeURIComponent(slug)}?lang=${L}`)
        // Прихований товар (isVisible=false) не віддаємо в HTML: його URL однаково 404
        if (full && !full.error && full.isVisible !== false) {
          data.product = { slug, lang, data: full }
          // Документи товару — лише ті, що показує ця сторінка (той самий підбір,
          // що й у ProductDetailPage: за категорією, назвою мовою UI та артикулом)
          const name = (lang !== 'uk' && full[`name_${lang}`]) || full.name || ''
          const ids = new Set(getDocsForProduct(catSlug, name, full.sku))
          const files = await api('/files')
          data.files = mergeFiles(files, FILES).filter(f => ids.has(f.id))
        }
      }
    }))
  }

  const needsBlog = path === '/' || seg[0] === 'blog'
  if (needsBlog) {
    tasks.push(api('/blog').then(res => {
      if (!(Array.isArray(res) && res.length > 0)) return
      const blog = mergeBlogLinks(res, blogLinksFrom(BLOG_POSTS))
      // Стаття — повністю лише поточна; решта (і на головній, і в списку) — без тексту
      const current = seg[0] === 'blog' && seg[1] ? safeDecode(seg[1]) : null
      data.blog = blog.map(p => (p.slug === current ? p : slimPost(p)))
    }))
  }
  if (path === '/' || path === '/portfolio') {
    tasks.push(api('/portfolio').then(res => {
      data.portfolio = Array.isArray(res) && res.length > 0 ? mapPortfolio(res) : PORTFOLIO
    }))
  }
  if (path === '/' || path === '/reviews') {
    tasks.push(api('/reviews').then(res => { if (Array.isArray(res)) data.reviews = res }))
  }
  if (path === '/faq') {
    tasks.push(api('/faq').then(res => { if (Array.isArray(res)) data.faq = res }))
  }
  if (path === '/files') {
    tasks.push(api('/files').then(res => { data.files = mergeFiles(res, FILES) }))
  }

  await Promise.all(tasks)
  return data
}

export async function render(url, initialData, { signal } = {}) {
  const errors = []
  const { prelude } = await prerenderToNodeStream(
    <App initialData={initialData} ssrLocation={url} />,
    { signal, onError(err) { errors.push(err) } },
  )
  let html = ''
  for await (const chunk of prelude) html += chunk
  return { html, errors }
}
