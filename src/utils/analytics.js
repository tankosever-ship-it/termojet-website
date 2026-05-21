// GA4 tracking ID (placeholder - replace with real ID from Google Analytics)
const GA_ID = 'G-XXXXXXXXXX'

function gtag(...args) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag(...args)
}

/**
 * Track product detail page view (view_item event)
 */
export function trackViewItem(product) {
  gtag('event', 'view_item', {
    currency: 'UAH',
    value: Number(product.price) || 0,
    items: [
      {
        item_id: product.sku || product.id,
        item_name: product.name,
        price: Number(product.price) || 0,
        item_brand: 'Termojet',
        item_category: product.categorySlug,
      },
    ],
  })
}

/**
 * Track add to cart action
 */
export function trackAddToCart(product, quantity = 1) {
  gtag('event', 'add_to_cart', {
    currency: 'UAH',
    value: (Number(product.price) || 0) * quantity,
    items: [
      {
        item_id: product.sku || product.id,
        item_name: product.name,
        price: Number(product.price) || 0,
        quantity,
        item_brand: 'Termojet',
        item_category: product.categorySlug,
      },
    ],
  })
}

/**
 * Track cart view (view_cart event)
 * @param {Array} cartItems - array of cart items with product and qty
 */
export function trackViewCart(cartItems) {
  const items = cartItems.map(item => ({
    item_id: item.sku || item.id,
    item_name: item.name,
    price: Number(item.price) || 0,
    quantity: item.qty || 1,
    item_brand: 'Termojet',
    item_category: item.categorySlug,
  }))

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  gtag('event', 'view_cart', {
    currency: 'UAH',
    value: total,
    items,
  })
}

/**
 * Track begin checkout
 * @param {Array} cartItems - array of cart items
 * @param {number} total - total cart value
 */
export function trackBeginCheckout(cartItems, total) {
  const items = cartItems.map(item => ({
    item_id: item.sku || item.id,
    item_name: item.name,
    price: Number(item.price) || 0,
    quantity: item.qty || 1,
    item_brand: 'Termojet',
    item_category: item.categorySlug,
  }))

  gtag('event', 'begin_checkout', {
    currency: 'UAH',
    value: Number(total) || 0,
    items,
  })
}

/**
 * Track successful purchase
 * @param {string} orderId - unique order ID
 * @param {Array} cartItems - array of cart items
 * @param {number} total - total order value
 */
export function trackPurchase(orderId, cartItems, total) {
  const items = cartItems.map(item => ({
    item_id: item.sku || item.id,
    item_name: item.name,
    price: Number(item.price) || 0,
    quantity: item.qty || 1,
    item_brand: 'Termojet',
    item_category: item.categorySlug,
  }))

  gtag('event', 'purchase', {
    transaction_id: orderId,
    currency: 'UAH',
    value: Number(total) || 0,
    items,
  })
}

export { GA_ID }
