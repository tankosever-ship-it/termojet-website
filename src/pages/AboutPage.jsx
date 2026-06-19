import { useState } from 'react'
import { motion } from 'framer-motion'
import { Factory, Globe, Award, ArrowRight, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useT } from '../i18n/useT'
import { assetPath } from '../utils/assetPath'
import { useApp } from '../context/AppContext'
import { youtubeId, mediaSrc } from '../data/aboutContent'

const BASE = 'https://termojet.com.ua/wp-content/uploads'

const MANUFACTURING_VIDEO = `${BASE}/2024/04/0-02-05-973ce8523dda389f497460d406b3d1195952436349faf993e798fb4d3b5d0980_7323ef3df1f7be93.mp4`

const MANUFACTURING_PHOTOS = [
  `${BASE}/2024/04/photo_2024-04-05_18-34-39.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-32.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-36.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-26.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-29.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-22.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-19.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-15.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-12.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-09.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-33-55.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-33-49.jpg`,
  `${BASE}/2024/04/photo_2024-04-05_18-34-04.jpg`,
]

const mono = { fontFamily: "'JetBrains Mono', monospace" }
const fadeUp  = { hidden: { opacity:0, y:20 }, show: { opacity:1, y:0, transition:{ duration:0.45 } } }
const stagger = { show: { transition: { staggerChildren:0.07 } } }

