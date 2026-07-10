import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageSquare } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import SEO from '../components/SEO'
import ReviewCard from '../components/ReviewCard'
import ReviewFormModal from '../components/ReviewFormModal'
import { REVIEWS } from '../data/reviews'

const stagger = { show: { transition: { staggerChildren: 0.06 } } }

export default function ReviewsPage() {
  const t = useT()
  const { reviews, lang } = useApp()
  const [showForm, setShowForm] = useState(false)

  // Реальні (схвалені) відгуки з API
  const real = (reviews || [])
    .filter(r => r.published === 1 || r.published === true || r.published == null)
    .map(r => ({
      id: 'r' + r.id,
      name: r.name,
      role: (lang !== 'uk' && r[`company_${lang}`]) ? r[`company_${lang}`] : r.company,
      rating: r.rating || 5,
      text: (lang !== 'uk' && r[`text_${lang}`]) ? r[`text_${lang}`] : r.text,
      photo: r.photo || '',
      date: r.created_at ? new Date(r.created_at).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' }) : '',
    }))

  // Тут показуємо ВСІ відгуки: спершу реальні схвалені, далі — базові, що вже були на сайті
  const drawn = REVIEWS.map(r => ({ ...r, id: 'd' + r.id }))
  const display = [...real, ...drawn]

  return (
    <>
      <SEO title={t('home.reviewsPageTitle')} description={t('home.reviewsPageSubtitle')} />

      <div className="bg-gradient-to-br from-[var(--primary)] to-[#1e4a7a] text-white pb-12" style={{ marginTop: '-60px', paddingTop: 'calc(3rem + 60px)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="label-accent mb-2" style={{ color: '#fb923c' }}>{t('home.reviewsPageEyebrow')}</div>
          <h1 className="text-4xl font-black font-['Archivo',sans-serif] mb-2">{t('home.reviewsPageTitle')}</h1>
          <p className="text-white/70 max-w-2xl">{t('home.reviewsPageSubtitle')}</p>
        </div>
      </div>

      <section className="py-14 md:py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="text-sm text-gray-500">
              {display.length > 0 && `${display.length} ${t('home.reviewsPageCount')}`}
            </div>
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-3 text-white text-sm font-bold"
              style={{ background: 'var(--accent)' }}>
              <Star size={15} fill="white" /> {t('home.leaveReview')}
            </button>
          </div>

          {display.length > 0 ? (
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {display.map(review => <ReviewCard key={review.id} review={review} />)}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-6">{t('home.reviewsPageEmpty')}</p>
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold"
                style={{ background: 'var(--accent)' }}>
                <Star size={15} fill="white" /> {t('home.leaveReview')}
              </button>
            </div>
          )}
        </div>
      </section>

      {showForm && <ReviewFormModal onClose={() => setShowForm(false)} />}
    </>
  )
}
