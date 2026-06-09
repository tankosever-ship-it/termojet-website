import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { mergeHomeContent } from '../data/homeContent'
import { mergeAboutContent } from '../data/aboutContent'
import { PRODUCTS } from '../data/products'
import { mergeWithEnriched } from '../data/mergeEnriched'
import { BLOG_POSTS } from '../data/blog'
import { PORTFOLIO } from '../data/portfolio'
import { FILES } from '../data/files'
import { fetchEurRate } from '../utils/currency'
import { getUTM } from '../utils/utm'
import { effectivePrice, isOnSale } from '../utils/sale'

const BASE_PRODUCTS = mergeWithEnriched(PRODUCTS)

// On GitHub Pages use static data; on real server use /api
const IS_GITHUB_PAGES = import.meta.env.VITE_BASE_URL !== '/'
const API = IS_GITHUB_PAGES ? null : '/api'

// БД blog_posts не має колонки links — підтягуємо чіпи зі статичного blog.js за slug.
const BLOG_LINKS = Object.fromEntries(BLOG_POSTS.filter(p => p.links?.length).map(p => [p.slug, p.links]))
const mergeBlogLinks = (data) => data.map(p => BLOG_LINKS[p.slug] ? { ...p, links: BLOG_LINKS[p.slug] } : p)

const AppContext = createContext(null)

function loadCart() {
  try { return JSON.parse(localStorage.getItem('tj2_cart') || '[]') } catch { return [] }
}
function saveCart(cart) {
  localStorage.setItem('tj2_cart', JSON.stringify(cart))
}

