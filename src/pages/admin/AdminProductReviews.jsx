import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Star, Check, EyeOff, Package, ExternalLink } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { imgUrl } from '../../utils/imgUrl'

export default function AdminProductReviews() {
  const { productReviews, isAdminAuth, moderateProductReview, removeProductReview } = useApp()
  const navigate = useNavigate()

  if (!isAdminAuth) { navigate('/admin'); return null }

  const isPub = (r) => r.published === 1 || r.published === true
  const pending = productReviews.filter(r => !isPub(r)).length

  const productHref = (r) =>
    r.category_slug && r.product_slug ? `/catalog/${r.category_slug}/${r.product_slug}` : null

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--primary)] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <div>
            <div className="font-bold">Відгуки на товари</div>
            <div className="text-white/60 text-xs">{productReviews.length} відгуків{pending > 0 ? ` · ${pending} на модерації` : ''}</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {productReviews.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Star size={40} className="mx-auto mb-3 opacity-30" />
            <p>Відгуків на товари поки немає</p>
          </div>
        ) : (
          <div className="space-y-3">
            {productReviews.map(r => {
              const href = productHref(r)
              return (
                <div key={r.id} className={`card p-4 flex gap-4 ${isPub(r) ? '' : 'ring-1 ring-amber-300 bg-amber-50/40'}`}>
                  {r.photo ? (
                    <a href={imgUrl(r.photo)} target="_blank" rel="noreferrer" className="flex-shrink-0">
                      <img src={imgUrl(r.photo)} alt="" className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                    </a>
                  ) : (
                    <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[var(--primary)]">
                      {r.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {/* Товар, до якого відгук */}
                    <div className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-500">
                      <Package size={12} className="flex-shrink-0" />
                      {href ? (
                        <Link to={href} target="_blank" className="hover:text-[var(--primary)] inline-flex items-center gap-1 truncate">
                          <span className="truncate">{r.product_name || r.product_id}</span>
                          <ExternalLink size={11} className="flex-shrink-0" />
                        </Link>
                      ) : (
                        <span className="truncate">{r.product_name || r.product_id}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900">{r.name}</span>
                      {!isPub(r) && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-800">на модерації</span>}
                      <div className="flex ml-auto">
                        {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= (r.rating||5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{r.text}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {isPub(r) ? (
                      <button onClick={() => moderateProductReview(r.id, { ...r, published: false })}
                        title="Сховати" className="p-1.5 text-gray-400 hover:text-amber-600">
                        <EyeOff size={15} />
                      </button>
                    ) : (
                      <button onClick={() => moderateProductReview(r.id, { ...r, published: true })}
                        title="Схвалити" className="p-1.5 text-green-600 hover:text-green-700">
                        <Check size={16} />
                      </button>
                    )}
                    <button onClick={() => { if (confirm('Видалити?')) removeProductReview(r.id) }}
                      className="p-1.5 text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
