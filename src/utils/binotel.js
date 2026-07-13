// Binotel call-tracking (наскрізна аналітика): підміна номерів телефонів.
//
// Віджет вантажиться через GTM (GTM-P9DW9P6D) і сканує верстку ОДИН раз при
// завантаженні. Але сайт — SPA: частина номерів (моб. бокове меню з шапки,
// сторінка контактів) рендериться ДИНАМІЧНО пізніше, тож первинний скан їх не
// бачить і не підміняє. Binotel дає метод для повторного скану вкладеного DOM —
// його треба гукати щоразу після появи нового номера у верстці.
//
// Ідентифікатор віджета — з файлу-інструкції Binotel (window.BinotelCallTracking[516700]).
const WIDGET_ID = 516700

// Безпечний повторний скан: віджет вантажиться асинхронно (GTM), тож якщо він ще
// не готовий — кілька коротких ретраїв. Помилки ковтаємо (аналітика не критична).
export function binotelRescan(retries = 5) {
  if (typeof window === 'undefined') return
  const ct = window.BinotelCallTracking
  const w = ct && ct[WIDGET_ID]
  if (w && typeof w.replacePhoneNumbersOnDynamicContent === 'function') {
    try { w.replacePhoneNumbersOnDynamicContent() } catch { /* noop */ }
    return
  }
  if (retries > 0) setTimeout(() => binotelRescan(retries - 1), 400)
}
