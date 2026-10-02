// Обгортка над framer-motion `motion` для серверного рендеру.
//
// Проблема: анімації появи (initial={{ opacity: 0, y: 20 }} / initial="hidden")
// сервер рендерить як style="opacity:0;transform:…". Тобто HTML приходить з
// НЕВИДИМИМ першим екраном — героєм, H1, картками каталогу — і так стоїть, доки
// не завантажиться й не виконається JS. Це і є та різниця «до/після JS», а LCP-
// елемент (H1/банер героя) рахується лише з моменту, коли він проявився.
//
// Рішення: на сторінці, яку віддав сервер (перший вхід на сайт), анімацій появи
// немає — елементи одразу у фінальному стані (initial={false}), однаково на
// сервері й під час гідрації. Після SPA-переходу на іншу сторінку анімації
// працюють як і раніше.
//
// Використання: import { motion } from '../utils/motion' замість 'framer-motion'.
import { createContext, useContext } from 'react'
import { motion as fm } from 'framer-motion'

// true — поточна сторінка відрендерена сервером (див. SsrEntryProvider у App.jsx)
export const SsrEntryContext = createContext(false)

const cache = new Map()
function wrap(tag) {
  const Base = fm[tag]
  function SsrMotion({ initial, ...props }) {
    const ssrEntry = useContext(SsrEntryContext)
    return <Base {...props} initial={ssrEntry ? false : initial} />
  }
  SsrMotion.displayName = `SsrMotion.${String(tag)}`
  return SsrMotion
}

// motion.div / motion.h1 / … — створюються ліниво й кешуються (стабільний тип
// компонента між рендерами, інакше React перемонтовував би піддерево).
export const motion = new Proxy({}, {
  get(_, tag) {
    if (!cache.has(tag)) cache.set(tag, wrap(tag))
    return cache.get(tag)
  },
})
