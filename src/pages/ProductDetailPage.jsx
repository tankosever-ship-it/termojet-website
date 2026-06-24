import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Plus, Minus, ChevronRight, ChevronLeft, ChevronDown,
  Download, Phone, Package, Play, FileText, Wrench, X, ZoomIn,
  Truck, CreditCard, ShieldCheck, Factory,
  FileDown, Box, RotateCcw
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { imgUrl } from '../utils/imgUrl'
import { CATEGORIES } from '../data/categories'
import { FILES } from '../data/files'
import { getDocsForProduct } from '../data/docsMapping'
import { getModels3D } from '../data/models3d'
import SEO from '../components/SEO'
import { trackViewItem } from '../utils/analytics'
import { formatPrice, toUAH } from '../utils/currency'
import { isOnSale } from '../utils/sale'

// Рендер опису: якщо є нумерована комплектація «N – ...» (en-dash) — виводимо її
// охайним списком з номерами + примітку «Увага!» окремим виноском. Інакше — абзаци.
// Чистий текст з опису (для мета-тегів) — прибирає HTML-теги
function plainText(desc) {
  return (desc || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

// Прибирає вбудовану таблицю тех. характеристик з HTML-опису — вона дублює
// канонічну секцію «02 · Технічні характеристики» (сітка з product.specs).
// Видаляємо заголовок «...характеристик...» разом із наступною <table>,
// а також будь-яку решту <table> (кілька описів мають таблицю без заголовка).
function stripSpecTable(html) {
  return (html || '')
    .replace(/<h[1-6][^>]*>[^<]*характеристик[^<]*<\/h[1-6]>\s*<table[\s\S]*?<\/table>/gi, '')
    .replace(/<table[\s\S]*?<\/table>/gi, '')
    .trim()
}

function renderDescriptionBody(desc, t) {
  // Новий формат — готовий HTML (<p>, <ul>, <a>): рендеримо як є (наш контент)
  if (/<(p|ul|ol|h[1-6]|a|strong|br)\b/i.test(desc || '')) {
    return <div className="pdp-desc-html" dangerouslySetInnerHTML={{ __html: stripSpecTable(desc) }} />
  }
  const text = (desc || '').replace(/\s+/g, ' ').trim()
  const matches = [...text.matchAll(/(\d+)\s–\s/g)]
  if (matches.length < 2) {
    return desc.split('\n\n').map((para, i) => (
      <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)', marginTop: i > 0 ? 16 : 0 }}>{para}</p>
    ))
  }
  const intro = text.slice(0, matches[0].index).trim()
  const items = matches.map((m, k) => {
    const start = m.index + m[0].length
    const end = k + 1 < matches.length ? matches[k + 1].index : text.length
    return { num: m[1], body: text.slice(start, end).trim() }
  })
  let note = null
  const last = items[items.length - 1]
  const nm = last.body.match(/\s*(Увага[!:].*)$/)
  if (nm) { note = nm[1].trim(); last.body = last.body.slice(0, nm.index).trim() }
  return (
    <>
      <div className="pdp-desc-grid">
        {/* Ліворуч — вступний текст */}
        <div style={{ maxWidth: '64ch' }}>
          {intro && <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)' }}>{intro}</p>}
        </div>
        {/* Праворуч — картка «Комплектація» */}
        <div style={{ border: '1px solid var(--border)', background: 'var(--bg-warm)', alignSelf: 'start' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-100)', padding: '11px 16px', borderBottom: '1px solid var(--border)', background: '#fff' }}>{t('product.kitContents')}</div>
          <ol style={{ listStyle: 'none' }}>
            {items.map((it, idx) => (
              <li key={it.num} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '10px 16px', borderBottom: idx < items.length - 1 ? '1px solid var(--ink-200)' : 'none' }}>
                <span style={{ flexShrink: 0, width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid var(--border)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: 'var(--accent)', marginTop: 1 }}>{it.num}</span>
                <span style={{ fontSize: 13.5, lineHeight: 1.45, color: 'var(--text-secondary)' }}>{it.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {note && (
        <p style={{ marginTop: 24, padding: '12px 14px', background: 'rgba(255,85,0,0.06)', borderLeft: '3px solid var(--accent)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)' }}>{note}</p>
      )}
    </>
  )
}

// ── Trust-блок (під галереєю): акордеони як на оригінальному сайті ───────────────
const ACCORDION_ORDER = ['production', 'delivery', 'payment', 'warranty']

function Accordion({ icon: Icon, title, defaultOpen, children }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '15px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ color: 'var(--accent)', flexShrink: 0, display: 'flex' }}><Icon size={18} /></span>
        <span style={{ flex: 1, fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 15.5, fontWeight: 700, color: 'var(--ink-100)' }}>{title}</span>
        <ChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && <div style={{ padding: '2px 18px 18px' }}>{children}</div>}
    </div>
  )
}

function TrustAccordions({ t }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {ACCORDION_ORDER.map((key) => {
        const d = accordionContent(key, t)
        return (
          <Accordion key={key} icon={d.icon} title={d.title}>
            {d.body}
          </Accordion>
        )
      })}
    </div>
  )
}

// Контент акордеонів (інфо по блоках).
function accordionContent(key, t) {
  switch (key) {
    case 'production':
      return {
        title: t('product.accordion.productionTitle'),
        icon: Factory,
        body: (
          <>
            <p style={{ marginBottom: 14 }}>
              {t('product.accordion.productionDesc1')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', marginBottom: 14 }}>
              {[
                ['3 000 м²', t('product.accordion.productionStat1')],
                ['2 500 м²', t('product.accordion.productionStat2')],
                ['70 000+', t('product.accordion.productionStat3')],
                ['~100', t('product.accordion.productionStat4')],
                ['50 000+', t('product.accordion.productionStat5')],
                ['15 країн', t('product.accordion.productionStat6')],
              ].map(([v, l]) => (
                <div key={l} style={{ background: '#fff', padding: '12px 14px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 19, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
              {t('product.accordion.productionDesc2')}
            </p>
          </>
        ),
      }
    case 'warranty':
      return {
        title: t('product.accordion.warrantyTitle'),
        icon: ShieldCheck,
        body: (
          <>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 11, marginBottom: 16 }}>
              {[
                ['🛡️', t('product.accordion.warrantyItem1')],
                ['🔧', t('product.accordion.warrantyItem2')],
                ['📞', t('product.accordion.warrantyItem3')],
                ['✅', t('product.accordion.warrantyItem4')],
              ].map(([emo, txt], i) => (
                <li key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{emo}</span><span>{txt}</span>
                </li>
              ))}
            </ul>
            <Link to="/warranty" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--accent)', fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}>
              {t('product.accordion.warrantyLink')} <ChevronRight size={14} />
            </Link>
          </>
        ),
      }
    case 'delivery':
      return {
        title: t('product.accordion.deliveryTitle'),
        icon: Truck,
        body: (
          <ul style={{ listStyle: 'none', display: 'grid', gap: 13 }}>
            {[
              ['📦', t('product.accordion.deliveryMethod1Title'), t('product.accordion.deliveryMethod1Desc')],
              ['🚚', t('product.accordion.deliveryMethod2Title'), t('product.accordion.deliveryMethod2Desc')],
              ['📍', t('product.accordion.deliveryMethod3Title'), t('product.accordion.deliveryMethod3Desc')],
            ].map(([emo, title, desc], i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{emo}</span>
                <span>
                  <span style={{ display: 'block', fontWeight: 600, color: 'var(--ink-100)', fontSize: 14 }}>{title}</span>
                  <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{desc}</span>
                </span>
              </li>
            ))}
          </ul>
        ),
      }
    case 'payment':
      return {
        title: t('product.accordion.paymentTitle'),
        icon: CreditCard,
        body: (
          <ul style={{ listStyle: 'none', display: 'grid', gap: 13 }}>
            {[
              [<CreditCard size={17} />, t('product.accordion.paymentMethod1Title'), t('product.accordion.paymentMethod1Desc')],
              [<span style={{ fontWeight: 800 }}>₴</span>, t('product.accordion.paymentMethod2Title'), t('product.accordion.paymentMethod2Desc')],
              [<span style={{ fontWeight: 800 }}>₴</span>, t('product.accordion.paymentMethod3Title'), t('product.accordion.paymentMethod3Desc')],
            ].map(([ic, title, desc], i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0, width: 20, display: 'inline-flex', justifyContent: 'center', marginTop: 1 }}>{ic}</span>
                <span>
                  <span style={{ display: 'block', fontWeight: 600, color: 'var(--ink-100)', fontSize: 14 }}>{title}</span>
                  <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{desc}</span>
                </span>
              </li>
            ))}
          </ul>
        ),
      }
    default:
      return null
  }
}

// ── ImageGallery ───────────────────────────────────────────────────────────────
function ImageGallery({ images, name, model3d, t }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [mv3dReady, setMv3dReady] = useState(false)
  const touchStart = useRef(null)
  const thumbsRef = useRef(null)
  const vThumbsRef = useRef(null)

  const slides = useMemo(() => {
    const s = (images?.length > 0 ? images : []).map(src => ({ type: 'img', src }))
    if (model3d) s.splice(s.length > 0 ? 1 : 0, 0, { type: '3d', src: model3d })
    return s
  }, [images, model3d])
  const total = slides.length
  const current = slides[active] || null
  const main = current?.type === 'img' ? current.src : null

  // При зміні товару (новий набір фото) — завжди показувати перше фото
  useEffect(() => { setActive(0) }, [images])

  // Lazy load <model-viewer> — wait for whenDefined before rendering
  useEffect(() => {
    if (!model3d) return
    if (window.customElements?.get('model-viewer')) { setMv3dReady(true); return }
    if (!document.getElementById('model-viewer-js')) {
      const s = document.createElement('script')
      s.id = 'model-viewer-js'; s.type = 'module'; s.src = '/vendor/model-viewer.min.js'
      document.head.appendChild(s)
    }
    window.customElements?.whenDefined('model-viewer').then(() => setMv3dReady(true))
  }, [model3d])

  const prev = useCallback(() => setActive(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setActive(i => (i + 1) % total), [total])

  useEffect(() => {
    if (!lightbox) return
    const onKey = e => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  useEffect(() => {
    // Скролимо ЛИШЕ контейнер мініатюр (не вікно!) — інакше scrollIntoView зсував
    // усю сторінку: відкривало посередині та їхало вбік при кліку на дальні фото.
    ;[thumbsRef, vThumbsRef].forEach(ref => {
      const cont = ref.current
      if (!cont) return
      const btn = cont.children[active]
      if (!btn) return
      const c = cont.getBoundingClientRect()
      const b = btn.getBoundingClientRect()
      if (cont.scrollWidth > cont.clientWidth + 1) {
        cont.scrollBy({ left: (b.left - c.left) - (cont.clientWidth - b.width) / 2, behavior: 'smooth' })
      }
      if (cont.scrollHeight > cont.clientHeight + 1) {
        cont.scrollBy({ top: (b.top - c.top) - (cont.clientHeight - b.height) / 2, behavior: 'smooth' })
      }
    })
  }, [active])

  const onTouchStart = e => {
    if (current?.type === '3d') return  // на 3D-слайді тач = обертання моделі
    touchStart.current = e.touches[0].clientX
  }
  const onTouchEnd = e => {
    if (touchStart.current === null) return
    const dx = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    touchStart.current = null
  }

  // Thumb button — Variant A style: square, sharp border
  const ThumbButton = ({ slide, i: idx, size = 'md' }) => {
    const isActive = active === idx
    const dim = size === 'sm' ? 56 : 64
    return (
      <button
        onClick={() => setActive(idx)}
        aria-label={slide.type === '3d' ? t('product.gallery.model3dLabel') : `${t('product.gallery.photoLabel')} ${idx + 1}`}
        style={{
          width: dim, height: dim, flexShrink: 0,
          border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
          boxShadow: isActive ? '0 0 0 1px var(--accent)' : 'none',
          background: slide.type === '3d' ? '#0E3A57' : '#fff',
          padding: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 3,
          transition: 'border-color .2s, box-shadow .2s',
          cursor: 'pointer',
        }}
      >
        {slide.type === '3d' ? (
          <>
            <Box size={20} style={{ color: '#9CC6E0' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 700, letterSpacing: '.1em', color: '#9CC6E0' }}>3D</span>
          </>
        ) : (
          <img src={slide.src} alt={`фото ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        )}
      </button>
    )
  }

  // Main stage height
  const stageH = 520

  return (
    <div style={{ width: '100%' }}>
      {/* Desktop gallery: vertical thumbs + main stage */}
      <div className="hidden md:flex" style={{ gap: 12, height: stageH }}>

        {/* Vertical thumbs */}
        {total > 1 && (
          <div
            ref={vThumbsRef}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, overflowY: 'auto' }}
            className="scrollbar-thin"
          >
            {slides.map((s, i) => <ThumbButton key={i} slide={s} i={i} />)}
          </div>
        )}

        {/* Stage */}
        <div
          style={{
            position: 'relative', flex: 1, height: stageH,
            border: '1px solid var(--border)', overflow: 'hidden',
            background: `
              linear-gradient(rgba(13,13,13,.028) 1px, transparent 1px),
              linear-gradient(90deg, rgba(13,13,13,.028) 1px, transparent 1px),
              #fff`,
            backgroundSize: '18px 18px, 18px 18px, auto',
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Stock badge */}
          <span style={{
            position: 'absolute', top: 14, left: 14, zIndex: 3,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
            color: '#14803C', background: 'rgba(255,255,255,.94)', border: '1px solid rgba(22,163,74,.35)',
            padding: '5px 9px', backdropFilter: 'blur(4px)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 0 3px rgba(22,163,74,.15)', flexShrink: 0 }} />
            {t('product.inStock')}
          </span>

          {/* 3D badge */}
          {model3d && (
            <span style={{
              position: 'absolute', top: 14, right: 14, zIndex: 3,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '.08em',
              color: '#fff', background: 'var(--ink-100)', padding: '5px 8px',
            }}>
              <Box size={11} />3D
            </span>
          )}

          {/* Zoom button */}
          {main && (
            <button
              onClick={() => setLightbox(true)}
              aria-label={t('product.gallery.zoomIn')}
              style={{
                position: 'absolute', top: 58, right: 14, zIndex: 3,
                width: 34, height: 34, background: 'rgba(255,255,255,.94)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', cursor: 'pointer',
              }}
            >
              <ZoomIn size={15} />
            </button>
          )}

          {/* Main content */}
          {current?.type === '3d' ? (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 18,
              background: `
                linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px),
                #0E3A57`,
              backgroundSize: '24px 24px, 24px 24px, auto',
            }}>
              {mv3dReady ? (
                <model-viewer
                  src={current.src}
                  camera-controls=""
                  auto-rotate=""
                  autoplay=""
                  shadow-intensity="1"
                  exposure="1.1"
                  interaction-prompt="none"
                  loading="eager"
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              ) : (
                <>
                  <Box size={64} style={{ color: '#7FB2D6' }} />
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
                    color: '#BFE0F5', border: '1px solid rgba(191,224,245,.35)', padding: '7px 13px',
                  }}>
                    <RotateCcw size={12} />{t('product.gallery.loading3d')}
                  </span>
                </>
              )}
            </div>
          ) : main ? (
            <img
              src={main} alt={name}
              onClick={() => setLightbox(true)}
              draggable={false}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'contain', padding: 48, cursor: 'zoom-in',
              }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 80 }}>⚙️</div>
          )}

          {/* Prev/next nav */}
          {total > 1 && (
            <>
              <button onClick={prev} aria-label={t('product.gallery.prev')} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 42, height: 42, background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-100)', zIndex: 3, cursor: 'pointer' }}>
                <ChevronLeft size={17} />
              </button>
              <button onClick={next} aria-label={t('product.gallery.next')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 42, height: 42, background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-100)', zIndex: 3, cursor: 'pointer' }}>
                <ChevronRight size={17} />
              </button>
            </>
          )}

          {/* Counter */}
          {total > 1 && (
            <span style={{
              position: 'absolute', bottom: 14, right: 14, zIndex: 3,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
              background: 'var(--ink-100)', color: '#fff', padding: '5px 10px',
            }}>
              {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* Mobile: card-style gallery */}
      <div className="md:hidden card overflow-hidden">
        <div className="relative flex items-center justify-center bg-gray-50 select-none overflow-hidden" style={{ height: 300 }}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {current?.type === '3d' ? (
            mv3dReady ? (
              <model-viewer src={current.src} camera-controls="" auto-rotate="" autoplay="" shadow-intensity="1" exposure="1.1" interaction-prompt="none" loading="eager" style={{ width: '100%', height: '100%', display: 'block', backgroundColor: '#f9fafb' }} />
            ) : (
              <div className="flex flex-col items-center gap-2 text-sky-600">
                <Box size={32} className="animate-pulse" />
                <span className="text-xs font-medium">{t('product.gallery.loading3d')}</span>
              </div>
            )
          ) : main ? (
            <img src={main} alt={name} className="w-full h-full object-contain p-6 cursor-zoom-in" onClick={() => setLightbox(true)} draggable={false} />
          ) : (
            <div className="text-gray-200 text-8xl">⚙️</div>
          )}
          {main && (
            <button onClick={() => setLightbox(true)} className="absolute top-3 right-3 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-all" title={t('product.gallery.zoomIn')}>
              <ZoomIn size={14} />
            </button>
          )}
          {total > 1 && (
            <>
              <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all">
                <ChevronLeft size={18} className="text-gray-700" />
              </button>
              <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all">
                <ChevronRight size={18} className="text-gray-700" />
              </button>
              <span className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded font-mono">{active + 1}/{total}</span>
            </>
          )}
        </div>
        {total > 1 && (
          <div ref={thumbsRef} className="flex gap-2 p-3 border-t border-gray-100 overflow-x-auto">
            {slides.map((s, i) => <ThumbButton key={i} slide={s} i={i} size="sm" />)}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95" onClick={() => setLightbox(false)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-10" onClick={() => setLightbox(false)}>
            <X size={22} />
          </button>
          {total > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-mono">{active + 1} / {total}</span>
          )}
          {total > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10" onClick={e => { e.stopPropagation(); prev() }}>
                <ChevronLeft size={26} />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-10" onClick={e => { e.stopPropagation(); next() }}>
                <ChevronRight size={26} />
              </button>
            </>
          )}
          {main ? (
            <img src={main} alt={name} className="max-h-[82vh] max-w-[82vw] object-contain" onClick={e => e.stopPropagation()} draggable={false} />
          ) : current?.type === '3d' && mv3dReady ? (
            <model-viewer src={current.src} camera-controls="" auto-rotate="" style={{ width: '82vw', height: '82vh' }} onClick={e => e.stopPropagation()} />
          ) : null}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 overflow-x-auto max-w-[80vw] px-2">
              {slides.map((s, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActive(i) }}
                  className="flex-shrink-0 w-12 h-12 border-2 rounded overflow-hidden transition-all"
                  style={{ borderColor: active === i ? 'var(--accent)' : 'rgba(255,255,255,0.3)' }}>
                  {s.type === '3d' ? (
                    <span className="w-full h-full flex items-center justify-center text-sky-300 bg-white/10"><Box size={16} /></span>
                  ) : (
                    <img src={s.src} alt="" className="w-full h-full object-contain bg-white/10" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { categorySlug, productSlug } = useParams()
  const navigate = useNavigate()
  const { products, lang, addToCart, siteSettings, eurRate } = useApp()
  // Перехоплення кліків по внутрішніх лінках в описі → SPA-навігація (без перезавантаження)
  const onDescClick = e => {
    const a = e.target.closest('a')
    if (!a) return
    const href = a.getAttribute('href') || ''
    if (href.startsWith('/')) { e.preventDefault(); navigate(href) }
  }
  const t = useT()
  const pt = t('product')
  const cat = t('catalog')
  const common = t('common')

  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('description')
  const [added, setAdded] = useState(false)

  const product = products.find(p =>
    (p.slug === productSlug || p.id === productSlug) &&
    (p.categorySlug === categorySlug || !categorySlug)
  )

  const category = CATEGORIES.find(c => c.slug === categorySlug)
  const related = products.filter(p => p.categorySlug === categorySlug && p.id !== product?.id).slice(0, 4)

  const name = (lang !== 'uk' && product?.[`name_${lang}`]) ? product[`name_${lang}`] : (product?.name || '')
  const desc = (lang !== 'uk' && product?.[`desc_${lang}`]) ? product[`desc_${lang}`] : (product?.desc || product?.description || '')
  // Локалізовані характеристики (specs_<lang> з API), фолбек на канонічні UA
  const displaySpecs = (lang !== 'uk' && product?.[`specs_${lang}`]) ? product[`specs_${lang}`] : (product?.specs || {})

  const tabs = useMemo(() => {
    if (!product) return []
    const list = [{ key: 'description', label: pt.description || 'Опис', icon: FileText }]
    if (product.specs && Object.keys(product.specs).length > 0)
      list.push({ key: 'specs', label: pt.specs || 'Характеристики', icon: Wrench })
    if (product.video)
      list.push({ key: 'video', label: 'Відео', icon: Play })
    if (product.docs?.length > 0)
      list.push({ key: 'docs', label: pt.docs || 'Документи', icon: Download })
    if (!list.find(t => t.key === 'specs'))
      list.push({ key: 'specs', label: pt.specs || 'Характеристики', icon: Wrench })
    return list
  }, [product, pt])

  useEffect(() => {
    if (product) {
      trackViewItem({ ...product, name, categorySlug })
    }
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAddToCart() {
    if (!product) return
    addToCart(product, qty) // add_to_cart подія летить централізовано в AppContext.addToCart
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const allImages = useMemo(() => {
    const seen = new Set()
    const result = []
    for (const img of [product?.image, ...(product?.images || [])]) {
      if (img && !seen.has(img)) { seen.add(img); result.push(imgUrl(img)) }
    }
    return result
  }, [product])

  // Key specs for chips (skip Артикул/SKU за значенням і назвою, take up to 5)
  const ARTICLE_LABELS = ['Артикул', 'Назва', 'SKU', 'Article', 'Name', 'Nazwa', 'Nom', 'Bezeichnung', 'Numer artykułu', 'Référence', 'Artikelnummer']
  const specPills = useMemo(() => {
    if (!displaySpecs) return []
    return Object.entries(displaySpecs)
      .filter(([k, v]) => !ARTICLE_LABELS.includes(k) && v !== product?.sku)
      .slice(0, 5)
  }, [displaySpecs, product?.sku])

  // Documents for this product
  const productDocs = useMemo(() => {
    const ids = getDocsForProduct(categorySlug, name, product?.sku)
    return ids
      .map(id => FILES.find(f => f.id === id))
      .filter(Boolean)
      .filter(f => ['Інструкції', 'Брошури'].includes(f.category))
  }, [categorySlug, name, product?.sku])

  // 3D models (STEP)
  const productModels = useMemo(() => getModels3D(product?.slug), [product?.slug])
  const model3dUrl = useMemo(() => productModels.find(m => m.glb)?.glb || null, [productModels])

  // ⚠️ ALL hooks above this line — safe early return (Rules of Hooks)
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package size={56} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('product.notFound')}</h2>
        <p className="text-gray-400 mb-6">{t('product.notFoundSub')}</p>
        <Link to="/catalog" className="btn-primary">{cat.title}</Link>
      </div>
    )
  }

  const ytId = product.video ? (
    product.video.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/\s]{11})/)?.[1]
  ) : null

  const activeTab = tabs.find(t => t.key === tab) ? tab : tabs[0]?.key

  const priceUAH = product.price
    ? Math.round((toUAH(product.price, product.currency, eurRate) || 0) * qty)
    : null
  const onSale = isOnSale(product)
  const salePriceUAH = onSale
    ? Math.round((toUAH(product.salePrice, product.currency, eurRate) || 0) * qty)
    : null
  const priceUAHunit = toUAH(onSale ? product.salePrice : product.price, product.currency, eurRate) || null

  // 3D STEP block — renders in two places with adaptive visibility
  const models3DBlock = productModels.length > 0 ? (
    <div style={{
      border: '1px solid #0E3A57',
      background: `
        linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px),
        #0E3A57`,
      backgroundSize: '20px 20px, 20px 20px, auto',
      color: '#fff', padding: 16,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <span style={{ width: 44, height: 44, border: '1px solid rgba(191,224,245,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BFE0F5', flexShrink: 0 }}>
        <Box size={20} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9CC6E0', display: 'block' }}>{t('product.model3dLabel')}</span>
        {productModels.map(m => (
          <span key={m.file} style={{ fontSize: 13.5, fontWeight: 600, display: 'block', marginTop: 3 }}>{m.name}</span>
        ))}
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: '#7FA8C2', display: 'block', marginTop: 2 }}>
          {productModels.map(m => `STEP · ${m.size}`).join(' · ')}
        </span>
      </span>
      {productModels.map(m => (
        <a
          key={m.file}
          href={`/uploads/3d/${m.file}`}
          download={m.name}
          style={{
            flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
            color: '#0E3A57', background: '#fff', padding: '9px 13px',
            textDecoration: 'none',
          }}
        >
          <Download size={11} />STEP
        </a>
      ))}
    </div>
  ) : null

  return (
    <>
      <SEO
        title={product.seoTitle || name}
        description={product.metaDescription || plainText(desc).slice(0, 160)}
        type="product"
        image={allImages[0]}
        product={{ name, description: plainText(desc), sku: product.sku, price: priceUAHunit, images: allImages }}
        breadcrumbs={[
          { name: t('product.breadcrumbHome'), url: 'https://termojet.com.ua/' },
          { name: t('nav').catalog, url: 'https://termojet.com.ua/catalog' },
          ...(category ? [{ name: category.name?.uk || category.name, url: `https://termojet.com.ua/catalog/${categorySlug}` }] : []),
          { name, url: `https://termojet.com.ua/catalog/${categorySlug}/${productSlug}` },
        ]}
      />

      {/* ── Breadcrumb bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4" style={{ display: 'flex', alignItems: 'center', gap: 9, height: 46 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 600, letterSpacing: '.05em', color: 'var(--text-muted)', textTransform: 'uppercase', flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-[var(--accent)] transition-colors">{t('product.breadcrumbHome')}</Link>
            <span style={{ color: '#C9C6BF' }}>/</span>
            <Link to="/catalog" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-[var(--accent)] transition-colors">{t('nav').catalog}</Link>
            {category && (
              <>
                <span style={{ color: '#C9C6BF' }}>/</span>
                <Link to={`/catalog/${categorySlug}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-[var(--accent)] transition-colors">
                  {category.name[lang] || category.name.uk}
                </Link>
              </>
            )}
            <span style={{ color: '#C9C6BF' }}>/</span>
            <span style={{ color: 'var(--ink-100)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 320 }}>{name}</span>
          </div>
          {product.sku && (
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 600, letterSpacing: '.05em', color: 'var(--text-secondary)', flexShrink: 0 }}>
              {t('product.artLabel')} <strong style={{ color: 'var(--ink-100)' }}>{product.sku}</strong>
            </span>
          )}
        </div>
      </div>

      {/* ── PDP content ── */}
      <div className="max-w-7xl mx-auto px-4" style={{ paddingTop: 36, paddingBottom: 0 }}>

        {/* ── 2-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr]" style={{ gap: 48, alignItems: 'start' }}>

          {/* LEFT: gallery + 3D STEP (desktop) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ImageGallery images={allImages} name={name} model3d={model3dUrl} t={t} />

            {/* Category meta — desktop */}
            {category && (
              <div className="hidden lg:flex items-center justify-between text-sm" style={{ paddingInline: 2 }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>{t('product.category')}</span>
                <Link to={`/catalog/${categorySlug}`} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }} className="hover:underline">
                  {category.name[lang] || category.name.uk}
                </Link>
              </div>
            )}

            {/* Trust-блок під галереєю — акордеони (доставка / оплата / гарантія / виробництво) */}
            <TrustAccordions t={t} />
          </div>

          {/* RIGHT: buy panel */}
          <div>

            {/* Eyebrow + own-production badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
              {category && (
                <span className="eyebrow">{category.name[lang] || category.name.uk}</span>
              )}
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                color: 'var(--accent-dim)', background: 'rgba(255,85,0,.08)', borderLeft: '2px solid var(--accent)',
                padding: '4px 8px', whiteSpace: 'nowrap',
              }}>{t('product.ownProduction')}</span>
            </div>

            {/* Product name */}
            <h1 style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 27, fontWeight: 800, lineHeight: 1.22, letterSpacing: '-.01em', marginBottom: 6 }}>{name}</h1>

            {/* Meta row: SKU + stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
              {product.sku && (
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, letterSpacing: '.06em',
                  color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'var(--bg-warm)', padding: '5px 10px',
                }}>
                  {t('product.artLabel')} <strong style={{ color: 'var(--ink-100)', fontWeight: 700 }}>{product.sku}</strong>
                </span>
              )}
              {product.inStock ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#14803C' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 0 3px rgba(22,163,74,.15)' }} />
                  {pt.inStock || 'В наявності'}
                </span>
              ) : (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {cat.outOfStock || 'Під замовлення'}
                </span>
              )}
            </div>

            {/* Short description */}
            {desc && (() => {
              const intro = plainText(desc)
              return intro ? (
                <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  {intro.length > 200 ? intro.slice(0, 200) + '…' : intro}
                </p>
              ) : null
            })()}

            {/* Spec chips */}
            {specPills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
                {specPills.map(([k, v]) => (
                  <span key={k} style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 600, letterSpacing: '.03em',
                    color: 'var(--text-secondary)', background: 'var(--bg-warm)', border: '1px solid var(--border)',
                    padding: '4px 9px', whiteSpace: 'nowrap',
                  }}>
                    {k}: <strong style={{ color: 'var(--ink-100)', fontWeight: 700 }}>{v}</strong>
                  </span>
                ))}
                {Object.keys(displaySpecs || {}).length > 5 && (
                  <button onClick={() => setTab('specs')} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 600, letterSpacing: '.03em', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px' }}>
                    ще →
                  </button>
                )}
              </div>
            )}

            {/* Price block */}
            <div style={{ borderTop: '2px solid var(--ink-100)', paddingTop: 16, marginBottom: 18 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                {onSale ? t('product.salePriceLabel') : t('product.priceLabel')}
              </span>
              {priceUAH ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  {onSale && salePriceUAH ? (
                    <>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 38, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1, color: 'var(--accent)' }}>
                        {salePriceUAH.toLocaleString('uk-UA')}
                        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-muted)', marginLeft: 4 }}>₴</span>
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{priceUAH.toLocaleString('uk-UA')}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, padding: '3px 7px', background: 'var(--accent)', color: '#fff', letterSpacing: '.08em', textTransform: 'uppercase' }}>{t('product.saleTag')}</span>
                    </>
                  ) : (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 38, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1, color: 'var(--ink-100)' }}>
                      {priceUAH.toLocaleString('uk-UA')}
                      <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-muted)', marginLeft: 4 }}>₴</span>
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)' }}>{t('product.priceOnRequest')}</div>
              )}
              {priceUAH && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 7 }}>
                  {t('product.perUnit')}{qty > 1 ? ` · ${Math.round((onSale && salePriceUAH ? salePriceUAH : priceUAH) / qty).toLocaleString('uk-UA')} / шт` : ''} · {t('product.paymentNote')}
                </p>
              )}
            </div>

            {/* Qty stepper + Add to cart */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              {/* Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--ink-100)', height: 52, flexShrink: 0 }}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  aria-label={t('product.qtyDecrease')}
                  style={{ width: 44, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Minus size={13} />
                </button>
                <span style={{ width: 40, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: 'var(--ink-100)' }}>{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  aria-label={t('product.qtyIncrease')}
                  style={{ width: 44, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  background: added ? '#16A34A' : 'var(--accent)',
                  color: '#fff', border: `1px solid ${added ? '#16A34A' : 'var(--accent)'}`,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                  height: 52, cursor: 'pointer', transition: 'background .2s, border-color .2s',
                }}
              >
                <ShoppingCart size={15} />
                {added ? t('product.added') : (pt.addToCart || 'Додати в кошик')}
              </button>
            </div>

            {/* Consultation */}
            <a
              href={`tel:${siteSettings.phone}`}
              style={{
                width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                background: '#fff', color: 'var(--ink-100)', border: '1px solid var(--ink-100)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                height: 48, cursor: 'pointer', marginBottom: 20, textDecoration: 'none',
                transition: 'background .2s, color .2s',
              }}
              className="pdp-btn-consult"
            >
              <Phone size={14} />
              {pt.askConsult || 'Замовити консультацію'}
            </a>

            {/* Documents block */}
            {productDocs.length > 0 && (
              <div style={{ border: '1px solid var(--border)', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-warm)', borderBottom: '1px solid var(--border)', padding: '9px 14px' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-100)' }}>{t('product.docsTitle')}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{productDocs.length} {t('product.filesCount')}</span>
                </div>
                {productDocs.map(doc => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: '1px solid var(--border)', transition: 'background .15s', textDecoration: 'none' }}
                    className="pdp-doc-row"
                  >
                    <span style={{ width: 36, height: 36, border: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                      <FileDown size={16} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-100)', lineHeight: 1.3, display: 'block' }}>
                        {doc.name.replace(/^(Інструкція|Брошура)\s*—\s*/i, '')}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 600, letterSpacing: '.04em', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                        {doc.category} · {doc.format} · {doc.year}
                      </span>
                    </span>
                    <span style={{
                      flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em',
                      color: 'var(--accent-dim)', border: '1px solid rgba(255,85,0,.4)', padding: '5px 9px',
                    }}>
                      <Download size={10} />PDF
                    </span>
                  </a>
                ))}
              </div>
            )}

            {/* 3D STEP block — під документами для завантаження */}
            {models3DBlock && <div style={{ marginBottom: 14 }}>{models3DBlock}</div>}

          </div>
        </div>

        {/* ── Below-fold sections ── */}
        <div style={{ paddingBottom: 80 }}>

          {/* ── 02 · Specs ── */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <section style={{ marginTop: 60 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, borderBottom: '2px solid var(--ink-100)', paddingBottom: 13, marginBottom: 26 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <span className="section-num">02</span>
                  <h2 style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 23, fontWeight: 800, letterSpacing: '-.01em' }}>{t('product.specsHeading')}</h2>
                </div>
              </div>
              <div className="pdp-specs-grid">
                {Object.entries(displaySpecs).map(([k, v]) => (
                  <div key={k} className="pdp-spec-row">
                    <span className="pdp-spec-k">{k}</span>
                    <span className="pdp-spec-v">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 03 · Description ── */}
          {desc && (
            <section style={{ marginTop: 60 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, borderBottom: '2px solid var(--ink-100)', paddingBottom: 13, marginBottom: 26 }}>
                <span className="section-num">03</span>
                <h2 style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 23, fontWeight: 800, letterSpacing: '-.01em' }}>{t('product.descHeading')}</h2>
              </div>
              <div onClick={onDescClick}>
                {renderDescriptionBody(desc, t)}
              </div>
              {/* Video */}
              {ytId && (
                <div style={{ marginTop: 32, aspectRatio: '16/9', maxWidth: 720 }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title={t('product.videoTitle')}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', border: '1px solid var(--border)' }}
                  />
                </div>
              )}
            </section>
          )}

          {/* ── 04 · Related ── */}
          {related.length > 0 && (
            <section style={{ marginTop: 60 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, borderBottom: '2px solid var(--ink-100)', paddingBottom: 13, marginBottom: 26 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <span className="section-num">04</span>
                  <h2 style={{ fontFamily: "'Archivo', system-ui, sans-serif", fontSize: 23, fontWeight: 800, letterSpacing: '-.01em' }}>{pt.related || 'Схожі товари'}</h2>
                </div>
                <Link to={`/catalog/${categorySlug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', textDecoration: 'none' }} className="hover:text-[var(--accent)] transition-colors">
                  {t('product.allProducts')}
                  <ChevronRight size={11} />
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="grid-cols-2 md:grid-cols-4">
                {related.map(p => {
                  const pName = (lang !== 'uk' && p[`name_${lang}`]) ? p[`name_${lang}`] : (p.name || '')
                  const pPriceUAH = p.price ? Math.round(toUAH(p.price, p.currency, eurRate) || 0) : null
                  return (
                    <Link
                      key={p.id}
                      to={`/catalog/${categorySlug}/${p.slug || p.id}`}
                      style={{
                        background: '#fff', border: '1px solid var(--border)',
                        position: 'relative', display: 'flex', flexDirection: 'column',
                        textDecoration: 'none', color: 'inherit',
                        transition: 'box-shadow .25s, transform .25s, border-color .25s',
                      }}
                      className="pdp-rel-card"
                    >
                      <div style={{
                        height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                        background: `
                          linear-gradient(rgba(13,13,13,.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(13,13,13,.03) 1px, transparent 1px),
                          var(--bg-warm)`,
                        backgroundSize: '14px 14px, 14px 14px, auto',
                      }}>
                        {p.image ? (
                          <img src={imgUrl(p.image)} alt={pName} loading="lazy" decoding="async" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: 40, color: '#ddd' }}>⚙️</span>
                        )}
                      </div>
                      <div style={{ padding: '13px 15px 15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {category && (
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>
                            {category.name[lang] || category.name.uk}
                          </div>
                        )}
                        <div style={{ fontFamily: "'Archivo', sans-serif", fontSize: 13.5, fontWeight: 700, lineHeight: 1.35, color: 'var(--ink-100)', marginBottom: 12, flex: 1 }}>
                          {pName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--ink-200)', paddingTop: 10 }}>
                          {pPriceUAH ? (
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 800, color: 'var(--ink-100)' }}>
                              {pPriceUAH.toLocaleString('uk-UA')} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>₴</span>
                            </span>
                          ) : (
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>{t('product.priceOnRequest')}</span>
                          )}
                          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="pdp-rel-arrow" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  )
}
