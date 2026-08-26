// Редагований контент сторінки «Про нас» (секція виробництва: тексти, відео, фото).
// Зберігається як JSON у settings.aboutContent; AboutPage і головна читають через mergeAboutContent.
import { assetPath } from '../utils/assetPath'

const WP = 'https://termojet.com.ua/wp-content/uploads/2024/04'
const wp = (n) => `${WP}/photo_2024-04-05_${n}.jpg`

// Старе відео цеху (було тут раніше) — повертаємо як третє відео
export const LEGACY_VIDEO = `${WP}/0-02-05-973ce8523dda389f497460d406b3d1195952436349faf993e798fb4d3b5d0980_7323ef3df1f7be93.mp4`

// Джерело зображення: зовнішні URL віддаємо як є, локальні — через assetPath
export const mediaSrc = (url) => !url ? '' : (String(url).startsWith('http') ? url : assetPath(url))

// ---------------------------------------------------------------------------
// Текстовий контент — усі 5 мов
// ---------------------------------------------------------------------------
export const ABOUT_CONTENT = {
  uk: {
    manufEyebrow: 'ВИРОБНИЧИЙ ЦЕХ · КИЇВ',
    manufTitle: 'Від листа сталі —\nдо готового виробу',
    manufSubtitle: 'Весь виробничий цикл під одним дахом: лазерне різання, зварювання, порошкове фарбування та контроль якості',
  },
  en: {
    manufEyebrow: 'PRODUCTION FACILITY · KYIV',
    manufTitle: 'From a sheet of steel —\nto a finished product',
    manufSubtitle: 'The entire production cycle under one roof: laser cutting, welding, powder coating and quality control',
  },
  pl: {
    manufEyebrow: 'ZAKŁAD PRODUKCYJNY · KIJÓW',
    manufTitle: 'Od arkusza stali —\ndo gotowego wyrobu',
    manufSubtitle: 'Pełny cykl produkcyjny pod jednym dachem: cięcie laserowe, spawanie, malowanie proszkowe i kontrola jakości',
  },
  fr: {
    manufEyebrow: 'ATELIER DE PRODUCTION · KYIV',
    manufTitle: "D'une tôle d'acier —\nau produit fini",
    manufSubtitle: "L'intégralité du cycle de production sous un même toit : découpe laser, soudage, peinture en poudre et contrôle qualité",
  },
  de: {
    manufEyebrow: 'PRODUKTIONSHALLE · KYJIW',
    manufTitle: 'Vom Stahlblech —\nzum fertigen Produkt',
    manufSubtitle: 'Der gesamte Produktionszyklus unter einem Dach: Laserschneiden, Schweißen, Pulverbeschichtung und Qualitätskontrolle',
  },
  ro: {
    manufEyebrow: 'UNITATE DE PRODUCȚIE · KYIV',
    manufTitle: 'De la o foaie de oțel —\nla un produs finit',
    manufSubtitle: 'Întregul ciclu de producție sub un singur acoperiș: tăiere laser, sudură, vopsire electrostatică și control al calității',
  },
}

// ---------------------------------------------------------------------------
// Фотогалерея — підписи у всіх 5 мовах
// caption: { uk, en, pl, fr, de }
// ---------------------------------------------------------------------------

// Старі фото цеху (квітень 2024)
const LEGACY_PHOTOS = [
  {
    url: wp('18-34-39'),
    caption: {
      uk: 'Лазерне різання',
      en: 'Laser cutting',
      pl: 'Cięcie laserowe',
      fr: 'Découpe laser',
      de: 'Laserschneiden',
      ro: 'Tăiere laser',
    },
  },
  {
    url: wp('18-34-32'),
    caption: {
      uk: 'Складання вузлів',
      en: 'Assembly of components',
      pl: 'Montaż podzespołów',
      fr: 'Assemblage des composants',
      de: 'Baugruppenmontage',
      ro: 'Asamblarea subansamblurilor',
    },
  },
  {
    url: wp('18-34-36'),
    home: true,
    caption: {
      uk: 'Лінія порошкового фарбування',
      en: 'Powder coating line',
      pl: 'Linia malowania proszkowego',
      fr: 'Ligne de peinture en poudre',
      de: 'Pulverbeschichtungslinie',
      ro: 'Linie de vopsire electrostatică',
    },
  },
  {
    url: wp('18-34-26'),
    home: true,
    caption: {
      uk: 'Лінія порошкового фарбування',
      en: 'Powder coating line',
      pl: 'Linia malowania proszkowego',
      fr: 'Ligne de peinture en poudre',
      de: 'Pulverbeschichtungslinie',
      ro: 'Linie de vopsire electrostatică',
    },
  },
  {
    url: wp('18-34-29'),
    caption: {
      uk: 'Листогин',
      en: 'Sheet bending machine',
      pl: 'Giętarka blach',
      fr: 'Plieuse de tôle',
      de: 'Blechbiegemaschine',
      ro: 'Mașină de îndoit tablă',
    },
  },
  {
    url: wp('18-34-22'),
    caption: {
      uk: 'Лазерний верстат',
      en: 'Laser machine',
      pl: 'Maszyna laserowa',
      fr: 'Machine laser',
      de: 'Lasermaschine',
      ro: 'Mașină laser',
    },
  },
  {
    url: wp('18-34-19'),
    caption: {
      uk: 'Лінія порошкового фарбування',
      en: 'Powder coating line',
      pl: 'Linia malowania proszkowego',
      fr: 'Ligne de peinture en poudre',
      de: 'Pulverbeschichtungslinie',
      ro: 'Linie de vopsire electrostatică',
    },
  },
  {
    url: wp('18-34-15'),
    caption: {
      uk: 'Цех фарбування',
      en: 'Painting shop',
      pl: 'Lakiernia',
      fr: 'Atelier de peinture',
      de: 'Lackiererei',
      ro: 'Atelier de vopsire',
    },
  },
  {
    url: wp('18-34-12'),
    caption: {
      uk: 'Листогинне виробництво',
      en: 'Sheet metal bending production',
      pl: 'Produkcja gięcia blach',
      fr: 'Production de pliage de tôle',
      de: 'Blechbiegeproduktion',
      ro: 'Producție de îndoire a tablei',
    },
  },
  {
    url: wp('18-34-09'),
    home: true,
    caption: {
      uk: 'Лазерний верстат',
      en: 'Laser machine',
      pl: 'Maszyna laserowa',
      fr: 'Machine laser',
      de: 'Lasermaschine',
      ro: 'Mașină laser',
    },
  },
  {
    url: wp('18-33-55'),
    caption: {
      uk: 'Пакування',
      en: 'Packaging',
      pl: 'Pakowanie',
      fr: 'Emballage',
      de: 'Verpackung',
      ro: 'Ambalare',
    },
  },
  {
    url: wp('18-33-49'),
    caption: {
      uk: 'Готові насосні групи',
      en: 'Finished pump groups',
      pl: 'Gotowe grupy pompowe',
      fr: 'Groupes de pompes finis',
      de: 'Fertige Pumpengruppen',
      ro: 'Grupuri de pompare finite',
    },
  },
  {
    url: wp('18-34-04'),
    caption: {
      uk: 'Готові вироби',
      en: 'Finished products',
      pl: 'Gotowe wyroby',
      fr: 'Produits finis',
      de: 'Fertige Produkte',
      ro: 'Produse finite',
    },
  },
]

