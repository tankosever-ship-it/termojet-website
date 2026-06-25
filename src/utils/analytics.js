// GA4 ecommerce events → dataLayer (для GTM, контейнер GTM-P9DW9P6D).
// Формат за ТЗ: спершу скидаємо ecommerce (null), потім пушимо подію.
import { CATEGORIES } from '../data/categories'

const CAT_NAME = Object.fromEntries(
  (CATEGORIES || []).map(c => [c.slug, (c.name && (c.name.uk || c.name)) || c.slug])
)

function categoryName(slug) {
  return CAT_NAME[slug] || slug || ''
}

function pushEcommerce(event, ecommerce) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ ecommerce: null }) // скидання попереднього стану
  window.dataLayer.push({ event, ecommerce })
}

// Будує об'єкт item за товаром/позицією кошика. qty=null → без quantity (view_item).
function buildItem(p, qty) {
  const item = {
    item_name: p.name,
    item_id: p.sku || p.id,
    price: Number(p.price) || 0,
    item_brand: 'Termojet',
    item_category: categoryName(p.categorySlug),
  }
  if (p.subcategory) item.item_category2 = p.subcategory
  if (qty != null) item.quantity = qty
  return item
}

export function trackViewItem(product) {
  pushEcommerce('view_item', { items: [buildItem(product, null)] })
}

export function trackAddToCart(product, quantity = 1) {
  pushEcommerce('add_to_cart', { items: [buildItem(product, quantity)] })
}

export function trackRemoveFromCart(item, quantity) {
  pushEcommerce('remove_from_cart', { items: [buildItem(item, quantity ?? item.quantity ?? 1)] })
}

export function trackBeginCheckout(cartItems) {
  pushEcommerce('begin_checkout', {
    items: (cartItems || []).map(i => buildItem(i, i.quantity || 1)),
  })
}

// order: { id, items (cart), total, affiliation }
export function trackPurchase(order) {
  pushEcommerce('purchase', {
    transaction_id: String(order.id),
    affiliation: order.affiliation || 'cart',
    value: Number(order.total) || 0,
    tax: '0',
    shipping: '0',
    currency: 'UAH',
    items: (order.items || []).map(i => buildItem(i, i.quantity || 1)),
  })
}
