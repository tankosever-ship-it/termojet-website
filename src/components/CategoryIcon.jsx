import * as Icons from 'lucide-react'

export default function CategoryIcon({ name, size = 18, className = '' }) {
  const Icon = Icons[name]
  return Icon ? <Icon size={size} className={className} /> : null
}
