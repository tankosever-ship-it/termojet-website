// Редагований контент сторінки «Про нас» (секція виробництва: тексти, відео, фото).
// Зберігається як JSON у settings.aboutContent; AboutPage і головна читають через mergeAboutContent.
import { assetPath } from '../utils/assetPath'

const WP = 'https://termojet.com.ua/wp-content/uploads/2024/04'
const wp = (n) => `${WP}/photo_2024-04-05_${n}.jpg`

// Старі фото цеху (квітень 2024) — тепер усі з підписами; home: показувати й на головній
const LEGACY_PHOTOS = [
  { url: wp('18-34-39'), caption: 'Лазерне різання' },
  { url: wp('18-34-32'), caption: 'Складання вузлів' },
  { url: wp('18-34-36'), caption: 'Лінія порошкового фарбування', home: true },
  { url: wp('18-34-26'), caption: 'Лінія порошкового фарбування', home: true },
  { url: wp('18-34-29'), caption: 'Листогин' },
  { url: wp('18-34-22'), caption: 'Лазерний верстат' },
  { url: wp('18-34-19'), caption: 'Лінія порошкового фарбування' },
  { url: wp('18-34-15'), caption: 'Цех фарбування' },
  { url: wp('18-34-12'), caption: 'Листогинне виробництво' },
  { url: wp('18-34-09'), caption: 'Лазерний верстат', home: true },
  { url: wp('18-33-55'), caption: 'Пакування' },
  { url: wp('18-33-49'), caption: 'Готові насосні групи' },
  { url: wp('18-34-04'), caption: 'Готові вироби' },
]

// Старе відео цеху (було тут раніше) — повертаємо як третє відео
export const LEGACY_VIDEO = `${WP}/0-02-05-973ce8523dda389f497460d406b3d1195952436349faf993e798fb4d3b5d0980_7323ef3df1f7be93.mp4`

// Джерело зображення: зовнішні URL віддаємо як є, локальні — через assetPath
export const mediaSrc = (url) => !url ? '' : (String(url).startsWith('http') ? url : assetPath(url))

export const ABOUT_DEFAULTS = {
  // Секція виробництва
  manufEyebrow: 'ВИРОБНИЧИЙ ЦЕХ · КИЇВ',
  manufTitle: 'Від листа сталі —\nдо готового виробу',
  manufSubtitle: 'Весь виробничий цикл під одним дахом: лазерне різання, зварювання, порошкове фарбування та контроль якості',

  // Відео (3 шт. у секції «Про нас»)
  oldVideo: LEGACY_VIDEO,                            // старе відео цеху (повернуте)
  localVideo: '/about-factory.mp4',                 // власне відео цеху (mp4)
  youtubeUrl: 'https://youtu.be/PKEpr4Zg4ks',       // оглядове відео (YouTube)

  // Фотогалерея. home: true — фото також показується на головній «Від листа сталі».
  // Спершу нові фото верстатів (усі на головній), далі старі знімки цеху.
  photos: [
    { url: '/factory/lazernyy-lystoriz.jpg',     caption: 'Лазерний листоріз',                 home: true },
    { url: '/factory/lazernyy-truboriz.jpg',     caption: 'Лазерний труборіз',                 home: true },
    { url: '/factory/valtsyuvalnyy-verstat.jpg', caption: 'Вальцювальний верстат',             home: true },
    { url: '/factory/lystohynnyy-verstat.jpg',   caption: 'Листогинний верстат',               home: true },
    { url: '/factory/tokarnyy-verstat-chpu.jpg', caption: 'Автоматичний токарний верстат з ЧПУ', home: true },
    ...LEGACY_PHOTOS,
  ],
}

export function mergeAboutContent(override) {
  if (!override || typeof override !== 'object') return ABOUT_DEFAULTS
  const out = { ...ABOUT_DEFAULTS, ...override }
  // photos: якщо override має масив — беремо його (повна заміна), інакше дефолт
  out.photos = Array.isArray(override.photos) ? override.photos : ABOUT_DEFAULTS.photos
  return out
}

// Витягти YouTube video id з різних форматів посилання
export function youtubeId(url) {
  if (!url) return ''
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return m ? m[1] : ''
}
