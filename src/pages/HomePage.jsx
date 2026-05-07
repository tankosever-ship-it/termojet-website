import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Factory, Shield, Truck, Globe, Wrench, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'

const STATS = [
  { key: 'years', value: '20+', icon: '🏭' },
  { key: 'objects', value: '50 000+', icon: '🔥' },
  { key: 'production', value: '3 000 м²', icon: '📐' },
  { key: 'countries', value: '15', icon: '🌍' },
  { key: 'capacity', value: '70 000+', icon: '⚙️' },
  { key: 'employees', value: '~100', icon: '👷' },
]

const ADVANTAGE_ICONS = {
  own: Factory,
  quality: Shield,
  stock: Truck,
  export: Globe,
  support: Wrench,
  app: Wrench,
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
}

export default function HomePage() {
  const { lang, blog, portfolio, reviews } = useApp()
  const t = useT()
  const hero = t('hero')
  const stats = t('stats')
  const cats = t('categories')
  const adv = t('advantages')
  const blogT = t('blog')
  const seo = t('seo')

  const featuredCategories = CATEGORIES.slice(0, 6)
  const recentPosts = blog.filter(p => p.published).slice(0, 3)
  const recentPortfolio = portfolio.slice(0, 3)

  return (
    <>
      <SEO title={null} description={seo.homeDesc} />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] via-[#1e4a7a] to-[#0d2a4a] text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-dots" />
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--accent)] rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            >
              🇺🇦 <span className="text-[#FFD500] font-bold">{hero.madeIn}</span>
              <span className="text-white/60">•</span>
              <span>{hero.badge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight font-['Montserrat',sans-serif] mb-5"
            >
              {hero.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/75 leading-relaxed mb-8 max-w-2xl"
            >
              {hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/catalog" className="btn-primary text-base px-6 py-3">
                {hero.ctaCatalog} <ArrowRight size={16} />
              </Link>
              <Link to="/contacts" className="btn-outline-white text-base px-6 py-3">
                {hero.ctaContact}
              </Link>
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {STATS.map(s => (
              <div key={s.key} className="bg-white/10 border border-white/15 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black font-['Montserrat',sans-serif]">{s.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{stats[s.key]}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── MANUFACTURER PROOF ─── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-gray-500">
            {[
              '✅ Власне виробництво в Україні',
              '✅ Вихідний контроль якості',
              '✅ Наявність на складі 2 500 м²',
              '✅ Сертифіковане обладнання',
              '✅ Технічна підтримка',
              '✅ Швидка відвантаження',
            ].map(item => (
              <span key={item} className="font-medium text-gray-700">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <motion.div variants={fadeUp} className="label-accent mb-2">{cats.title}</motion.div>
            <motion.h2 variants={fadeUp} className="section-title">{cats.subtitle}</motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {featuredCategories.map(cat => (
              <motion.div key={cat.id} variants={fadeUp}>
                <Link
                  to={`/catalog/${cat.slug}`}
                  className="card card-hover block p-5 h-full"
                >
                  <span className="text-3xl block mb-3">{cat.icon}</span>
                  <h3 className="font-bold text-gray-900 leading-tight mb-1">
                    {cat.name[lang] || cat.name.uk}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{cat.desc[lang] || cat.desc.uk}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{cat.count} товарів</span>
                    <ChevronRight size={14} className="text-[var(--accent)]" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-8">
            <Link to="/catalog" className="btn-secondary">
              {cats.viewAll} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── ADVANTAGES ─── */}
      <section className="py-16 md:py-20 bg-[var(--bg-subtle)]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="label-primary mb-2">Наші переваги</div>
            <h2 className="section-title">{adv.title}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(ADVANTAGE_ICONS).map(([key, Icon], i) => {
              const data = adv[key]
              if (!data) return null
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="card p-6 flex gap-4"
                >
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={22} className="text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{data.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{data.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── PORTFOLIO ─── */}
      {recentPortfolio.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="label-accent mb-2">{t('portfolio').title}</div>
                <h2 className="section-title">{t('portfolio').subtitle}</h2>
              </div>
              <Link to="/portfolio" className="hidden md:flex items-center gap-1 text-sm text-[var(--primary)] font-medium hover:gap-2 transition-all">
                {t('portfolio').viewAll} <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentPortfolio.map(item => (
                <div key={item.id} className="card card-hover overflow-hidden">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="text-xs text-gray-400 mb-1">{item.location || ''}</div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    {item.desc && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── BLOG ─── */}
      {recentPosts.length > 0 && (
        <section className="py-16 md:py-20 bg-[var(--bg-subtle)]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="label-primary mb-2">{blogT.title}</div>
                <h2 className="section-title">{blogT.subtitle}</h2>
              </div>
              <Link to="/blog" className="hidden md:flex items-center gap-1 text-sm text-[var(--primary)] font-medium hover:gap-2 transition-all">
                {blogT.viewAll} <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="card card-hover overflow-hidden block">
                  {post.image && (
                    <img src={post.image} alt={post.title} className="w-full h-44 object-cover" />
                  )}
                  <div className="p-5">
                    {post.category && (
                      <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">{post.category}</span>
                    )}
                    <h3 className="font-semibold text-gray-900 mt-1 mb-2 line-clamp-2">
                      {lang !== 'uk' && post[`title_${lang}`] ? post[`title_${lang}`] : post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {lang !== 'uk' && post[`excerpt_${lang}`] ? post[`excerpt_${lang}`] : post.excerpt}
                    </p>
                    <div className="mt-3 text-sm text-[var(--primary)] font-medium flex items-center gap-1">
                      {blogT.readMore} <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── DEALERS CTA ─── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[var(--primary)] to-[#1e5494] rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-dots opacity-10" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                🤝 Програма для партнерів
              </div>
              <h2 className="section-title text-white mb-4">{t('dealers').title}</h2>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">{t('dealers').subtitle}</p>
              <Link to="/dealers" className="btn-primary text-base px-8 py-3.5">
                {t('dealers').ctaBecome} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
