import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { ArrowRight, Factory, Shield, Truck, Globe, Wrench, ChevronRight, Zap, Award, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'

const STATS = [
  { key: 'years',      value: '20+',       icon: '🏭', color: 'rgba(36,87,160,0.6)' },
  { key: 'objects',    value: '50 000+',   icon: '🔥', color: 'rgba(232,93,4,0.5)' },
  { key: 'production', value: '3 000 м²',  icon: '📐', color: 'rgba(8,145,178,0.5)' },
  { key: 'countries',  value: '15',        icon: '🌍', color: 'rgba(36,87,160,0.5)' },
  { key: 'capacity',   value: '70 000+',   icon: '⚙️', color: 'rgba(232,93,4,0.4)' },
  { key: 'employees',  value: '~100',      icon: '👷', color: 'rgba(8,145,178,0.4)' },
]

const TRUST_ITEMS = [
  '✅ Власне виробництво в Україні',
  '✅ Вихідний контроль якості',
  '✅ Склад 2 500 м²',
  '✅ Сертифіковане обладнання',
  '✅ Технічна підтримка',
  '✅ Швидка відвантаження',
  '🇺🇦 MADE IN UKRAINE',
  '⭐ 20+ років на ринку',
]

const ADVANTAGE_ICONS = { own: Factory, quality: Shield, stock: Truck, export: Globe, support: Wrench, app: Zap }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

export default function HomePage() {
  const { lang, blog, portfolio, reviews } = useApp()
  const t = useT()
  const hero = t('hero')
  const stats = t('stats')
  const cats = t('categories')
  const adv = t('advantages')
  const blogT = t('blog')
  const seo = t('seo')

  const heroRef = useRef(null)

  // Interactive gradient — tracks mouse position
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const handle = (e) => {
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1)
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1)
      el.style.setProperty('--mx', `${x}%`)
      el.style.setProperty('--my', `${y}%`)
    }
    el.addEventListener('mousemove', handle, { passive: true })
    return () => el.removeEventListener('mousemove', handle)
  }, [])

  const featuredCategories = CATEGORIES.slice(0, 6)
  const recentPosts = blog.filter(p => p.published).slice(0, 3)
  const recentPortfolio = portfolio.slice(0, 3)

  return (
    <>
      <SEO title={null} description={seo.homeDesc} />

      {/* ─── HERO ─── */}
      <section
        ref={heroRef}
        className="hero-gradient hero-grain relative overflow-hidden text-white min-h-[88vh] flex items-center"
      >
        {/* Floating orbs */}
        <div className="orb orb-blue w-[500px] h-[500px] -top-32 -right-32 opacity-60" />
        <div className="orb orb-orange w-[400px] h-[400px] bottom-0 right-1/4 opacity-70" />
        <div className="orb orb-teal w-[300px] h-[300px] top-1/2 -left-20 opacity-50" />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 bg-dots opacity-100 pointer-events-none" />

        {/* Thin horizontal accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(232,93,4,0.6)] to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 text-sm font-semibold backdrop-blur-sm">
                🇺🇦 <span className="text-[#FFD500]">{hero.madeIn}</span>
              </span>
              <span className="badge-glow">
                <Award size={12} /> {hero.badge}
              </span>
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
              className="text-lg text-white/70 leading-relaxed mb-8 max-w-2xl"
            >
              {hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/catalog" className="btn-primary text-base px-7 py-3.5 shadow-lg shadow-orange-900/20">
                {hero.ctaCatalog} <ArrowRight size={16} />
              </Link>
              <Link to="/contacts" className="btn-outline-white text-base px-7 py-3.5">
                {hero.ctaContact}
              </Link>
            </motion.div>

            {/* Quick trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-x-5 gap-y-2 mt-8 text-sm text-white/50"
            >
              {['Гарантія якості', 'Доставка по Україні', 'Офіційний виробник'].map(item => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {STATS.map(s => (
              <div key={s.key} className="stat-card group">
                <div className="text-2xl mb-1.5">{s.icon}</div>
                <div className="text-xl font-black font-['Montserrat',sans-serif] group-hover:text-[var(--accent-light)] transition-colors">
                  {s.value}
                </div>
                <div className="text-xs text-white/50 mt-0.5 leading-tight">{stats[s.key]}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom gradient fade to bg */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />
      </section>

      {/* ─── SCROLLING TRUST STRIP ─── */}
      <section className="trust-strip py-3 overflow-hidden">
        <div className="flex">
          <div className="flex gap-10 animate-marquee whitespace-nowrap px-5">
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
              <span key={i} className="text-sm font-semibold text-gray-600 flex-shrink-0">{item}</span>
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
                <Link to={`/catalog/${cat.slug}`} className="cat-card block p-5 h-full relative z-10">
                  <span className="text-3xl block mb-3">{cat.icon}</span>
                  <h3 className="font-bold text-gray-900 leading-tight mb-1">
                    {cat.name[lang] || cat.name.uk}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{cat.desc[lang] || cat.desc.uk}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--primary)]/60">{cat.count} товарів</span>
                    <span className="w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                      <ChevronRight size={12} className="text-[var(--accent)]" />
                    </span>
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

      <div className="gradient-divider mx-4" />

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
                  className="card p-6 flex gap-4 hover:shadow-[var(--shadow-md)] transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, rgba(27,63,107,0.1), rgba(232,93,4,0.08))` }}>
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
          <div className="cta-gradient rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden hero-grain">
            <div className="absolute inset-0 bg-dots opacity-100 pointer-events-none" />
            <div className="orb orb-orange w-64 h-64 -bottom-16 -right-8 opacity-40" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm font-semibold mb-5 backdrop-blur-sm">
                🤝 Програма для партнерів
              </div>
              <h2 className="section-title text-white mb-4">{t('dealers').title}</h2>
              <p className="text-white/65 text-lg mb-8 max-w-2xl mx-auto">{t('dealers').subtitle}</p>
              <Link to="/dealers" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-orange-900/30">
                {t('dealers').ctaBecome} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
