import { motion } from 'framer-motion'
import { imgUrl } from '../utils/imgUrl'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }

export function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? 'var(--accent)' : '#d8d8d8', fontSize: 14 }}>★</span>
      ))}
    </div>
  )
}

export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function ReviewCard({ review }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-4 p-6"
      style={{ background: '#f7f7f6', border: '1px solid #e8e8e8' }}>
      <div className="flex items-center justify-between">
        <StarRating rating={review.rating} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#bbb', letterSpacing: '0.06em' }}>
          {review.date}
        </span>
      </div>
      <p className="text-sm leading-relaxed flex-1" style={{ color: '#444' }}>
        "{review.text}"
      </p>
      {review.photo && (
        <a href={imgUrl(review.photo)} target="_blank" rel="noreferrer" className="block">
          <img src={imgUrl(review.photo)} alt="" loading="lazy"
            className="w-full h-40 object-cover border border-[#e0e0e0]" />
        </a>
      )}
      <div className="pt-4 flex items-center gap-3" style={{ borderTop: '1px solid #e0e0e0' }}>
        <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
          style={{ background: 'var(--accent)' }}>
          {initials(review.name)}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[#1a1a1a] text-sm truncate">{review.name}</div>
          {review.role && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#888', marginTop: 2, letterSpacing: '0.04em' }} className="truncate">
              {review.role}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
