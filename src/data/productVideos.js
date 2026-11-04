// Відео товару: правила — у product-videos.json (той самий файл читає backend/server.js для JSON-LD)
import CONFIG from './product-videos.json'

const compiled = CONFIG.videos.map(v => ({
  ...v,
  re: v.match ? new RegExp(v.match, 'i') : null,
  notRe: v.not ? new RegExp(v.not, 'i') : null,
}))

// name — українська назва товару: правила не залежать від мови сторінки
export function getVideosForProduct(categorySlug, name = '', sku = '') {
  const hay = `${name} ${sku}`
  return compiled.filter(v =>
    (!v.cats || v.cats.includes(categorySlug)) &&
    (!v.re || v.re.test(hay)) &&
    (!v.notRe || !v.notRe.test(hay)))
}
