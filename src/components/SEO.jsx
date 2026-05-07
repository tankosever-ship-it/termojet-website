import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, image, canonical }) {
  const fullTitle = title ? `${title} | Termojet` : 'Termojet — Виробник обладнання для котелень'
  const desc = description || 'Termojet — провідний виробник насосних груп, колекторів, клапанів і систем для котелень. Власне виробництво в Києві з 2002 року.'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      {image && <meta property="og:image" content={image} />}
      {canonical && <link rel="canonical" href={canonical} />}
    </Helmet>
  )
}
