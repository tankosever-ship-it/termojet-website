import { useState } from 'react'
import LLink from '../components/LLink'
import { Calendar, ArrowRight, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/useT'
import SEO from '../components/SEO'
import PageHero from '../components/PageHero'

export default function BlogPage() {
  const { blog, lang } = useApp()
  const t = useT()
  const blogT = t('blog')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const published = blog.filter(p => p.published)
    .slice().sort((a, b) => new Date(b.publishedAt || b.date) - new Date(a.publishedAt || a.date))
  const categories = [...new Set(published.map(p => p.category).filter(Boolean))]
  const categoryLabels = Object.fromEntries(
    categories.map(c => {
      const post = published.find(p => p.category === c)
      const label = (lang !== 'uk' && post?.[`category_${lang}`]) ? post[`category_${lang}`] : c
      return [c, label]
    })
  )

  const filtered = published.filter(p => {
    const title = (lang !== 'uk' && p[`title_${lang}`]) ? p[`title_${lang}`] : p.title
    const matchSearch = !search || title?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !category || p.category === category
    return matchSearch && matchCat
  })

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <>
      <SEO title={blogT.title} description={blogT.subtitle} />

      <PageHero
        eyebrow="БЛОГ · TERMOJET"
        title={blogT.title}
        subtitle={blogT.subtitle}
        image="/banner-blog.webp"
      />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('blog.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-white" />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setCategory('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!category ? 'bg-[var(--primary)] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--primary)]'}`}>
                {t('blog.allCategories')}
              </button>
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c === category ? '' : c)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === c ? 'bg-[var(--primary)] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--primary)]'}`}>
                  {categoryLabels[c]}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-lg font-medium mb-1">{t('blog.emptyHeading')}</p>
            <p className="text-sm">{t('blog.emptySubtext')}</p>
          </div>
        ) : (
          <>
            {featured && !search && !category && (
              <LLink to={`/blog/${featured.slug}`} className="card card-hover block overflow-hidden mb-8 md:flex">
                {featured.image && (
                  featured.image.match(/\/images\/(blog|portfolio)\//) ? (
                    <img src={featured.image} alt={featured.title} className="w-full md:w-80 lg:w-96 h-56 md:h-auto object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-full md:w-80 lg:w-96 h-56 md:h-auto flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                      <img src={featured.image} alt={featured.title} className="max-h-52 md:max-h-72 max-w-full object-contain" />
                    </div>
                  )
                )}
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    {featured.category && <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">{(lang !== 'uk' && featured[`category_${lang}`]) ? featured[`category_${lang}`] : featured.category}</span>}
                    {featured.publishedAt && (
                      <span className="text-xs text-gray-400 flex items-center gap-1 ml-2">
                        <Calendar size={11} /> {new Date(featured.publishedAt).toLocaleDateString('uk-UA')}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {(lang !== 'uk' && featured[`title_${lang}`]) ? featured[`title_${lang}`] : featured.title}
                  </h2>
                  <p className="text-gray-500 mb-4 line-clamp-3">
                    {(lang !== 'uk' && featured[`excerpt_${lang}`]) ? featured[`excerpt_${lang}`] : featured.excerpt}
                  </p>
                  <span className="text-sm text-[var(--primary)] font-medium flex items-center gap-1">
                    {blogT.readMore} <ArrowRight size={13} />
                  </span>
                </div>
              </LLink>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(search || category ? filtered : rest).map(post => {
                const title = (lang !== 'uk' && post[`title_${lang}`]) ? post[`title_${lang}`] : post.title
                const excerpt = (lang !== 'uk' && post[`excerpt_${lang}`]) ? post[`excerpt_${lang}`] : post.excerpt
                return (
                  <LLink key={post.id} to={`/blog/${post.slug}`} className="card card-hover block overflow-hidden">
                    {post.image && (
                      post.image.match(/\/images\/(blog|portfolio)\//)
                        ? <img src={post.image} alt={title} className="w-full h-44 object-cover" />
                        : <div className="w-full h-44 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"><img src={post.image} alt={title} className="max-h-full max-w-full object-contain p-3" /></div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {post.category && <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">{(lang !== 'uk' && post[`category_${lang}`]) ? post[`category_${lang}`] : post.category}</span>}
                        {post.publishedAt && (
                          <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                            <Calendar size={11} /> {new Date(post.publishedAt).toLocaleDateString('uk-UA')}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{excerpt}</p>
                      <div className="mt-3 text-sm text-[var(--primary)] font-medium flex items-center gap-1">
                        {blogT.readMore} <ArrowRight size={12} />
                      </div>
                    </div>
                  </LLink>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}