function loadAdminToken() {
  return sessionStorage.getItem('tj2_admin_token') || null
}
function saveAdminToken(token) {
  if (token) sessionStorage.setItem('tj2_admin_token', token)
  else sessionStorage.removeItem('tj2_admin_token')
}

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('tj2_lang') || 'uk')
  const [products, setProducts] = useState(BASE_PRODUCTS)
  const [cart, setCart] = useState(loadCart)
  const [orders, setOrders] = useState([])
  const [consultations, setConsultations] = useState([])
  const [dealers, setDealers] = useState([])
  const [reviews, setReviews] = useState([])
  const [blog, setBlog] = useState(BLOG_POSTS)
  const [portfolio, setPortfolio] = useState(PORTFOLIO)
  const [faq, setFaq] = useState([])
  const [files, setFiles] = useState(FILES)
  const [banners, setBanners] = useState([])
  const [promos, setPromos] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [isAdminAuth, setIsAdminAuth] = useState(() => !!loadAdminToken())
  const [adminToken, setAdminToken] = useState(loadAdminToken)
  const [eurRate, setEurRate] = useState(null)
  const [siteSettings, setSiteSettings] = useState({
    phone: '+380 (50) 450 64 24',
    email: 'termojet@sofievka.kiev.ua',
    address: 'Софіївська Борщагівка, вул. Київська 3',
    workHours: 'Пн-Пт 9:00–18:00',
    // Спільний бот @termojet_ua_bot; ?start=termojet → менеджер бачить мітку 🔵 Termojet
    telegram: 'https://t.me/termojet_ua_bot?start=termojet',
  })

  useEffect(() => { localStorage.setItem('tj2_lang', lang) }, [lang])
  useEffect(() => { saveCart(cart) }, [cart])
  useEffect(() => { fetchEurRate().then(rate => setEurRate(rate)) }, [])

  // load from API if available
  useEffect(() => {
    if (!API) return

    fetch(`${API}/products?limit=500`)
      .then(r => r.json())
      .then(data => { if (data.products?.length > 0) setProducts(data.products) })
      .catch(() => {})

    fetch(`${API}/blog`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setBlog(mergeBlogLinks(data)) })
      .catch(() => {})

    fetch(`${API}/portfolio`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPortfolio(data.map(p => ({ ...p, desc: p.description ?? p.desc ?? '', image: (p.images && p.images[0]) || p.image || '' })))
        }
      })
      .catch(() => {})

    fetch(`${API}/reviews`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviews(data) })
      .catch(() => {})

    fetch(`${API}/files`)
      .then(r => r.json())
      // завантажені через адмінку документи — зверху, далі статичний каталог
      .then(data => { if (Array.isArray(data) && data.length) setFiles([...data, ...FILES]) })
      .catch(() => {})

    fetch(`${API}/settings`)
      .then(r => r.json())
      .then(data => { if (data) setSiteSettings(s => ({ ...s, ...data })) })
      .catch(() => {})

    fetch(`${API}/faq`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setFaq(data) })
      .catch(() => {})

    fetch(`${API}/banners`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBanners(data) })
      .catch(() => {})

    fetch(`${API}/promos`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPromos(data) })
      .catch(() => {})
  }, [])

  // helper for admin API calls
  function authHeaders() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }
  }

  // Кількість НОВИХ заявок (status === 'new') для бейджів у меню адмінки
  const isNew = (x) => (x.status || 'new') === 'new'
  const newCounts = {
    '/admin/orders': orders.filter(isNew).length,
    '/admin/consultations': consultations.filter(isNew).length,
    '/admin/dealers': dealers.filter(isNew).length,
  }

  // Позначити заявки переглянутими (status='viewed') — щоб бейдж «нових» зник
  function markViewed(resource, ids) {
    if (!ids || !ids.length) return
    const setter = { consultations: setConsultations, dealers: setDealers, orders: setOrders }[resource]
    if (!setter) return
    setter(prev => prev.map(x => ids.includes(x.id) ? { ...x, status: 'viewed' } : x))
    if (API && adminToken) {
      ids.forEach(id => fetch(`${API}/${resource}/${id}`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: 'viewed' }),
      }).catch(() => {}))
    }
  }

  // Редагований контент головної: override (JSON у settings.homeContent) поверх дефолтів
  const homeContent = useMemo(() => {
    let override = siteSettings.homeContent
    if (typeof override === 'string') { try { override = JSON.parse(override) } catch { override = null } }
    return mergeHomeContent(override)
  }, [siteSettings.homeContent])

  // Редагований контент сторінки «Про нас»
  const aboutContent = useMemo(() => {
    let override = siteSettings.aboutContent
    if (typeof override === 'string') { try { override = JSON.parse(override) } catch { override = null } }
    return mergeAboutContent(override)
  }, [siteSettings.aboutContent])

  // Завантажити файл з компʼютера на сервер → { url, filename } або { error }.
  // FormData: НЕ виставляємо Content-Type вручну (браузер додасть boundary сам).
  async function uploadFile(file) {
    if (!API || !adminToken) return { error: 'Завантаження доступне лише в адмінці на сервері' }
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: fd,
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        return { error: e.error || 'Помилка завантаження (перевірте тип/розмір файлу)' }
      }
      return await res.json()
    } catch {
      return { error: 'Помилка мережі під час завантаження' }
    }
  }

  // Зберегти налаштування сайту в БД (PUT /settings) + оновити локальний стан.
  // homeContent-обʼєкт серіалізуємо в JSON-рядок для зберігання.
  async function saveSettings(patch) {
    const body = { ...patch }
    if (body.homeContent && typeof body.homeContent !== 'string') body.homeContent = JSON.stringify(body.homeContent)
    if (API && adminToken) {
      try { await fetch(`${API}/settings`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) }) } catch {}
    }
    setSiteSettings(s => ({ ...s, ...patch }))
    return { ok: true }
  }

  // Cart
  function addToCart(product, quantity = 1) {
    // У кошик кладемо ефективну (акційну) ціну; originalPrice — для перекреслення
    const item = { ...product, price: effectivePrice(product), originalPrice: product.price, onSale: isOnSale(product) }
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      return [...prev, { ...item, quantity }]
    })
  }
  function removeFromCart(id) { setCart(prev => prev.filter(i => i.id !== id)) }
  function updateCartQuantity(id, quantity) {
    if (quantity <= 0) { removeFromCart(id); return }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }
  function clearCart() { setCart([]) }

  const cartTotal = cart.reduce((sum, i) => {
    const price = parseFloat(i.price) || 0
    const inUah = i.currency === 'EUR' && eurRate ? price * eurRate : price
    return sum + inUah * i.quantity
  }, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  // Admin auth
  async function adminLogin(password) {
    if (!API) {
      // GitHub Pages fallback
      if (password === 'termojet2024') {
        sessionStorage.setItem('tj2_admin', '1')
        setIsAdminAuth(true)
        return true
      }
      return false
    }
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) return false
      const { token } = await res.json()
      saveAdminToken(token)
      setAdminToken(token)
      setIsAdminAuth(true)
      return true
    } catch {
      return false
    }
  }

  function adminLogout() {
    saveAdminToken(null)
    setAdminToken(null)
    sessionStorage.removeItem('tj2_admin')
    setIsAdminAuth(false)
  }

  // load admin data after auth
  useEffect(() => {
    if (!API || !isAdminAuth || !adminToken) return
    const h = authHeaders()

    // Адмін бачить усі товари, включно з прихованими (is_visible=0)
    fetch(`${API}/products?admin=1&limit=1000`, { headers: h })
      .then(r => r.json()).then(data => { if (data.products?.length) setProducts(data.products) }).catch(() => {})
    fetch(`${API}/orders`, { headers: h }).then(r => r.json()).then(setOrders).catch(() => {})
    fetch(`${API}/consultations`, { headers: h }).then(r => r.json()).then(setConsultations).catch(() => {})
    fetch(`${API}/dealers`, { headers: h }).then(r => r.json()).then(setDealers).catch(() => {})
    // не перезаписуємо статичні пости порожнім масивом, якщо в БД блогу ще немає
    fetch(`${API}/blog?admin=1`, { headers: h }).then(r => r.json()).then(data => { if (Array.isArray(data) && data.length) setBlog(mergeBlogLinks(data)) }).catch(() => {})
    fetch(`${API}/reviews?admin=1`, { headers: h }).then(r => r.json()).then(setReviews).catch(() => {})
    fetch(`${API}/subscribers`, { headers: h }).then(r => r.json()).then(data => { if (Array.isArray(data)) setSubscribers(data) }).catch(() => {})
  }, [isAdminAuth, adminToken])

  // Orders
  async function placeOrder(orderData) {
    const order = { ...orderData, items: cart, total: cartTotal, utm: getUTM() }
    if (API) {
      try {
        const res = await fetch(`${API}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        })
        const data = await res.json()
        order.id = data.id
      } catch {}
    }
    setOrders(prev => [{ ...order, id: order.id || Date.now() }, ...prev])
    clearCart()
    return order
  }

  async function sendConsultation(data) {
    if (API) {
      try {
        await fetch(`${API}/consultations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, utm: getUTM() }),
        })
      } catch {}
    }
  }

  async function sendDealerRequest(data) {
    if (API) {
      try {
        await fetch(`${API}/dealers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, utm: getUTM() }),
        })
      } catch {}
    }
    setDealers(prev => [{ ...data, id: Date.now() }, ...prev])
  }

  async function subscribe(email) {
    if (!API) return { ok: true } // демо-режим без бекенду
    try {
      const res = await fetch(`${API}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { ok: false, error: err.error || 'Помилка' }
      }
      return { ok: true }
    } catch {
      return { ok: false, error: 'Помилка мережі' }
    }
  }

  // Публічна відправка відгуку з фото (іде на модерацію)
  async function submitReview({ name, company, rating, text, photo }) {
    if (!API) return { error: 'Відправка недоступна' }
    const fd = new FormData()
    fd.append('name', name || '')
    fd.append('company', company || '')
    fd.append('rating', String(rating || 5))
    fd.append('text', text || '')
    if (photo) fd.append('photo', photo)
    try {
      const r = await fetch(`${API}/reviews/submit`, { method: 'POST', body: fd })
      return await r.json()
    } catch {
      return { error: 'Помилка зʼєднання. Спробуйте пізніше.' }
    }
  }

  // ── Модерація відгуків (адмін) ──
  async function moderateReview(id, review) {
    if (API && adminToken) {
      try {
        await fetch(`${API}/reviews/${id}`, {
          method: 'PUT', headers: authHeaders(), body: JSON.stringify(review),
        })
      } catch {}
    }
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...review } : r))
  }

  async function removeReview(id) {
    if (API && adminToken) {
      try { await fetch(`${API}/reviews/${id}`, { method: 'DELETE', headers: authHeaders() }) } catch {}
    }
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  async function addReview(data) {
    const payload = { ...data, published: true }
    if (API && adminToken) {
      try {
        const res = await fetch(`${API}/reviews`, {
          method: 'POST', headers: authHeaders(), body: JSON.stringify(payload),
        })
        const { id } = await res.json()
        setReviews(prev => [{ ...payload, id, published: 1 }, ...prev])
        return
      } catch {}
    }
    setReviews(prev => [{ ...payload, id: Date.now(), published: 1 }, ...prev])
  }

  // ── Адмін-CRUD з персистенцією в API ──
  // Створити: POST → отримати id з БД, додати на початок локального стану.
  async function adminCreate(resource, setter, item, { prepend = true } = {}) {
    let saved = { ...item }
    if (API && adminToken) {
      try {
        const res = await fetch(`${API}/${resource}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(item) })
        const data = await res.json().catch(() => ({}))
        if (data.id != null) saved.id = data.id
      } catch {}
    }
    if (saved.id == null) saved.id = Date.now()
    setter(prev => prepend ? [saved, ...prev] : [...prev, saved])
    return saved
  }

  // Оновити: PUT за id + оновити локальний стан.
  async function adminUpdate(resource, setter, item) {
    if (API && adminToken) {
      try { await fetch(`${API}/${resource}/${item.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(item) }) } catch {}
    }
    setter(prev => prev.map(x => x.id === item.id ? { ...x, ...item } : x))
    return item
  }

  async function adminDelete(resource, setter, id) {
    if (API && adminToken) {
      try { await fetch(`${API}/${resource}/${id}`, { method: 'DELETE', headers: authHeaders() }) } catch {}
    }
    setter(prev => prev.filter(x => x.id !== id))
  }

  // Зберегти: оновити якщо є id, інакше створити.
  function adminUpsert(resource, setter, item, opts) {
    return item.id != null ? adminUpdate(resource, setter, item) : adminCreate(resource, setter, item, opts)
  }

  const saveFaq        = (item) => adminUpsert('faq', setFaq, item, { prepend: false })
  const removeFaq      = (id)   => adminDelete('faq', setFaq, id)
  const saveBanner     = (item) => adminUpsert('banners', setBanners, item, { prepend: false })
  const removeBanner   = (id)   => adminDelete('banners', setBanners, id)
  const savePromo      = (item) => adminUpsert('promos', setPromos, item, { prepend: false })
  const removePromo    = (id)   => adminDelete('promos', setPromos, id)
  // Документи: лише створення/видалення (PUT не передбачено) — нові зверху
  const saveFile       = (item) => adminCreate('files', setFiles, item, { prepend: true })
  const removeFile     = (id)   => adminDelete('files', setFiles, id)
  const removeSubscriber = (id) => adminDelete('subscribers', setSubscribers, id)
  const saveBlog       = (item) => adminUpsert('blog', setBlog, item)
  const removeBlog     = (id)   => adminDelete('blog', setBlog, id)
  // Портфоліо: UI використовує desc/image, БД — description/images[]. Мапимо при збереженні.
  const savePortfolio  = (item) => adminUpsert('portfolio', setPortfolio, {
    ...item,
    description: item.desc ?? item.description ?? '',
    images: item.image ? [item.image] : (item.images || []),
  })
  const removePortfolio= (id)   => adminDelete('portfolio', setPortfolio, id)
  // Товари: UI використовує desc, БД/API — description.
  const saveProduct    = (item) => adminUpsert('products', setProducts, { ...item, description: item.desc ?? item.description ?? '' })
  const removeProduct  = (id)   => adminDelete('products', setProducts, id)

  return (
    <AppContext.Provider value={{
      lang, setLang,
      eurRate,
      products, setProducts,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount,
      orders, setOrders,
      consultations, setConsultations,
      dealers, setDealers,
      reviews, setReviews,
      blog, setBlog,
      portfolio, setPortfolio,
      faq, setFaq,
      files, setFiles,
      banners, setBanners,
      promos, setPromos,
      subscribers, setSubscribers, removeSubscriber,
      newCounts, markViewed,
      siteSettings, setSiteSettings, saveSettings,
      homeContent, aboutContent,
      isAdminAuth, adminLogin, adminLogout,
      adminToken, authHeaders,
      uploadFile, saveFile, removeFile,
      placeOrder, sendConsultation, sendDealerRequest, subscribe,
      submitReview, moderateReview, removeReview, addReview,
      adminCreate, adminUpdate, adminDelete, adminUpsert,
      saveFaq, removeFaq, saveBlog, removeBlog, savePortfolio, removePortfolio,
      saveProduct, removeProduct,
      saveBanner, removeBanner, savePromo, removePromo,
      API,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
