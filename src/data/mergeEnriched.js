import { ENRICHED_PRODUCTS } from './products-enriched'

// Merge enriched data (description, specs, features, subcategory) into base products by SKU or slug match
export function mergeWithEnriched(products) {
  const bySkuMap = new Map()
  const bySlugMap = new Map()

  ENRICHED_PRODUCTS.forEach(ep => {
    if (ep.sku) bySkuMap.set(ep.sku.trim().toLowerCase(), ep)
    if (ep.id) bySlugMap.set(ep.id.trim().toLowerCase(), ep)
  })

  return products.map(p => {
    const skuKey = (p.sku || '').trim().toLowerCase()
    const slugKey = (p.slug || '').trim().toLowerCase()
    const match = bySkuMap.get(skuKey) || bySlugMap.get(slugKey)
    if (!match) return p

    return {
      ...p,
      description: p.description || match.description || '',
      shortDesc:   p.shortDesc  || match.description?.slice(0, 200) || '',
      specs:       Object.keys(p.specs || {}).length > 0 ? p.specs : (match.specs || {}),
      features:    p.features   || match.features || [],
      subcategory: p.subcategory || match.subcategory || '',
    }
  })
}
