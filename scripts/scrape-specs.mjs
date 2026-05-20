import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const productsPath = path.join(__dirname, '../src/data/products.js')

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchPage(res.headers.location).then(resolve).catch(reject)
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

function parseSpecs(html) {
  const specs = {}
  // Parse tablepress table
  const tableMatch = html.match(/<table[^>]*class="tablepress[^"]*"[^>]*>([\s\S]*?)<\/table>/i)
  if (!tableMatch) return specs

  const rows = tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)
  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
    if (cells.length >= 2) {
      const key = cells[0][1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#8243;/g, '″').replace(/&amp;/g, '&').trim()
      const val = cells[1][1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#8243;/g, '″').replace(/&amp;/g, '&').trim()
      if (key && val) specs[key] = val
    }
  }
  return specs
}

function parseDescription(html) {
  // Extract short description from product summary
  const match = html.match(/class="woocommerce-product-details__short-description"[^>]*>([\s\S]*?)<\/div>/i)
  if (match) {
    return match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 500)
  }
  // Fallback: first paragraph in product description
  const descMatch = html.match(/class="woocommerce-Tabs-panel--description[^"]*"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/i)
  if (descMatch) {
    return descMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 500)
  }
  return ''
}

async function main() {
  const src = fs.readFileSync(productsPath, 'utf-8')
  // Extract the array content
  const match = src.match(/export const PRODUCTS = (\[[\s\S]*\])/)
  if (!match) { console.error('Cannot parse products.js'); process.exit(1) }

  const products = JSON.parse(match[1])
  const toScrape = products.filter(p => !p.specs || Object.keys(p.specs).length === 0)
  console.log(`Потрібно спарсити: ${toScrape.length} товарів`)

  let success = 0, failed = 0, noSpecs = 0
  const errors = []

  for (let i = 0; i < toScrape.length; i++) {
    const p = toScrape[i]
    const url = `https://termojet.com.ua/product/${p.slug}/`
    process.stdout.write(`[${i + 1}/${toScrape.length}] ${p.name.slice(0, 50)}... `)

    try {
      const html = await fetchPage(url)
      const specs = parseSpecs(html)
      const desc = parseDescription(html)

      // Find and update product in array
      const idx = products.findIndex(x => x.id === p.id)
      if (Object.keys(specs).length > 0) {
        products[idx].specs = specs
        success++
        console.log(`OK (${Object.keys(specs).length} specs)`)
      } else {
        noSpecs++
        console.log('нема таблиці')
      }
      if (desc && !products[idx].shortDesc) {
        products[idx].shortDesc = desc
      }
    } catch (e) {
      failed++
      errors.push({ slug: p.slug, error: e.message })
      console.log(`ПОМИЛКА: ${e.message}`)
    }

    // Delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300))

    // Save progress every 20 products
    if ((i + 1) % 20 === 0) {
      const newSrc = src.replace(/export const PRODUCTS = \[[\s\S]*\]/, `export const PRODUCTS = ${JSON.stringify(products, null, 2)}`)
      fs.writeFileSync(productsPath, newSrc)
      console.log(`--- Збережено проміжний результат (${i + 1}/${toScrape.length}) ---`)
    }
  }

  // Final save
  const header = `// Auto-generated from WooCommerce export — termojet.com.ua\n// ${products.length} products across 13 categories\n`
  const newSrc = header + `export const PRODUCTS = ${JSON.stringify(products, null, 2)}\n`
  fs.writeFileSync(productsPath, newSrc)

  console.log(`\n=== Готово ===`)
  console.log(`Успішно: ${success}`)
  console.log(`Без таблиці specs: ${noSpecs}`)
  console.log(`Помилки: ${failed}`)
  if (errors.length > 0) {
    console.log('\nПомилки:')
    errors.forEach(e => console.log(`  ${e.slug}: ${e.error}`))
  }
}

main()
