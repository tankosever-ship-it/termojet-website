import { createContext, useContext, useState, useEffect } from 'react'
import { PRODUCTS } from '../data/products'
import { mergeWithEnriched } from '../data/mergeEnriched'
import { BLOG_POSTS } from '../data/blog'
import { PORTFOLIO } from '../data/portfolio'
import { FILES } from '../data/files'

const BASE_PRODUCTS = mergeWithEnriched(PRODUCTS)

const AppContext = createContext(null)

const ADMIN_PASSWORD = 'termojet2024'

function loadCart() {
  try { return JSON.parse(localStorage.getItem('tj2_cart') || '[]') } catch { return [] }
}
function saveCart(cart) {
  localStorage.setItem('tj2_cart', JSON.stringify(cart))
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
  const [isAdminAuth, setIsAdminAuth] = useState(() => sessionStorage.getItem('tj2_admin') === '1')
  const [siteSettings, setSiteSettings] = useState({
    phone: '+380 50 718 91 65',
    email: 'termojet@sofievka.kiev.ua',
    address: 'м. Київ, вул. Виробнича, 1',
    workHours: 'Пн-Пт 9:00–18:00',
    telegram: '',
    adminPassword: ADMIN_PASSWORD,
  })

  const BASE = import.meta.env.VITE_BASE_URL === '/' ? '' : ''

  useEffect(() => { localStorage.setItem('tj2_lang', lang) }, [lang])
  useEffect(() => { saveCart(cart) }, [cart])

  useEffect(() => {
    // Products are embedded statically from WooCommerce export
    // API call kept for future backend integration
    fetch(`${BASE}/api-products.php`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setProducts(data) })
      .catch(() => {})

    fetch(`${BASE}/api-state.php`)
      .then(r => r.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews)
        if (data.blog) setBlog(data.blog)
        if (data.portfolio) setPortfolio(data.portfolio)
        if (data.faq) setFaq(data.faq)
        if (data.files) setFiles(data.files)
        if (data.banners) setBanners(data.banners)
        if (data.clients) setClients(data.clients)
        if (data.siteSettings) setSiteSettings(s => ({ ...s, ...data.siteSettings }))
      })
      .catch(() => {})
  }, [])

  // Cart operations
  function addToCart(product, quantity = 1) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      return [...prev, { ...product, quantity }]
    })
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  function updateCartQuantity(id, quantity) {
    if (quantity <= 0) { removeFromCart(id); return }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  function clearCart() { setCart([]) }

  const cartTotal = cart.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  // Admin
  function adminLogin(password) {
    if (password === (siteSettings.adminPassword || ADMIN_PASSWORD)) {
      sessionStorage.setItem('tj2_admin', '1')
      setIsAdminAuth(true)
      return true
    }
    return false
  }

  function adminLogout() {
    sessionStorage.removeItem('tj2_admin')
    setIsAdminAuth(false)
  }

  // Orders
  async function placeOrder(orderData) {
    const order = { ...orderData, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'new', items: cart }
    try {
      await fetch(`${BASE}/api-orders.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })
    } catch {}
    setOrders(prev => [order, ...prev])
    clearCart()
    return order
  }

  async function sendConsultation(data) {
    try {
      await fetch(`${BASE}/api-consultations.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, createdAt: new Date().toISOString() }),
      })
    } catch {}
  }

  async function sendDealerRequest(data) {
    try {
      await fetch(`${BASE}/api-dealers.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, createdAt: new Date().toISOString() }),
      })
    } catch {}
    setDealers(prev => [{ ...data, id: Date.now().toString() }, ...prev])
  }

  return (
    <AppContext.Provider value={{
      lang, setLang,
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
      placeOrder, sendConsultation, sendDealerRequest,
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
