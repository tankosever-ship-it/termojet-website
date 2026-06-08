import { formatPrice } from '../utils/currency'
import { isOnSale } from '../utils/sale'

// Уніфікований показ ціни товару: акційна (помаранчева) + закреслена стара, або звичайна.
export default function ProductPrice({ product, eurRate, size = 'base' }) {
  const big = size === 'lg'
  if (!(product.price > 0)) {
    return <span className="text-xs text-gray-400 italic">Ціна по запиту</span>
  }
  if (isOnSale(product)) {
    return (
      <span className="inline-flex items-baseline gap-2">
        <span className={`font-bold text-[var(--accent)] ${big ? 'text-2xl' : 'text-base'}`}>
          {formatPrice(product.salePrice, product.currency, eurRate)}
        </span>
        <span className={`text-gray-400 line-through ${big ? 'text-base' : 'text-xs'}`}>
          {formatPrice(product.price, product.currency, eurRate)}
        </span>
      </span>
    )
  }
  return (
    <span className={`font-bold text-[var(--primary)] ${big ? 'text-2xl' : 'text-base'}`}>
      {formatPrice(product.price, product.currency, eurRate)}
    </span>
  )
}
