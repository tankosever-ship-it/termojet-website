import { createContext, useContext, useState, useEffect } from 'react'
import { PRODUCTS } from '../data/products'
import { mergeWithEnriched } from '../data/mergeEnriched'
import { BLOG_POSTS } from '../data/blog'
import { PORTFOLIO } from '../data/portfolio'
import { FILES } from '../data/files'
import { fetchEurRate } from '../utils/currency'

const BASE_PRODUCTS = mergeWithEnriched(PRODUCTS)

// On GitHub Pages use static data; on real server use /api
const IS_GITHUB_PAGES = import.meta.env.VITE_BASE_URL !== '/'
const API = IS_GITHUB_PAGES ? null : '/api'

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
  const [clients, setClients] = useState([])
  const [isAdminAuth, setIsAdminAuth] = useState(() => !!loadAdminToken())
  const [adminToken, setAdminToken] = useState(loadAdminToken)
  const [eurRate, setEurRate] = useState(null)
  const [siteSettings, setSiteSettings] = useState({
    phone: '+380 50 718 91 65',
    email: 'termojet@sofievka.kiev.ua',
    address: 'м. Київ, вул. Виробнича, 1',
    workHours: 'Пн-Пт 9:00–18:00',
    telegram: '',
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
      .then(data => { if (Array.isArray(data) && data.length > 0) setBlog(data) })
      .catch(() => {})

    fetch(`${API}/portfolio`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setPortfolio(data) })
      .catch(() => {})

    fetch(`${API}/reviews`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviews(data) })
      .catch(() => {})

    fetch(`${API}/files`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) setFiles(data) })
      .catch(() => {})

    fetch(`${API}/settings`)
      .then(r => r.json())
      .then(data => { if (data) setSiteSettings(s => ({ ...s, ...data })) })
      .catch(() => {})
  }, [])

  // helper for admin API calls
  function authHeaders() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }
  }

  // Cart
  function addToCart(product, quantity = 1) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      return [...prev, { ...product, quantity }]
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

    fetch(`${API}/orders`, { headers: h }).then(r => r.json()).then(setOrders).catch(() => {})
    fetch(`${API}/consultations`, { headers: h }).then(r => r.json()).then(setConsultations).catch(() => {})
    fetch(`${API}/dealers`, { headers: h }).then(r => r.json()).then(setDealers).catch(() => {})
    fetch(`${API}/blog?admin=1`, { headers: h }).then(r => r.json()).then(setBlog).catch(() => {})
    fetch(`${API}/reviews?admin=1`, { headers: h }).then(r => r.json()).then(setReviews).catch(() => {})
  }, [isAdminAuth, adminToken])

  // Orders
  async function placeOrder(orderData) {
    const order = { ...orderData, items: cart, total: cartTotal }
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
          body: JSON.stringify(data),
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
          body: JSON.stringify(data),
        })
      } catch {}
    }
    setDealers(prev => [{ ...data, id: Date.now() }, ...prev])
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
      clients, setClients,
      siteSettings, setSiteSettings,
      isAdminAuth, adminLogin, adminLogout,
      adminToken, authHeaders,
      placeOrder, sendConsultation, sendDealerRequest, submitReview,
      moderateReview, removeReview, addReview,
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
