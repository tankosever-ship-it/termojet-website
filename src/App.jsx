import { BrowserRouter, HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { AppProvider } from './context/AppContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import FloatingActions from './components/FloatingActions'

import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import PortfolioPage from './pages/PortfolioPage'
import ServicePage from './pages/ServicePage'
import FilesPage from './pages/FilesPage'
import FaqPage from './pages/FaqPage'
import DeliveryPage from './pages/DeliveryPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import OEMPage from './pages/OEMPage'
import ReturnPage from './pages/ReturnPage'
import PartnersPage from './pages/PartnersPage'

import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminConsultations from './pages/admin/AdminConsultations'
import AdminSettings from './pages/admin/AdminSettings'
import AdminDealers from './pages/admin/AdminDealers'
import AdminBlog from './pages/admin/AdminBlog'
import AdminPortfolio from './pages/admin/AdminPortfolio'
import AdminFiles from './pages/admin/AdminFiles'
import AdminReviews from './pages/admin/AdminReviews'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const isGhPages = import.meta.env.BASE_URL !== '/'
const RouterWrapper = isGhPages ? HashRouter : BrowserRouter

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
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

          {/* Admin */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/consultations" element={<AdminConsultations />} />
          <Route path="/admin/dealers" element={<AdminDealers />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/portfolio" element={<AdminPortfolio />} />
          <Route path="/admin/files" element={<AdminFiles />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <AppProvider>
        <RouterWrapper>
          <ScrollToTop />
          <AppLayout />
        </RouterWrapper>
      </AppProvider>
    </HelmetProvider>
  )
}
