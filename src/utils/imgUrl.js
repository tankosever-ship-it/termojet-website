const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export function imgUrl(src) {
  if (!src) return ''
  if (src.startsWith('http')) return src
  return base + src
}
