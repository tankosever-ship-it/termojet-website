// ⚠️ НЕ повертати `import * as Icons from 'lucide-react'`.
// Namespace-імпорт вимикає tree-shaking: у бандл потрапляв ВЕСЬ набір lucide —
// чанк vendor-icons важив 607 кБ і тягнувся на кожній сторінці, хоча реально
// потрібні 16 іконок. Решта 52 файли проєкту імпортують іменовано і не страждали:
// достатньо було цього одного файлу, щоб tree-shaking не спрацював ніде.
//
// Імена приходять зі статичного `src/data/categories.js` (поле `icon`) плюс
// 'LayoutGrid' — його CatalogPage передає рядком напряму. Значення динамічні
// лише формально: список закритий, тому тримаємо явну мапу.
import {
  Settings2, GitBranch, Share2, Network, Box, Building2, Waves, Sliders,
  Gauge, Filter, Thermometer, Grid3X3, CircuitBoard, Wrench, Percent, LayoutGrid,
} from 'lucide-react'

const ICONS = {
  Settings2, GitBranch, Share2, Network, Box, Building2, Waves, Sliders,
  Gauge, Filter, Thermometer, Grid3X3, CircuitBoard, Wrench, Percent, LayoutGrid,
}

export default function CategoryIcon({ name, size = 18, className = '' }) {
  const Icon = ICONS[name]
  return Icon ? <Icon size={size} className={className} /> : null
}
