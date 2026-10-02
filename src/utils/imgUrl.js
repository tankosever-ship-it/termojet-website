const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export function imgUrl(src) {
  if (!src) return ''
  if (src.startsWith('http')) return src
  return base + src
}

// ── Зменшені копії фото (backend/routes/img.js) ──────────────────────────────
// Ширини мають збігатися з WIDTHS на бекенді.
const RESIZE_WIDTHS = [160, 320, 480, 640, 960, 1280]
// На GitHub Pages (статичний дзеркальний білд) бекенду немає — віддаємо оригінали.
const CAN_RESIZE = base === ''

// Шлях фото, який уміє зменшувати бекенд, або null: wp-content нашого домену,
// /images/* і /uploads/* з public / адмінки. Чужі домени (Rozetka тощо) — як є.
function resizablePath(src) {
  if (!CAN_RESIZE || !src) return null
  const m = src.match(/^(?:https?:\/\/(?:www\.)?termojet\.com\.ua)?\/((?:wp-content\/uploads|images|uploads)\/[^?#]+\.(?:jpe?g|png|webp))$/i)
  if (!m) return null
  // Пробіли/кирилиця в імені файлу зламали б srcset (там пробіл і кома — роздільники).
  // Уже закодований шлях (%XX) лишаємо як є, щоб не закодувати двічі.
  return /%[0-9A-F]{2}/i.test(m[1]) ? m[1] : encodeURI(m[1])
}

// Одна копія конкретної ширини (мініатюри, де srcset зайвий)
export function sizedImg(src, width) {
  const p = resizablePath(src)
  return p ? `/img/${width}/${p}` : imgUrl(src)
}

// srcset для <img>: браузер сам обере найменшу ширину, якої досить екрану
// (разом із атрибутом sizes). undefined — якщо фото зменшувати не вміємо.
export function srcSet(src, maxWidth = 1280) {
  const p = resizablePath(src)
  if (!p) return undefined
  return RESIZE_WIDTHS.filter(w => w <= maxWidth).map(w => `/img/${w}/${p} ${w}w`).join(', ')
}
