import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import SEO from '../components/SEO'

// Показується для будь-якого невідомого URL (catch-all path="*") — зокрема для
// старих WordPress-посилань, що лишились в індексі Google (/product/, /product-category/,
// /author/, /feed/, /sample-page/ тощо). Раніше такі URL давали БІЛИЙ ЕКРАН
// (у роутері не було catch-all). Рендериться всередині PublicLayout (з хедером/футером).
export default function NotFoundPage() {
  return (
    <>
      <SEO title="Сторінку не знайдено (404)" />
      <div style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        gap: 18, padding: '48px 20px', fontFamily: "'Rubik', sans-serif",
      }}>
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 72, lineHeight: 1, color: 'var(--accent, #FF5500)' }}>404</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--text-primary, #1a1a1a)' }}>Сторінку не знайдено</div>
        <p style={{ color: 'var(--text-secondary, #666)', maxWidth: 460, fontSize: 15, lineHeight: 1.5 }}>
          Можливо, сторінку переміщено або видалено. Скористайтесь каталогом або поверніться на головну.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent, #FF5500)', color: '#fff', fontWeight: 700, padding: '12px 24px', textDecoration: 'none' }}>
            <Home size={17} /> На головну
          </Link>
          <Link to="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--ink-200, #ddd)', color: 'var(--text-primary, #1a1a1a)', fontWeight: 700, padding: '12px 24px', textDecoration: 'none' }}>
            <Search size={17} /> Каталог
          </Link>
        </div>
      </div>
    </>
  )
}
