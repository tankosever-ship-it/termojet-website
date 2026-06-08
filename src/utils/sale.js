// Логіка акційної ціни товару.
// Товар «в акції», якщо salePrice > 0 і менший за звичайну ціну.
// Категорія-«кошик» акційних товарів (наявна категорія розпродажу)
export const SALE_CATEGORY_SLUG = 'rozprodazh'

export function isOnSale(p) {
  if (!p) return false
  const sale = parseFloat(p.salePrice)
  const base = parseFloat(p.price)
  return sale > 0 && (!base || sale < base)
}

// Ефективна ціна для кошика/замовлення (акційна, якщо є)
export function effectivePrice(p) {
  return isOnSale(p) ? parseFloat(p.salePrice) : p.price
}
