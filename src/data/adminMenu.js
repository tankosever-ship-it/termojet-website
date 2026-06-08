import {
  LayoutDashboard, TrendingUp, Package, ShoppingCart, MessageSquare, Briefcase,
  BookOpen, Image, Star, HelpCircle, FileText, Tag, Mail, LayoutTemplate, Settings,
} from 'lucide-react'

// Єдине джерело розділів адмінки — використовується сайдбаром і дашбордом
export const ADMIN_MENU = [
  { to: '/admin/dashboard',      icon: LayoutDashboard, label: 'Огляд',           desc: 'Статистика' },
  { to: '/admin/analytics',      icon: TrendingUp,      label: 'Аналітика',       desc: 'Ліди, UTM, замовлення' },
  { to: '/admin/products',       icon: Package,         label: 'Товари',          desc: 'Каталог та CRUD' },
  { to: '/admin/orders',         icon: ShoppingCart,    label: 'Замовлення',      desc: 'Всі замовлення' },
  { to: '/admin/consultations',  icon: MessageSquare,   label: 'Консультації',    desc: 'Запити на консультацію' },
  { to: '/admin/dealers',        icon: Briefcase,       label: 'Дилери',          desc: 'Заявки на партнерство' },
  { to: '/admin/blog',           icon: BookOpen,        label: 'Блог',            desc: 'Статті та новини' },
  { to: '/admin/portfolio',      icon: Image,           label: 'Портфоліо',       desc: 'Реалізовані проекти' },
  { to: '/admin/reviews',        icon: Star,            label: 'Відгуки',         desc: 'Відгуки клієнтів' },
  { to: '/admin/faq',            icon: HelpCircle,      label: 'FAQ',             desc: 'Питання та відповіді' },
  { to: '/admin/files',          icon: FileText,        label: 'Документи',       desc: 'PDF файли та каталоги' },
  { to: '/admin/banners',        icon: Image,           label: 'Банери',          desc: 'Банери головної' },
  { to: '/admin/promos',         icon: Tag,             label: 'Акції',           desc: 'Промо-пропозиції' },
  { to: '/admin/subscribers',    icon: Mail,            label: 'Підписники',      desc: 'Email із форми у футері' },
  { to: '/admin/content',        icon: LayoutTemplate,  label: 'Контент головної', desc: 'Тексти та заголовки' },
  { to: '/admin/settings',       icon: Settings,        label: 'Налаштування',    desc: 'Контакти, пароль' },
]
