import { Helmet } from 'react-helmet-async'

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Termojet',
  url: 'https://termojet.com.ua',
  logo: 'https://termojet.com.ua/wp-content/uploads/2023/08/logo.svg',
  description: 'Виробник насосних груп, колекторів, клапанів та систем для котелень. Власне виробництво в Україні з 2002 року.',
  foundingDate: '2002',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'UA',
    addressLocality: 'Київ',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+380-44-XXX-XX-XX',
    contactType: 'customer service',
    availableLanguage: ['Ukrainian', 'English', 'Polish'],
  },
}

function buildProductSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
    brand: { '@type': 'Brand', name: 'Termojet' },
    offers: {
      '@type': 'Offer',
      price: product.price ? String(product.price) : undefined,
      priceCurrency: 'UAH',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Termojet' },
    },
  }
}

function buildBreadcrumbSchema(breadcrumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

export default function SEO({ title, description, image, canonical, type = 'website', product, breadcrumbs }) {
  const fullTitle = title ? `${title} | Termojet` : 'Termojet — Виробник обладнання для котелень'
  const desc = description || 'Termojet — провідний виробник насосних груп, колекторів, клапанів і систем для котелень. Власне виробництво в Києві з 2002 року.'

  const schemas = [ORGANIZATION_SCHEMA]

  if (type === 'product' && product) {
    schemas.push(buildProductSchema(product))
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(buildBreadcrumbSchema(breadcrumbs))
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      {image && <meta property="og:image" content={image} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
