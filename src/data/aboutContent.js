// Редагований контент сторінки «Про нас» (секція виробництва: тексти, відео, фото).
// Зберігається як JSON у settings.aboutContent; AboutPage і головна читають через mergeAboutContent.
import { assetPath } from '../utils/assetPath'

const WP = 'https://termojet.com.ua/wp-content/uploads/2024/04'

// Старі фото цеху (квітень 2024) — без підписів, лишаються в галереї «Про нас»
const LEGACY_PHOTOS = [
  'photo_2024-04-05_18-34-39', 'photo_2024-04-05_18-34-32', 'photo_2024-04-05_18-34-36',
  'photo_2024-04-05_18-34-26', 'photo_2024-04-05_18-34-29', 'photo_2024-04-05_18-34-22',
  'photo_2024-04-05_18-34-19', 'photo_2024-04-05_18-34-15', 'photo_2024-04-05_18-34-12',
  'photo_2024-04-05_18-34-09', 'photo_2024-04-05_18-33-55', 'photo_2024-04-05_18-33-49',
  'photo_2024-04-05_18-34-04',
].map(n => ({ url: `${WP}/${n}.jpg`, caption: '' }))

// Джерело зображення: зовнішні URL віддаємо як є, локальні — через assetPath
export const mediaSrc = (url) => !url ? '' : (String(url).startsWith('http') ? url : assetPath(url))

export const ABOUT_DEFAULTS = {
  // Секція виробництва
  manufEyebrow: 'ВИРОБНИЧИЙ ЦЕХ · КИЇВ',
  manufTitle: 'Від листа сталі —\nдо готового виробу',
  manufSubtitle: 'Весь виробничий цикл під одним дахом: лазерне різання, зварювання, порошкове фарбування та контроль якості',

  // Відео
  localVideo: '/about-factory.mp4',                 // власне відео цеху (mp4)
  youtubeUrl: 'https://youtu.be/PKEpr4Zg4ks',       // оглядове відео (YouTube)

  // Фотогалерея: спершу нові фото верстатів з підписами (вони ж — на головній),
  // далі старі знімки цеху без підписів (лише в галереї «Про нас»)
  photos: [
    { url: '/factory/lazernyy-lystoriz.jpg',    caption: 'Лазерний листоріз' },
    { url: '/factory/lazernyy-truboriz.jpg',    caption: 'Лазерний труборіз' },
    { url: '/factory/valtsyuvalnyy-verstat.jpg', caption: 'Вальцювальний верстат' },
    { url: '/factory/lystohynnyy-verstat.jpg',  caption: 'Листогинний верстат' },
    { url: '/factory/tokarnyy-verstat-chpu.jpg', caption: 'Автоматичний токарний верстат з ЧПУ' },
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
