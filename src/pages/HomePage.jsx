import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import {
  ArrowRight, Factory, Shield, Truck, Globe, Wrench,
  ChevronRight, Zap, Award, Play, X, Check, Star,
  Package, Gauge, Settings2, Layers
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'

const MP4_URL = 'https://termojet.com.ua/wp-content/uploads/2024/04/0-02-05-973ce8523dda389f497460d406b3d1195952436349faf993e798fb4d3b5d0980_7323ef3df1f7be93.mp4'
const YT_ID   = 'UzEOVxcS4mw'

const STATS = [
  { key: 'years',      value: '20+',      icon: '🏭' },
  { key: 'objects',    value: '50 000+',  icon: '🔥' },
  { key: 'production', value: '3 000 м²', icon: '📐' },
  { key: 'countries',  value: '15',       icon: '🌍' },
  { key: 'capacity',   value: '70 000+',  icon: '⚙️' },
  { key: 'employees',  value: '~100',     icon: '👷' },
]

const ADVANTAGES = [
  {
    icon: Factory,
    badge: 'icon-badge-glass-orange',
    title: 'Власне виробництво',
    desc: 'Завод 3 000 м² у Києві. Повний цикл від металу до готового вузла під власним контролем якості.',
    key: 'own',
  },
  {
    icon: Shield,
    badge: 'icon-badge-glass-blue',
    title: 'Гарантія якості',
    desc: 'Кожна одиниця проходить вихідний контроль. Сертифікати ISO 9001:2015 та CE маркування.',
    key: 'quality',
  },
  {
    icon: Package,
    badge: 'icon-badge-glass-orange',
    title: 'Наявність на складі',
    desc: 'Склад 2 500 м² з постійним запасом. Більшість позицій відвантажуємо наступного дня.',
    key: 'stock',
  },
  {
    icon: Globe,
    badge: 'icon-badge-glass-blue',
    title: 'Міжнародний досвід',
    desc: 'Поставки в 15 країн ЄС. Офіс у Польщі з 2018 року. Продукція відповідає стандартам ЄС.',
    key: 'export',
  },
  {
    icon: Wrench,
    badge: 'icon-badge-glass-orange',
    title: 'Технічна підтримка',
    desc: 'Інженерна підтримка на всіх етапах. Підбір обладнання під ваш проект котельні.',
    key: 'support',
  },
  {
    icon: Zap,
    badge: 'icon-badge-glass-blue',
    title: 'Комплексні рішення',
    desc: 'Від насосної групи до повного вузла обв\'язки. TERMOJET BOX, Mini, Mega — під будь-яку потужність.',
    key: 'app',
  },
]

const TRUST_ITEMS = [
  '✅ Власне виробництво',
  '🇺🇦 MADE IN UKRAINE',
  '✅ Склад 2 500 м²',
  '✅ ISO 9001:2015',
  '✅ CE сертифікація',
  '✅ 15 країн ЄС',
  '⭐ 20+ років на ринку',
  '✅ Технічна підтримка',
]

const fadeUp   = { hidden: { opacity:0, y:20 }, show: { opacity:1, y:0, transition:{ duration:0.45 } } }
const stagger  = { show: { transition: { staggerChildren: 0.08 } } }
const stagger2 = { show: { transition: { staggerChildren: 0.1  } } }

export default function HomePage() {
  const { lang, blog, portfolio } = useApp()
  const t    = useT()
  const hero = t('hero')
  const sts  = t('stats')
  const cats = t('categories')
  const adv  = t('advantages')
  const blogT= t('blog')
  const seo  = t('seo')

  const heroRef = useRef(null)
  const [videoOpen, setVideoOpen] = useState(false)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const fn = (e) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${((e.clientX-r.left)/r.width*100).toFixed(1)}%`)
      el.style.setProperty('--my', `${((e.clientY-r.top)/r.height*100).toFixed(1)}%`)
    }
    el.addEventListener('mousemove', fn, { passive:true })
    return () => el.removeEventListener('mousemove', fn)
  }, [])

  useEffect(() => {
    if (!videoOpen) return
    const fn = (e) => { if (e.key==='Escape') setVideoOpen(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [videoOpen])

  const featuredCats  = CATEGORIES.slice(0, 6)
  const recentPosts   = blog.filter(p => p.published).slice(0, 3)
  const recentPortfolio = portfolio.slice(0, 3)

  return (
    <>
      <SEO title={null} description={seo.homeDesc} />

      {/* ─── VIDEO MODAL ─── */}
      {videoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div className="relative w-full max-w-4xl aspect-video z-10" onClick={e => e.stopPropagation()}>
            <iframe className="w-full h-full rounded-2xl shadow-2xl"
              src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&rel=0&modestbranding=1`}
              title="Termojet виробництво"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
            <button onClick={() => setVideoOpen(false)}
              className="absolute -top-5 -right-5 w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section ref={heroRef}
        className="hero-gradient grain relative overflow-hidden text-white min-h-[90vh] flex items-center">
        {/* Background video */}
        <video className="absolute inset-0 w-full h-full object-cover opacity-[0.18] pointer-events-none"
          style={{ mixBlendMode:'screen' }}
          src={MP4_URL} autoPlay muted loop playsInline />

        {/* Orbs */}
        <div className="orb orb-blue   w-[600px] h-[600px] -top-40  -right-20 opacity-50" />
        <div className="orb orb-orange w-[500px] h-[500px]  bottom-0  right-1/3 opacity-75" />
        <div className="orb orb-teal   w-[280px] h-[280px]  top-1/2  -left-16  opacity-40" />

        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,85,0,0.8)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 w-full">
          <div className="max-w-3xl">

            {/* Badges */}
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
              className="flex flex-wrap items-center gap-2 mb-7">
              <span className="inline-flex items-center gap-1.5 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
                🇺🇦 <span style={{ background:'linear-gradient(90deg,#005BBB,#FFD500)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>MADE IN UKRAINE</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold"
                style={{ background:'rgba(255,85,0,0.15)', border:'1px solid rgba(255,85,0,0.3)', color:'#FF8533' }}>
                <Award size={12} /> {hero.badge}
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] font-['Montserrat',sans-serif] mb-5">
              {hero.title}
            </motion.h1>

            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
              className="text-lg text-white/65 leading-relaxed mb-9 max-w-2xl">
              {hero.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="flex flex-wrap gap-3">
              <Link to="/catalog" className="btn-primary px-7 py-3.5 text-base">
                {hero.ctaCatalog} <ArrowRight size={16} />
              </Link>
              <Link to="/contacts" className="btn-outline-white px-7 py-3.5 text-base">
                {hero.ctaContact} <ArrowRight size={16} />
              </Link>
              <button onClick={() => setVideoOpen(true)}
                className="flex items-center gap-2.5 px-5 py-3.5 rounded-[0.875rem] text-base font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-sm">
                <span className="w-8 h-8 rounded-full flex items-center justify-center animate-pulse-glow"
                  style={{ background:'linear-gradient(135deg,#FF5500,#FF9500)' }}>
                  <Play size={13} fill="white" className="ml-0.5" />
                </span>
                Відео виробництва
              </button>
            </motion.div>

            {/* Mini trust */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
              className="flex flex-wrap gap-x-5 gap-y-2 mt-9 text-sm text-white/40">
              {['Гарантія якості', 'Доставка по Україні', 'Офіційний виробник', 'Технічна підтримка'].map(item => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check size={13} className="text-[#FF8533]" /> {item}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STATS.map(s => (
              <div key={s.key} className="stat-card group">
                <div className="text-2xl mb-1.5">{s.icon}</div>
                <div className="text-xl font-black font-['Montserrat',sans-serif] group-hover:text-[#FF8533] transition-colors">
                  {s.value}
                </div>
                <div className="text-[11px] text-white/45 mt-0.5 leading-tight">{sts[s.key]}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST MARQUEE ─── */}
      <section className="trust-strip py-3 overflow-hidden">
        <div className="flex">
          <div className="flex gap-10 animate-marquee whitespace-nowrap px-5">
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
              <span key={i} className="text-sm font-semibold text-gray-500 flex-shrink-0">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════════ */}
      <section className="py-16 md:py-20 section-gradient-light">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <motion.div variants={fadeUp} className="label-accent mb-2">{cats.title}</motion.div>
              <motion.h2 variants={fadeUp} className="section-title">{cats.subtitle}</motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link to="/catalog" className="btn-ghost">
                {cats.viewAll} <ArrowRight size={15} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featuredCats.map(cat => (
              <motion.div key={cat.id} variants={fadeUp}>
                <Link to={`/catalog/${cat.slug}`} className="cat-card block p-5 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                      style={{ background:'rgba(255,85,0,0.1)', border:'1px solid rgba(255,85,0,0.2)' }}>
                      <ChevronRight size={13} style={{ color:'#FF5500' }} />
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 leading-tight mb-1.5">
                    {cat.name[lang] || cat.name.uk}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{cat.desc[lang] || cat.desc.uk}</p>
                  <div className="text-xs font-semibold" style={{ color:'#FF5500' }}>{cat.count} товарів</div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* ═══════════════════════════════════════════
          ADVANTAGES — VIVID DARK GRADIENT (Zyforia style)
      ═══════════════════════════════════════════ */}
      <section className="advantages-bg grain relative overflow-hidden py-20 md:py-28 text-white">
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        {/* Orbs */}
        <div className="orb orb-orange w-[500px] h-[500px] -right-32 top-1/2 -translate-y-1/2 opacity-50" />
        <div className="orb orb-blue   w-[400px] h-[400px] -left-20  top-0          opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4">
          {/* Section heading */}
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="text-center mb-14">
            <motion.div variants={fadeUp} className="label-white mb-3">Наші переваги</motion.div>
            <motion.h2 variants={fadeUp} className="section-title-white max-w-2xl mx-auto">
              Чому обирають{' '}
              <span className="text-gradient-orange">Termojet</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              Понад 20 років виробляємо обладнання для котелень в Україні. Якість підтверджена тисячами об'єктів.
            </motion.p>
          </motion.div>

          {/* Advantages grid — glass cards */}
          <motion.div variants={stagger2} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADVANTAGES.map((item, i) => {
              const Icon = item.icon
              const data = adv[item.key]
              return (
                <motion.div key={item.key} variants={fadeUp}
                  className="glass-card p-6 flex flex-col gap-4 group">
                  {/* Icon badge */}
                  <div className={`icon-badge icon-badge-lg ${item.badge}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2 text-base">
                      {data?.title || item.title}
                    </h3>
                    <p className="text-white/55 text-sm leading-relaxed">
                      {data?.desc || item.desc}
                    </p>
                  </div>
                  {/* bottom accent line */}
                  <div className="mt-auto pt-4 border-t border-white/8">
                    <span className="text-xs font-semibold flex items-center gap-1.5"
                      style={{ color: i % 2 === 0 ? '#FF8533' : '#6da4ff' }}>
                      <Check size={12} /> Підтверджено досвідом
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* CTA under advantages */}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            transition={{ delay:0.3 }}
            className="text-center mt-12">
            <Link to="/catalog" className="btn-primary px-8 py-3.5 text-base">
              Переглянути продукцію <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRODUCTION VIDEO
      ═══════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative overflow-hidden section-gradient-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Video thumbnail */}
            <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.6 }}
              className="relative group cursor-pointer" onClick={() => setVideoOpen(true)}>
              <div className="relative rounded-2xl overflow-hidden"
                style={{ boxShadow:'0 24px 64px rgba(27,63,107,0.18)' }}>
                <img src={`https://img.youtube.com/vi/${YT_ID}/maxresdefault.jpg`}
                  alt="Виробництво Termojet"
                  className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background:'linear-gradient(135deg,#FF5500,#FF9500)', boxShadow:'0 8px 32px rgba(255,85,0,0.55)' }}>
                    <Play size={30} fill="white" className="ml-1.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-[11px] text-white/55 mb-1 uppercase tracking-wider">Відео виробництва</div>
                  <div className="text-white font-bold text-base">Termojet — зсередини</div>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-25"
                style={{ background:'radial-gradient(circle,#FF5500,transparent)' }} />
            </motion.div>

            {/* Text + facts */}
            <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.6, delay:0.1 }}>
              <div className="label-accent mb-3">Власне виробництво</div>
              <h2 className="section-title mb-5">
                Робимо в Україні —<br />
                <span className="text-gradient-orange">від металу до готового вузла</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                Завод площею 3 000 м² у Києві. Власне металообробне обладнання, відділ контролю якості та склад готової продукції 2 500 м². Понад 70 000 одиниць обладнання на рік.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: '🏭', val: '3 000 м²', label: 'площа заводу' },
                  { icon: '⚙️', val: '70 000+',  label: 'одиниць/рік'  },
                  { icon: '👷', val: '~100',      label: 'працівників'  },
                  { icon: '📦', val: '2 500 м²',  label: 'склад'        },
                ].map(f => (
                  <div key={f.val} className="card p-4 flex items-center gap-3">
                    <span className="text-2xl">{f.icon}</span>
                    <div>
                      <div className="font-black text-base text-gray-900 font-['Montserrat',sans-serif]">{f.val}</div>
                      <div className="text-xs text-gray-400">{f.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Link to="/about" className="btn-secondary">
                  Про компанію <ArrowRight size={15} />
                </Link>
                <button onClick={() => setVideoOpen(true)} className="btn-primary">
                  <Play size={14} fill="white" /> Дивитись відео
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* ═══════════════════════════════════════════
          PORTFOLIO
      ═══════════════════════════════════════════ */}
      {recentPortfolio.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="label-accent mb-2">{t('portfolio').title}</div>
                <h2 className="section-title">{t('portfolio').subtitle}</h2>
              </div>
              <Link to="/portfolio" className="btn-ghost hidden md:flex">
                {t('portfolio').viewAll} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentPortfolio.map(item => (
                <div key={item.id} className="card card-hover overflow-hidden">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />}
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

      {/* ═══════════════════════════════════════════
          BLOG
      ═══════════════════════════════════════════ */}
      {recentPosts.length > 0 && (
        <section className="py-16 md:py-20 bg-[var(--bg-subtle)]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="label-primary mb-2">{blogT.title}</div>
                <h2 className="section-title">{blogT.subtitle}</h2>
              </div>
              <Link to="/blog" className="btn-ghost hidden md:flex">
                {blogT.viewAll} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="card card-hover overflow-hidden block group">
                  {post.image && <img src={post.image} alt={post.title} className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300" />}
                  <div className="p-5">
                    {post.category && <span className="text-xs font-bold uppercase tracking-wider" style={{ color:'#FF5500' }}>{post.category}</span>}
                    <h3 className="font-semibold text-gray-900 mt-1 mb-2 line-clamp-2">
                      {lang !== 'uk' && post[`title_${lang}`] ? post[`title_${lang}`] : post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {lang !== 'uk' && post[`excerpt_${lang}`] ? post[`excerpt_${lang}`] : post.excerpt}
                    </p>
                    <div className="mt-3 text-sm font-semibold flex items-center gap-1 transition-all group-hover:gap-2"
                      style={{ color:'#FF5500' }}>
                      {blogT.readMore} <ArrowRight size={13} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          DEALERS CTA
      ═══════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="cta-gradient grain rounded-2xl p-8 md:p-14 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-dots pointer-events-none" />
            <div className="orb orb-orange w-64 h-64 -bottom-16 -right-8 opacity-35" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 text-sm font-semibold mb-5 backdrop-blur-sm">
                🤝 Програма для партнерів
              </div>
              <h2 className="section-title-white mb-4 max-w-xl mx-auto">{t('dealers').title}</h2>
              <p className="text-white/55 text-base mb-8 max-w-xl mx-auto">{t('dealers').subtitle}</p>
              <Link to="/dealers" className="btn-primary px-8 py-4 text-base">
                {t('dealers').ctaBecome} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
