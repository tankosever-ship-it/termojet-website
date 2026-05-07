// Product catalog — populated via admin panel
// This is a static fallback with a few sample products
export const PRODUCTS = []

export function getProductUrl(product) {
  return `/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`
}
