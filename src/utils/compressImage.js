// Клієнтське стиснення фото перед завантаженням.
// Зменшує роздільність і вагу прямо в браузері, щоб аплоад був надійним
// навіть на слабкій мобільній мережі (важкі фото з телефона рвуть зʼєднання).

const MAX_DIM = 1600            // макс. сторона зображення, px
const QUALITY = 0.82           // якість JPEG
const SKIP_UNDER = 300 * 1024  // файли < 300 КБ не чіпаємо

/**
 * Повертає стиснений File (JPEG) або оригінал, якщо стискати недоцільно/неможливо.
 * Ніколи не кидає — у разі будь-якої помилки повертає вихідний файл.
 */
export async function compressImage(file, { maxDim = MAX_DIM, quality = QUALITY } = {}) {
  if (!file || !file.type?.startsWith('image/')) return file
  if (file.size <= SKIP_UNDER) return file

  try {
    const bitmap = await loadBitmap(file)
    const width = bitmap.naturalWidth || bitmap.width
    const height = bitmap.naturalHeight || bitmap.height
    if (!width || !height) return file

    const scale = Math.min(1, maxDim / Math.max(width, height))
    const w = Math.round(width * scale)
    const h = Math.round(height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, w, h)
    if (typeof bitmap.close === 'function') bitmap.close()

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
    // Якщо не вийшло або стиснене не легше за оригінал — лишаємо оригінал
    if (!blob || blob.size >= file.size) return file

    const base = (file.name || 'photo').replace(/\.[^.]+$/, '')
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file
  }
}

// Декодуємо файл у ImageBitmap (швидко) з фолбеком на <img>
function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file)
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = e => { URL.revokeObjectURL(url); reject(e) }
    img.src = url
  })
}
