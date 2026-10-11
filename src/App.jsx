import { BrowserRouter, HashRouter, StaticRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { AppProvider } from './context/AppContext'
import { captureUTM } from './utils/utm'
import { useLangFromUrl } from './hooks/useLangFromUrl'
import { PUBLIC_LANG_CODES } from './i18n/translations'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import FloatingActions from './components/FloatingActions'
import TrainingPopup from './components/TrainingPopup'
import MobileBottomNav from './components/layout/MobileBottomNav'
import AdminLayout from './components/admin/AdminLayout'
import ErrorBoundary from './components/ErrorBoundary'
import { SsrEntryContext } from './utils/motion'

// HomePage — eager (перша/LCP сторінка), решта — code-split через lazy()
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage' // eager — 404 не має залежати від lazy-чанка
// Завантажувачі публічних сторінок — і для lazy(), і для фонового підвантаження
// (prefetchPages нижче). Адмінка сюди не входить.
const PAGE_LOADERS = {
  CatalogPage: () => import('./pages/CatalogPage'),
  ProductDetailPage: () => import('./pages/ProductDetailPage'),
  CartPage: () => import('./pages/CartPage'),
  AboutPage: () => import('./pages/AboutPage'),
  ContactPage: () => import('./pages/ContactPage'),
  BlogPage: () => import('./pages/BlogPage'),
  BlogPostPage: () => import('./pages/BlogPostPage'),
  PortfolioPage: () => import('./pages/PortfolioPage'),
  ServicePage: () => import('./pages/ServicePage'),
  FilesPage: () => import('./pages/FilesPage'),
  PraysPage: () => import('./pages/PraysPage'),
  FaqPage: () => import('./pages/FaqPage'),
  DeliveryPage: () => import('./pages/DeliveryPage'),
  PrivacyPage: () => import('./pages/PrivacyPage'),
  TermsPage: () => import('./pages/TermsPage'),
  OEMPage: () => import('./pages/OEMPage'),
  ReturnPage: () => import('./pages/ReturnPage'),
  PartnersPage: () => import('./pages/PartnersPage'),
  TrainingPage: () => import('./pages/TrainingPage'),
  ReviewsPage: () => import('./pages/ReviewsPage'),
}

// Код сторінок підвантажуємо заздалегідь, коли браузер вільний. Інакше чанк сторінки
// (2–100 кБ) вантажився лише в момент переходу і стояв у черзі за фото/відео
// попередньої сторінки: /files, /navchannya, /blog відкривались по 1.5–7 с.
// Повторний import() того самого модуля бере його з кешу — подвійного запиту немає.
function prefetchPages() {
  if (navigator.connection?.saveData) return
  const queue = Object.values(PAGE_LOADERS)
  const idle = window.requestIdleCallback || (cb => setTimeout(cb, 300))
  const next = () => {
    const load = queue.shift()
    if (!load) return
    load().catch(() => {}).finally(() => idle(next))
  }
  idle(next)
}
const CatalogPage = lazy(PAGE_LOADERS.CatalogPage)
const ProductDetailPage = lazy(PAGE_LOADERS.ProductDetailPage)
const CartPage = lazy(PAGE_LOADERS.CartPage)
const AboutPage = lazy(PAGE_LOADERS.AboutPage)
const ContactPage = lazy(PAGE_LOADERS.ContactPage)
const BlogPage = lazy(PAGE_LOADERS.BlogPage)
const BlogPostPage = lazy(PAGE_LOADERS.BlogPostPage)
const PortfolioPage = lazy(PAGE_LOADERS.PortfolioPage)
const ServicePage = lazy(PAGE_LOADERS.ServicePage)
const FilesPage = lazy(PAGE_LOADERS.FilesPage)
// Сторінка існує заради посилання для партнерів — лише українською: прайс гривневий.
const PraysPage = lazy(PAGE_LOADERS.PraysPage)
const FaqPage = lazy(PAGE_LOADERS.FaqPage)
const DeliveryPage = lazy(PAGE_LOADERS.DeliveryPage)
const PrivacyPage = lazy(PAGE_LOADERS.PrivacyPage)
const TermsPage = lazy(PAGE_LOADERS.TermsPage)
const OEMPage = lazy(PAGE_LOADERS.OEMPage)
const ReturnPage = lazy(PAGE_LOADERS.ReturnPage)
const PartnersPage = lazy(PAGE_LOADERS.PartnersPage)
const TrainingPage = lazy(PAGE_LOADERS.TrainingPage)
const ReviewsPage = lazy(PAGE_LOADERS.ReviewsPage)

const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminConsultations = lazy(() => import('./pages/admin/AdminConsultations'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminDealers = lazy(() => import('./pages/admin/AdminDealers'))
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'))
const AdminPortfolio = lazy(() => import('./pages/admin/AdminPortfolio'))
const AdminFiles = lazy(() => import('./pages/admin/AdminFiles'))
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'))
const AdminProductReviews = lazy(() => import('./pages/admin/AdminProductReviews'))
const AdminFAQ = lazy(() => import('./pages/admin/AdminFAQ'))
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'))
const AdminPromos = lazy(() => import('./pages/admin/AdminPromos'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminUTM = lazy(() => import('./pages/admin/AdminUTM'))
const AdminContent = lazy(() => import('./pages/admin/AdminContent'))
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'))
const AdminSubscribers = lazy(() => import('./pages/admin/AdminSubscribers'))

function ScrollToTop() {
  const { pathname } = useLocation()
  const isFirstRun = useRef(true)
  useEffect(() => {
    // На першому запуску не скролимо: з SSR сторінка видима й прокручувана ще до JS,
    // і гідрація інакше кидала б угору того, хто вже гортає (а також ламала б
    // відновлення прокрутки браузером при оновленні/«назад» і переходи за #якорем).
    if (isFirstRun.current) isFirstRun.current = false
    else window.scrollTo(0, 0)
    captureUTM()
  }, [pathname])
  return null
}

// Синхронізує lang у AppContext з мовним префіксом URL (/en/...)
function LangSync() {
  useLangFromUrl()
  return null
}

const isGhPages = import.meta.env.BASE_URL !== '/'
const RouterWrapper = isGhPages ? HashRouter : BrowserRouter

// Публічний layout — сайтовий хедер, футер, плаваючі кнопки
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <LangSync />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-[var(--primary)] focus:text-white focus:px-4 focus:py-2 focus:rounded">
        Перейти до основного контенту
      </a>
      <Navbar />
      <main id="main" className="flex-1 pb-16 md:pb-0 pt-[60px]">
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
      <MobileBottomNav />
      <TrainingPopup />
    </div>
  )
}

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Дерево публічних роутів для мовного префікса (/en, /pl, /fr, /de).
// Діти — відносні шляхи (як у UK-дереві), тож шаблон однаковий для всіх мов.
// Раніше існував лише /en → перемикання на pl/fr/de вело на неіснуючий роут = білий екран.
function langRoutes(lang) {
  const p = `/${lang}`
  return (
    <Route key={lang} path={p} element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="catalog" element={<CatalogPage />} />
      <Route path="catalog/:categorySlug" element={<CatalogPage />} />
      <Route path="catalog/:categorySlug/:productSlug" element={<ProductDetailPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="contacts" element={<ContactPage />} />
      <Route path="blog" element={<BlogPage />} />
      <Route path="blog/:slug" element={<BlogPostPage />} />
      <Route path="portfolio" element={<PortfolioPage />} />
      <Route path="dealers" element={<Navigate to={`${p}/partners`} replace />} />
      <Route path="service" element={<ServicePage />} />
      <Route path="files" element={<FilesPage />} />
      <Route path="faq" element={<FaqPage />} />
      <Route path="delivery" element={<DeliveryPage />} />
      <Route path="privacy" element={<PrivacyPage />} />
      <Route path="terms" element={<TermsPage />} />
      <Route path="oem" element={<OEMPage />} />
      <Route path="warranty" element={<Navigate to={`${p}/service`} replace />} />
      <Route path="support" element={<Navigate to={`${p}/service`} replace />} />
      <Route path="returns" element={<ReturnPage />} />
      <Route path="partners" element={<PartnersPage />} />
      <Route path="navchannya" element={<TrainingPage />} />
      <Route path="reviews" element={<ReviewsPage />} />
      <Route path="training" element={<Navigate to={`${p}/navchannya`} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
}

// Сигнал для GTM в index.html: React закінчив гідрацію (ефект спрацьовує, коли
// межа Suspense зі сторінкою вже «ожила»). Binotel із GTM переписує посилання tel:
// у DOM; якщо він встигав до гідрації — React бачив чужий HTML (#418) і
// перемальовував усю сторінку.
function HydratedSignal() {
  useEffect(() => {
    if (window.__tjHydrated) return
    window.__tjHydrated = true
    window.dispatchEvent(new Event('tj:hydrated'))
  }, [])
  return null
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
    <Routes>
      {/* Логін адмінки — без сайдбара і без сайтового chrome */}
      <Route path="/admin" element={<AdminLoginPage />} />

      {/* Адмінка — власний layout зі сайдбаром зліва (без сайтового хедера/футера) */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/consultations" element={<AdminConsultations />} />
        <Route path="/admin/dealers" element={<AdminDealers />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/portfolio" element={<AdminPortfolio />} />
        <Route path="/admin/files" element={<AdminFiles />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/product-reviews" element={<AdminProductReviews />} />
        <Route path="/admin/faq" element={<AdminFAQ />} />
        <Route path="/admin/banners" element={<AdminBanners />} />
        <Route path="/admin/promos" element={<AdminPromos />} />
        <Route path="/admin/subscribers" element={<AdminSubscribers />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/utm" element={<AdminUTM />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/about" element={<AdminAbout />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* Публічні сторінки (UK — без префікса) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/:categorySlug" element={<CatalogPage />} />
        <Route path="/catalog/:categorySlug/:productSlug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/dealers" element={<Navigate to="/partners" replace />} />
        <Route path="/service" element={<ServicePage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/prays" element={<PraysPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/oem" element={<OEMPage />} />
        <Route path="/warranty" element={<Navigate to="/service" replace />} />
        <Route path="/support" element={<Navigate to="/service" replace />} />
        <Route path="/returns" element={<ReturnPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/navchannya" element={<TrainingPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/training" element={<Navigate to="/navchannya" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Публічні сторінки з мовним префіксом (/en, /fr, /de, /ro) — з одного шаблону.
          Список береться з PUBLIC_LANG_CODES: заховані мови (HIDDEN_LANGS) маршрутів не мають,
          їх /pl/... ловить 301 на бекенді. */}
      {PUBLIC_LANG_CODES.filter(c => c !== 'uk').map(langRoutes)}
    </Routes>
    <HydratedSignal />
    </Suspense>
  )
}

// Позначає сторінку, яку відрендерив сервер: поки користувач на ній, анімації
// появи вимкнені (див. utils/motion.jsx). Ключ першого запису історії однаковий
// у StaticRouter і BrowserRouter ('default'), тож сервер і гідрація збігаються;
// після SPA-переходу ключ інший → анімації знову працюють.
function SsrEntryProvider({ enabled, children }) {
  const location = useLocation()
  const [firstKey] = useState(location.key)
  const value = enabled && location.key === firstKey
  return <SsrEntryContext.Provider value={value}>{children}</SsrEntryContext.Provider>
}

// initialData — дані серверного рендеру (SSR), ssrLocation — URL, який рендерить
// сервер (src/entry-server.jsx). У браузері ssrLocation немає → BrowserRouter.
export default function App({ initialData = null, ssrLocation = null }) {
  // Лише в браузері й після повного завантаження першої сторінки — не конкурує з її LCP
  useEffect(() => {
    if (ssrLocation != null) return
    if (document.readyState === 'complete') prefetchPages()
    else window.addEventListener('load', prefetchPages, { once: true })
    return () => window.removeEventListener('load', prefetchPages)
  }, [ssrLocation])
  const routes = (
    <SsrEntryProvider enabled={!!initialData}>
      <ScrollToTop />
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </SsrEntryProvider>
  )
  return (
    <AppProvider initialData={initialData}>
      {ssrLocation != null
        ? <StaticRouter location={ssrLocation}>{routes}</StaticRouter>
        : <RouterWrapper>{routes}</RouterWrapper>}
    </AppProvider>
  )
}
