import { useParams } from 'react-router-dom'
import LLink from '../components/LLink'
import { Calendar, ArrowLeft, ArrowRight, ChevronRight, ArrowUpRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import { localizeHtml } from '../utils/localizeHtml'
import SEO from '../components/SEO'

export default function BlogPostPage() {
  const { slug } = useParams()
  const { blog, lang } = useApp()
  const t = useT()
  const blogT = t('blog')

  const post = blog.find(p => p.slug === slug)
  const published = blog.filter(p => p.published && p.slug !== slug)
  const related = published.slice(0, 3)

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">📄</p>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('blogPost.notFound')}</h2>
        <LLink to="/blog" className="btn-primary mt-4">{blogT.viewAll}</LLink>
      </div>
    )
  }

  const title = (lang !== 'uk' && post[`title_${lang}`]) ? post[`title_${lang}`] : post.title
  const content = (lang !== 'uk' && post[`content_${lang}`]) ? post[`content_${lang}`] : post.content
  const excerpt = (lang !== 'uk' && post[`excerpt_${lang}`]) ? post[`excerpt_${lang}`] : post.excerpt

  return (
    <>
      <SEO title={title} description={excerpt} image={post.image} type="article"
        article={{ author: post.author, datePublished: post.publishedAt || post.date }} />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-1.5 text-sm text-gray-500">
          <LLink to="/blog" className="hover:text-[var(--primary)] transition-colors flex items-center gap-1">
            <ArrowLeft size={13} /> {blogT.title}
          </LLink>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-64">{title}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full">
                {(lang !== 'uk' && post[`category_${lang}`]) ? post[`category_${lang}`] : post.category}
              </span>
            )}
            {post.publishedAt && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={11} /> {new Date(post.publishedAt).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight font-['Archivo',sans-serif]">{title}</h1>
          {excerpt && <p className="text-gray-500 text-lg mt-3 leading-relaxed">{excerpt}</p>}
        </div>

        {/* Cover image — реальні фото (виставки) заповнюють, фото товарів вписуємо без обрізки */}
        {post.image && (
          post.image.match(/\/images\/(blog|portfolio)\//) ? (
            <img src={post.image} alt={title} className="w-full h-64 md:h-80 object-cover rounded-2xl mb-8" />
          ) : (
            <div className="w-full h-64 md:h-80 rounded-2xl mb-8 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <img src={post.image} alt={title} className="max-h-full max-w-full object-contain p-4" />
            </div>
          )
        )}

        {/* Content */}
        <div className="card p-6 md:p-10">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {content?.split('\n').map((para, i) => {
              if (!para.trim()) return null
              if (para.startsWith('**') && para.endsWith('**')) {
                return <h3 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">{para.slice(2, -2)}</h3>
              }
              let formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              // [текст](url) → посилання (зовнішні відкриваємо у новій вкладці)
              // FIX 9 — only allow safe URL schemes; drop javascript:/data:/vbscript: etc.
              formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => {
                const safe = /^(https?:\/\/|mailto:|\/|#)/.test(url)
                if (!safe) return text
                const ext = /^https?:/.test(url)
                return `<a href="${url}" class="text-[var(--primary)] underline underline-offset-2 hover:opacity-80"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`
              })
              return <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: localizeHtml(formatted, lang) }} />
            })}
          </div>

          {post.links?.length > 0 && (
            <div className="mt-8 pt-5 border-t border-gray-100">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-gray-400 mb-2.5">{t('blogPost.equipmentFromArticle')}</div>
              <div className="flex flex-wrap gap-2">
                {post.links.map(l => l.ext ? (
                  <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-[var(--primary)] hover:text-white text-gray-700 text-xs font-medium rounded transition-colors">
                    {l.label} <ArrowUpRight size={12} />
                  </a>
                ) : (
                  <LLink key={l.label} to={l.url}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-[var(--primary)] hover:text-white text-gray-700 text-xs font-medium rounded transition-colors">
                    {l.label} <ChevronRight size={12} />
                  </LLink>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back + CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
          <LLink to="/blog" className="btn-secondary text-sm">
            <ArrowLeft size={14} /> {blogT.viewAll}
          </LLink>
          <LLink to="/contacts" className="btn-primary text-sm">
            {t('hero.ctaContact')} <ArrowRight size={14} />
          </LLink>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-bold text-xl mb-5">{t('blogPost.readAlso')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(p => {
                const rTitle = (lang !== 'uk' && p[`title_${lang}`]) ? p[`title_${lang}`] : p.title
                return (
                  <LLink key={p.id} to={`/blog/${p.slug}`} className="card card-hover block overflow-hidden">
                    {p.image && (
                      p.image.match(/\/images\/(blog|portfolio)\//)
                        ? <img src={p.image} alt={rTitle} className="w-full h-36 object-cover" />
                        : <div className="w-full h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"><img src={p.image} alt={rTitle} className="max-h-full max-w-full object-contain p-2" /></div>
                    )}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{rTitle}</h3>
                    </div>
                  </LLink>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