// Нові фото верстатів (усі на головній)
const NEW_PHOTOS = [
  {
    url: '/factory/lazernyy-lystoriz.jpg',
    home: true,
    caption: {
      uk: 'Лазерний листоріз',
      en: 'Laser sheet cutter',
      pl: 'Laserowa gilotyna do blach',
      fr: 'Découpeur laser de tôle',
      de: 'Laser-Blechschneider',
      ro: 'Mașină laser de tăiat tablă',
    },
  },
  {
    url: '/factory/lazernyy-truboriz.jpg',
    home: true,
    caption: {
      uk: 'Лазерний труборіз',
      en: 'Laser tube cutter',
      pl: 'Laserowa przecinarka do rur',
      fr: 'Découpeur laser de tubes',
      de: 'Laser-Rohrschneider',
      ro: 'Mașină laser de tăiat țevi',
    },
  },
  {
    url: '/factory/valtsyuvalnyy-verstat.jpg',
    home: true,
    caption: {
      uk: 'Вальцювальний верстат',
      en: 'Roll bending machine',
      pl: 'Walcarka',
      fr: 'Rouleuse',
      de: 'Walzmaschine',
      ro: 'Mașină de rulat tablă',
    },
  },
  {
    url: '/factory/lystohynnyy-verstat.jpg',
    home: true,
    caption: {
      uk: 'Листогинний верстат',
      en: 'Sheet bending machine',
      pl: 'Giętarka blach',
      fr: 'Plieuse de tôle',
      de: 'Blechbiegemaschine',
      ro: 'Mașină de îndoit tablă',
    },
  },
  {
    url: '/factory/tokarnyy-verstat-chpu.jpg',
    home: true,
    caption: {
      uk: 'Автоматичний токарний верстат з ЧПУ',
      en: 'Automatic CNC lathe',
      pl: 'Automatyczna tokarka CNC',
      fr: 'Tour CNC automatique',
      de: 'Automatische CNC-Drehmaschine',
      ro: 'Strung automat CNC',
    },
  },
]

// Повний масив фото з багатомовними підписами
const ALL_PHOTOS = [...NEW_PHOTOS, ...LEGACY_PHOTOS]

// Медіа-ресурси — однакові для всіх мов
const MEDIA = {
  oldVideo: LEGACY_VIDEO,
  localVideo: '/about-factory.mp4',
  youtubeUrl: 'https://youtu.be/PKEpr4Zg4ks',
}

// ---------------------------------------------------------------------------
// mergeAboutContent — мовно-свідома функція злиття
// ---------------------------------------------------------------------------
export function mergeAboutContent(override, lang = 'uk') {
  const text = ABOUT_CONTENT[lang] || ABOUT_CONTENT.uk

  // Розв'язуємо підписи до рядків для вибраної мови
  const resolvedPhotos = ALL_PHOTOS.map((photo) => ({
    ...photo,
    caption: typeof photo.caption === 'object'
      ? (photo.caption[lang] || photo.caption.uk)
      : photo.caption,
  }))

  const base = {
    ...text,
    ...MEDIA,
    photos: resolvedPhotos,
  }

  // Override застосовується лише для uk (адмін-панель зберігає тільки uk-контент)
  if (lang === 'uk' && override && typeof override === 'object') {
    const out = { ...base, ...override }
    out.photos = Array.isArray(override.photos) ? override.photos : resolvedPhotos
    return out
  }

  return base
}

// Зворотно сумісний псевдонім — форма об'єкта збігається з колишнім ABOUT_DEFAULTS
export const ABOUT_DEFAULTS = mergeAboutContent(null, 'uk')

// Витягти YouTube video id з різних форматів посилання
export function youtubeId(url) {
  if (!url) return ''
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return m ? m[1] : ''
}