function PhotoGallery({ photos, t }) {
  const [lightbox, setLightbox] = useState(null)

  function prev() { setLightbox(i => (i - 1 + photos.length) % photos.length) }
  function next() { setLightbox(i => (i + 1) % photos.length) }

  const cols = photos.length >= 6 ? 'lg:grid-cols-6' : photos.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 ${cols} gap-1`}>
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="relative overflow-hidden aspect-square group"
          >
            <img
              src={mediaSrc(photo.url)}
              alt={photo.caption || `${t('about.photoAlt')} ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {photo.caption && (
              <span className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-white text-left
                bg-gradient-to-t from-black/75 to-transparent"
                style={{ ...mono, fontSize: '9px', letterSpacing: '0.06em' }}>
                ● {photo.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95"
          onClick={() => setLightbox(null)}
        >
          <button onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 text-white/70 hover:text-white p-3">
            <ChevronLeft size={32} />
          </button>
          <div className="flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img
              src={mediaSrc(photos[lightbox].url)}
              alt={photos[lightbox].caption || ''}
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
            {photos[lightbox].caption && (
              <span className="mt-3 text-white/70" style={{ ...mono, fontSize: '12px' }}>
                {photos[lightbox].caption}
              </span>
            )}
          </div>
          <button onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 text-white/70 hover:text-white p-3">
            <ChevronRight size={32} />
          </button>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40"
            style={{ ...mono, fontSize: '11px' }}>
            {lightbox + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  )
}

export default function AboutPage() {
  const t     = useT()
  const about = t('about')
  const { aboutContent: ac } = useApp()
  const [videoOpen, setVideoOpen] = useState(null) // url відкритого відео або null

  const PROCESS_STEPS = [
    { num: '01', label: t('about.stepLaserCut') },
    { num: '02', label: t('about.stepBending') },
    { num: '03', label: t('about.stepWelding') },
    { num: '04', label: t('about.stepPowderCoat') },
    { num: '05', label: t('about.stepInsulation') },
    { num: '06', label: t('about.stepQualityControl') },
  ]

  const TIMELINE = [
    { year: '2002', title: t('about.tl2002Title'), desc: t('about.tl2002Desc') },
    { year: '2005', title: t('about.tl2005Title'), desc: t('about.tl2005Desc') },
    { year: '2008', title: t('about.tl2008Title'), desc: t('about.tl2008Desc') },
    { year: '2012', title: t('about.tl2012Title'), desc: t('about.tl2012Desc') },
    { year: '2015', title: t('about.tl2015Title'), desc: t('about.tl2015Desc') },
    { year: '2018', title: t('about.tl2018Title'), desc: t('about.tl2018Desc') },
    { year: '2022', title: t('about.tl2022Title'), desc: t('about.tl2022Desc') },
    { year: '2024', title: t('about.tl2024Title'), desc: t('about.tl2024Desc') },
  ]

  const STATS = [
    { value: '2002', label: t('about.statFoundedLabel') },
    { value: '3 000', label: t('about.statAreaLabel') },
    { value: '70 000+', label: t('about.statCapacityLabel') },
    { value: '~100', label: t('about.statEmployeesLabel') },
    { value: '50 000+', label: t('about.statObjectsLabel') },
    { value: '15', label: t('about.statCountriesLabel') },
  ]

  const fileVideos = [
    ac.oldVideo   && { src: mediaSrc(ac.oldVideo),   label: t('about.videoArchiveLabel') },
    ac.localVideo && { src: mediaSrc(ac.localVideo), label: t('about.videoWorkshopLabel') },
  ].filter(Boolean)
  const photos    = ac.photos?.length ? ac.photos : MANUFACTURING_PHOTOS.map((url) => ({ url, caption: '' }))
  const ytId      = youtubeId(ac.youtubeUrl)
  const poster    = photos[0] ? mediaSrc(photos[0].url) : MANUFACTURING_PHOTOS[0]
  // До 3 відео: старе (архівне), власне (нове) — як <video>; YouTube — як iframe
  const videoCount = fileVideos.length + (ytId ? 1 : 0)
  const vidCols = videoCount >= 3 ? 'lg:grid-cols-3' : videoCount === 2 ? 'lg:grid-cols-2' : ''

  return (
    <>
      <SEO title={about.title}
        description={t('about.seoDesc')} />

      {/* ═══ HERO ══════════════════════════════════════════════════════ */}
      <section className="hero-gradient grain relative overflow-hidden text-white pb-20 md:pb-28"
        style={{ marginTop: '-60px', paddingTop: 'calc(5rem + 60px)' }}>
        {/* Фонове фото котельні */}
        <img src={assetPath('/about-hero.png')} alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: 'center right' }} />
        {/* Затемнення — сильніше зліва, де текст */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(8,7,6,0.70) 0%, rgba(8,7,6,0.48) 45%, rgba(8,7,6,0.18) 100%)' }} />
        <div className="orb orb-orange w-[400px] h-[400px] -right-20 top-1/2 -translate-y-1/2 opacity-50" />
        <div className="orb orb-warm   w-[300px] h-[300px] -left-16  -top-16 opacity-40" />
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(255,85,0,0.9)' }}
              className="uppercase">
              {t('about.heroEyebrow')}
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="text-4xl md:text-6xl font-black font-['Archivo',sans-serif] mt-4 mb-5 leading-[1.05]">
            {t('about.heroTitle')}<br />
            <span style={{ color: 'var(--accent)' }}>{t('about.heroTitleAccent')}</span>
          </motion.h1>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
            className="text-white/60 text-lg leading-relaxed max-w-2xl mb-8">
            {t('about.heroSubtitle')}
          </motion.p>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            className="flex flex-wrap gap-3">
            {[t('about.heroBadge1'), t('about.heroBadge2'), t('about.heroBadge3')].map(tag => (
              <span key={tag} className="bg-white/8 border border-white/15 px-4 py-1.5 text-sm backdrop-blur-sm"
                style={{ ...mono, fontSize: '10px', letterSpacing: '0.1em' }}>
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════════════════ */}
      <section className="advantages-bg grain relative overflow-hidden py-12 text-white">
        <div className="absolute inset-0 bg-dots pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="grid grid-cols-3 md:grid-cols-6 gap-px bg-white/5">
            {STATS.map(s => (
              <motion.div key={s.label} variants={fadeUp}
                className="bg-[#0C0B0A] px-4 py-6 text-center hover:bg-[#141312] transition-colors">
                <div className="text-3xl font-black font-['Archivo',sans-serif] text-white mb-1"
                  style={{ color: s.value.includes('2002') ? 'rgba(255,85,0,0.8)' : undefined }}>
                  {s.value}
                </div>
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.35)' }}
                  className="uppercase">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ ABOUT TEXT ═════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 section-gradient-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.5 }}>
              <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }} className="uppercase">
                {t('about.aboutEyebrow')}
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-['Archivo',sans-serif] mt-3 mb-6 leading-tight">
                {t('about.aboutTitle')}<br />
                <span className="text-gradient-orange">{t('about.aboutTitleAccent')}</span>
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed text-sm">
                <p><strong className="text-gray-900">Termojet</strong> — {t('about.aboutP1')}</p>
                <p>{t('about.aboutP2Start')}<strong className="text-gray-900">{t('about.aboutP2Bold')}</strong>{t('about.aboutP2End')}</p>
                <p>{t('about.aboutP3Start')}<strong className="text-gray-900">{t('about.aboutP3Bold')}</strong>{t('about.aboutP3End')}</p>
                <p>{t('about.aboutP4')}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }}
              className="space-y-3">

              {/* Production specs */}
              <div className="card p-6">
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }}
                  className="uppercase mb-4">
                  {t('about.specsCardEyebrow')}
                </div>
                <div className="space-y-0 divide-y divide-gray-100">
                  {[
                    [t('about.specAreaKey'),       t('about.specAreaVal')],
                    [t('about.specWarehouseKey'),  t('about.specWarehouseVal')],
                    [t('about.specCapacityKey'),   t('about.specCapacityVal')],
                    [t('about.specTeamKey'),        t('about.specTeamVal')],
                    [t('about.specPolandKey'),      t('about.specPolandVal')],
                    [t('about.specMarketsKey'),     t('about.specMarketsVal')],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-3">
                      <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.1em', color: 'var(--text-muted)' }} className="uppercase">{k}</span>
                      <span className="text-sm font-semibold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certs */}
              <div className="card p-6">
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.16em', color: 'var(--text-muted)' }}
                  className="uppercase mb-4">
                  {t('about.certsEyebrow')}
                </div>
                <ul className="space-y-2.5">
                  {[
                    t('about.cert1'),
                    t('about.cert2'),
                    t('about.cert3'),
                    t('about.cert4'),
                  ].map(c => (
                    <li key={c} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.2)' }}>
                        <Check size={11} style={{ color:'#22c55e' }} />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ MANUFACTURING VIDEO + PHOTOS ══════════════════════════════ */}
      <section style={{ background: '#0C0B0A' }} className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">

          {/* Header */}
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="mb-10 text-center">
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }}
              className="uppercase">
              {ac.manufEyebrow}
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-['Archivo',sans-serif] text-white mt-3 mb-3 leading-tight">
              {ac.manufTitle.split('\n').map((ln, i, a) => (
                <span key={i} style={i === a.length - 1 && a.length > 1 ? { color: 'var(--accent)' } : undefined}>
                  {ln}{i < a.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-white/40 text-sm max-w-lg mx-auto">
              {ac.manufSubtitle}
            </p>
          </motion.div>

          {/* Process steps */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {PROCESS_STEPS.map(({ num, label }) => (
              <div key={num} className="flex items-center gap-2 border border-white/10 px-4 py-2">
                <span style={{ ...mono, fontSize: '10px', color: 'var(--accent)' }}>{num}</span>
                <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)' }}
                  className="uppercase">{label}</span>
              </div>
            ))}
          </div>

          {/* Відео: архівне + власне (як <video>) + оглядове YouTube (iframe) */}
          <div className={`grid grid-cols-1 ${vidCols} gap-4 max-w-4xl mx-auto mb-3`}>
            {fileVideos.map((v, i) => (
              <motion.div key={v.src} initial={{ opacity:0, scale:0.98 }} whileInView={{ opacity:1, scale:1 }}
                viewport={{ once:true }} transition={{ duration:0.5, delay: i * 0.08 }}
                onClick={() => setVideoOpen(v.src)}
                className="relative overflow-hidden rounded-xl cursor-pointer group aspect-video bg-black ring-1 ring-white/10">
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)' }}
                  className="absolute top-3 left-3 z-10 uppercase bg-black/50 px-2 py-1">
                  ● {v.label}
                </div>
                <video autoPlay muted loop playsInline preload="metadata" poster={poster}
                  className="w-full h-full object-cover block">
                  <source src={v.src} type="video/mp4" />
                </video>
                <div className="absolute inset-0 flex items-center justify-center transition-colors group-hover:bg-black/30">
                  <span className="w-14 h-14 rounded-full bg-white/15 border border-white/40 backdrop-blur-sm flex items-center justify-center opacity-80 transition-all group-hover:opacity-100 group-hover:scale-110">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 z-10 bg-black/50 px-2 py-1 uppercase"
                  style={{ ...mono, fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.65)' }}>
                  {t('about.videoExpand')}
                </div>
              </motion.div>
            ))}

            {/* Оглядове відео YouTube */}
            {ytId && (
              <motion.div initial={{ opacity:0, scale:0.98 }} whileInView={{ opacity:1, scale:1 }}
                viewport={{ once:true }} transition={{ duration:0.5, delay:0.16 }}
                className="relative overflow-hidden rounded-xl aspect-video bg-black ring-1 ring-white/10">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={t('about.youtubeTitle')}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
            )}
          </div>

          {/* Модалка відео — на весь екран */}
          {videoOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setVideoOpen(null)}>
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
              <div className="relative w-full max-w-4xl aspect-video z-10" onClick={e => e.stopPropagation()}>
                <video className="w-full h-full rounded-2xl shadow-2xl bg-black"
                  src={videoOpen} controls autoPlay playsInline />
                <button onClick={() => setVideoOpen(null)}
                  className="absolute -top-5 -right-5 w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Photo count label */}
          <div className="text-center mb-3 mt-8">
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)' }}
              className="uppercase">
              {t('about.galleryLabel')} · {photos.length} {t('about.galleryShots')}
            </span>
          </div>

          {/* Photo grid */}
          <PhotoGallery photos={photos} t={t} />
        </div>
      </section>

      {/* ═══ TIMELINE ═══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 section-gradient-light">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="text-center mb-14">
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent)' }} className="uppercase">
              {t('about.timelineEyebrow')}
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-['Archivo',sans-serif] mt-3 leading-tight">
              {t('about.timelineTitle')}
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px"
              style={{ background:'linear-gradient(to bottom, transparent, rgba(255,85,0,0.3) 10%, rgba(255,85,0,0.15) 90%, transparent)' }} />

            <div className="space-y-6">
              {TIMELINE.map((item, i) => (
                <motion.div key={item.year}
                  initial={{ opacity:0, x: i%2===0 ? -24 : 24 }}
                  whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }}
                  transition={{ duration:0.4, delay:0.04 }}
                  className={`relative flex items-start gap-6 md:gap-0 ${i%2===0 ? 'md:flex-row-reverse' : ''}`}>

                  {/* dot */}
                  <div className="absolute left-[22px] md:left-1/2 md:-translate-x-1/2 mt-5 w-3 h-3 rounded-full border-2 z-10"
                    style={{ background: '#0C0B0A', borderColor: 'var(--accent)' }} />

                  <div className="hidden md:block flex-1" />

                  <div className={`ml-14 md:ml-0 flex-1 ${i%2===0 ? 'md:pr-10' : 'md:pl-10'}`}>
                    <div className="card p-5 card-hover">
                      <div className="flex items-center gap-3 mb-2">
                        <span style={{ ...mono, fontSize: '22px', fontWeight: 900, color: 'var(--accent)' }}>
                          {item.year}
                        </span>
                        <span className="font-bold text-gray-900 text-sm">{item.title}</span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Юридичні реквізити ═══════════════════════════════════════════ */}
      <section className="py-12" style={{ background: '#0C0B0A' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-title-white text-center mb-8">{t('legal.title')}</h2>
          <div className="rounded-2xl p-6 md:p-10" style={{ background: '#15161D', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
              {[
                ['legal.fullName', 'legal.fullNameVal'],
                ['legal.shortName', 'legal.shortNameVal'],
                ['legal.edrpou', 'legal.edrpouVal'],
                ['legal.legalAddress', 'legal.legalAddressVal'],
                ['legal.actualAddress', 'legal.actualAddressVal'],
                ['legal.emailLabel', 'legal.emailVal'],
              ].map(([labelKey, valKey]) => (
                <div key={labelKey}>
                  <div style={{ ...mono, fontSize: '11px', letterSpacing: '0.06em' }} className="uppercase text-white/35 mb-1.5">
                    {t(labelKey)}
                  </div>
                  {valKey === 'legal.emailVal' ? (
                    <a href={`mailto:${t(valKey)}`} className="text-white/90 hover:text-[var(--accent)] transition-colors break-words">{t(valKey)}</a>
                  ) : (
                    <div className="text-white/90 leading-snug break-words">{t(valKey)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════════════════ */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="cta-gradient grain rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-dots pointer-events-none" />
            <div className="orb orb-orange w-56 h-56 -bottom-12 -right-8 opacity-30" />
            <div className="relative">
              <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}
                className="uppercase">
                {t('about.ctaEyebrow')}
              </span>
              <h2 className="section-title-white mt-3 mb-3 max-w-lg mx-auto">{t('about.ctaTitle')}</h2>
              <p className="text-white/55 mb-7 max-w-md mx-auto text-sm leading-relaxed">
                {t('about.ctaSubtitle')}
              </p>
              <Link to="/dealers" className="btn-primary px-8 py-3.5">
                {t('about.ctaBtn')} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
