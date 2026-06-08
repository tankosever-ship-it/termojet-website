// Редагований контент сторінки «Про нас» (секція виробництва: тексти, відео, фото).
// Зберігається як JSON у settings.aboutContent; AboutPage і головна читають через mergeAboutContent.

export const ABOUT_DEFAULTS = {
  // Секція виробництва
  manufEyebrow: 'ВИРОБНИЧИЙ ЦЕХ · КИЇВ',
  manufTitle: 'Від листа сталі —\nдо готового виробу',
  manufSubtitle: 'Весь виробничий цикл під одним дахом: лазерне різання, зварювання, порошкове фарбування та контроль якості',

  // Відео
  localVideo: '/about-factory.mp4',                 // власне відео цеху (mp4)
  youtubeUrl: 'https://youtu.be/PKEpr4Zg4ks',       // оглядове відео (YouTube)

  // Фотогалерея верстатів (url + підпис)
  photos: [
    { url: '/factory/lazernyy-lystoriz.jpg',    caption: 'Лазерний листоріз' },
    { url: '/factory/lazernyy-truboriz.jpg',    caption: 'Лазерний труборіз' },
    { url: '/factory/valtsyuvalnyy-verstat.jpg', caption: 'Вальцювальний верстат' },
    { url: '/factory/lystohynnyy-verstat.jpg',  caption: 'Листогинний верстат' },
    { url: '/factory/tokarnyy-verstat-chpu.jpg', caption: 'Автоматичний токарний верстат з ЧПУ' },
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
