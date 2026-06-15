import { BrowserRouter, HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { AppProvider } from './context/AppContext'
import { captureUTM } from './utils/utm'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import FloatingActions from './components/FloatingActions'
import TrainingPopup from './components/TrainingPopup'
import MobileBottomNav from './components/layout/MobileBottomNav'
import AdminLayout from './components/admin/AdminLayout'

// HomePage — eager (перша/LCP сторінка), решта — code-split через lazy()
import HomePage from './pages/HomePage'
const CatalogPage = lazy(() => import('./pages/CatalogPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'))
const ServicePage = lazy(() => import('./pages/ServicePage'))
const FilesPage = lazy(() => import('./pages/FilesPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const OEMPage = lazy(() => import('./pages/OEMPage'))
const ReturnPage = lazy(() => import('./pages/ReturnPage'))
const PartnersPage = lazy(() => import('./pages/PartnersPage'))
const TrainingPage = lazy(() => import('./pages/TrainingPage'))

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
const AdminFAQ = lazy(() => import('./pages/admin/AdminFAQ'))
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'))
const AdminPromos = lazy(() => import('./pages/admin/AdminPromos'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminContent = lazy(() => import('./pages/admin/AdminContent'))
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'))
const AdminSubscribers = lazy(() => import('./pages/admin/AdminSubscribers'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0); captureUTM() }, [pathname])
  return null
}

const isGhPages = import.meta.env.BASE_URL !== '/'
const RouterWrapper = isGhPages ? HashRouter : BrowserRouter

// Публічний layout — сайтовий хедер, футер, плаваючі кнопки
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
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
        <Route path="/admin/faq" element={<AdminFAQ />} />
        <Route path="/admin/banners" element={<AdminBanners />} />
        <Route path="/admin/promos" element={<AdminPromos />} />
        <Route path="/admin/subscribers" element={<AdminSubscribers />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/about" element={<AdminAbout />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* Публічні сторінки */}
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
        <Route path="/training" element={<Navigate to="/navchannya" replace />} />
      </Route>
    </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <AppProvider>
        <RouterWrapper>
          <ScrollToTop />
          <AppRoutes />
        </RouterWrapper>
      </AppProvider>
    </HelmetProvider>
  )
}
