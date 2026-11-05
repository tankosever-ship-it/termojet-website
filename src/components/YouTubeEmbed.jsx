import { useState } from 'react'
import { Play } from 'lucide-react'

// Відео з YouTube у блозі / «Про нас»: до кліку лише постер, плеєр (youtube-nocookie)
// вантажиться на вимогу — сторінка не тягне скриптів YouTube, поки відео не запустили.
export default function YouTubeEmbed({ id, title, className = '' }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className={`relative aspect-video overflow-hidden rounded-xl bg-black ${className}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`YouTube: ${title}`}
          className="group absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-black">
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async"
            className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-[0_6px_24px_rgba(0,0,0,.35)] transition-transform group-hover:scale-110">
            <Play size={28} fill="currentColor" style={{ marginLeft: 3 }} />
          </span>
        </button>
      )}
    </div>
  )
}

// Ідентифікатор відео з youtu.be/…, youtube.com/watch?v=…, /embed/…, /shorts/… або «голий» id
export function ytIdFrom(url) {
  const s = String(url || '').trim()
  if (/^[\w-]{11}$/.test(s)) return s
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/)
  return m ? m[1] : null
}
