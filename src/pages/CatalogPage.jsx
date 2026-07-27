import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import LLink from '../components/LLink'
import { motion } from 'framer-motion'
import { Search, ChevronRight, ChevronLeft, X, ShoppingCart, LayoutGrid, List, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { imgUrl } from '../utils/imgUrl'
import { useT } from '../i18n/useT'
import { CATEGORIES } from '../data/categories'
import SEO from '../components/SEO'
import { toUAH } from '../utils/currency'
import { isOnSale, SALE_CATEGORY_SLUG } from '../utils/sale'
import ProductPrice from '../components/ProductPrice'
import CategoryIcon from '../components/CategoryIcon'
import { assetPath } from '../utils/assetPath'

// Фонові банери для окремих категорій (slug → файл у public/)
const CATEGORY_BANNERS = {
  'klapany': '/banner-klapany.png',
  'termojet-mega': '/banner-termojet-mega.png',
  'nasosni-hrupy': '/banner-nasosni-hrupy.png',
  'kolektory-pidloha': '/banner-kolektory-pidloha.png',
  'nasosy': '/banner-nasosy.png',
  'balansuval-klapany': '/banner-balansuval-klapany.png',
  'separatory': '/banner-separatory.png',
  'hidravlichni-rozdilnyky': '/banner-hidravlichni-rozdilnyky.png',
  'avtomatyka': '/banner-avtomatyka.png',
  'dodatkove': '/banner-dodatkove.png',
  'rozpodilchi-kolektory': '/banner-rozpodilchi-kolektory.png',
  'termojet-box': '/banner-termojet-box.png',
  'kolektory-z-hidrostrilkoyu': '/banner-kolektory-z-hidrostrilkoyu.png',
  'zonalne-keruvannya': '/banner-zonalne-keruvannya.png',
}

// Обкладинка головної сторінки каталогу (коли категорія не обрана)
const CATALOG_COVER = '/banner-catalog.webp'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

// ── Фільтри для кожної категорії ─────────────────────────────────────────────
const kvsNum = p => { const m = p.name.match(/kvs-?([\d]+[,.]?[\d]*)/i); return m ? parseFloat(m[1].replace(',','.')) : null }

// Продуктивність насоса (м³/год) зі specs; л/хв → м³/год
const qmaxNum = p => {
  const s = p.specs || {}
  const raw = String(s['Qmax'] || s['Макс. продуктивність'] || s['Продуктивність'] || s['Максимальна подача'] || '')
  const m = raw.match(/([\d]+[.,]?[\d]*)/)
  if (!m) return null
  let v = parseFloat(m[1].replace(',', '.'))
  if (/л\/хв/i.test(raw)) v = v * 0.06
  return v
}
// Напір насоса (м) зі specs
const napirNum = p => {
  const s = p.specs || {}
  const raw = String(s['Hmax'] || s['Макс. напір'] || s['Максимальний напір'] || s['Напір'] || '')
  const m = raw.match(/([\d]+[.,]?[\d]*)/)
  return m ? parseFloat(m[1].replace(',', '.')) : null
}

// Тип приєднання насоса (з назви + полів specs про зʼєднання/діаметр/вихід)
const pumpConnHay = p => {
  const s = p.specs || {}
  return [p.name, s['Зʼєднання'], s["З'єднання"], s['Діаметр'], s['Діаметр підключення'], s['Розмір підключення'], s['Вихід']]
    .filter(Boolean).join(' ')
}
const isFlangePump = p => /фланець|\bDN\s?\d|\bDn\s?\d/i.test(pumpConnHay(p))
const isThreadPump = p => !isFlangePump(p) && /різьб|\bRP\b|\bRp\b|\bG\s?\d|["″'']|XPS|SPE/i.test(pumpConnHay(p))

const CATEGORY_FILTERS = {
  klapany: {
    groups: [
      {
        key: 'type',
        label: 'Тип клапана',
        options: [
          { label: '3-ходові',        test: p => /триход|3-ход/i.test(p.name) && !/чотирьох/i.test(p.name) && !/електропривід/i.test(p.name) },
          { label: '4-ходові',        test: p => /чотирьохход|4-ход/i.test(p.name) },
          { label: 'Зональний клапан',test: p => /зональн/i.test(p.name) },
          { label: 'Електропривід',   test: p => /електропривід/i.test(p.name) },
        ],
      },
      {
        key: 'thermostat',
        label: 'Вид',
        options: [
          { label: 'Термостатичний',    test: p => /термостат/i.test(p.name) },
          { label: 'Нетермостатичний',  test: p => !/термостат/i.test(p.name) && !/електропривід/i.test(p.name) },
        ],
      },
      {
        key: 'thread',
        label: 'Різьба',
        options: [
          { label: 'Внутрішня', test: p => /внутрішн/i.test(p.name) },
          { label: 'Зовнішня',  test: p => /зовнішн|Зовн\./i.test(p.name) },
        ],
      },
      {
        key: 'dn',
        label: 'Діаметр',
        options: [
          { label: 'DN20 / 3/4"', test: p => /DN20/i.test(p.name) || /3\/4"/.test(p.name) },
          { label: 'DN25 / 1"',   test: p => /DN25/i.test(p.name) || (/\b1"/.test(p.name) && !/1 1\//.test(p.name) && !/DN20/.test(p.name)) },
          { label: 'DN32 / 1¼"',  test: p => /DN32/i.test(p.name) || /1 1\/4"/.test(p.name) },
          { label: 'DN40 / 1½"',  test: p => /DN40/i.test(p.name) || /1 1\/2"/.test(p.name) },
          { label: 'DN50 / 2"',   test: p => /DN50/i.test(p.name) },
        ],
      },
      {
        key: 'kvs',
        label: 'KVS, м³/год',
        options: [
          { label: 'до 3',   test: p => { const v = kvsNum(p); return v !== null && v <= 3 } },
          { label: '3–10',   test: p => { const v = kvsNum(p); return v !== null && v > 3 && v <= 10 } },
          { label: '10–20',  test: p => { const v = kvsNum(p); return v !== null && v > 10 && v <= 20 } },
          { label: '20+',    test: p => { const v = kvsNum(p); return v !== null && v > 20 } },
        ],
      },
      {
        key: 'temprange',
        label: 'Діапазон темп.',
        options: [
          { label: '20–45°C (санітарна)', test: p => /20-4[35]/i.test(p.name) },
          { label: '35–60°C (опалення)',  test: p => /35-60/i.test(p.name) },
        ],
      },
    ],
  },

  'nasosni-hrupy': {
    groups: [
      {
        key: 'type',
        label: 'Тип',
        options: [
          { label: 'Без змішувача',       test: p => /без змішувача/i.test(p.name) && !/бойлер/i.test(p.name) },
          { label: 'Зі змішувачем',       test: p => /зі змішувачем/i.test(p.name) },
          { label: 'З термокраном',       test: p => /термокраном|термостатичним краном/i.test(p.name) },
          { label: 'З приводом A-413',    test: p => /A-413|A413/i.test(p.name) },
          { label: 'Бойлерна',            test: p => /бойлер/i.test(p.name) },
        ],
      },
      {
        key: 'connection',
        label: 'З\'єднання',
        options: [
          { label: '1"',     test: p => / 1"/.test(p.name) && !/1 1\//.test(p.name) },
          { label: '1 1/4"', test: p => /1 1\/4"/.test(p.name) },
        ],
      },
      {
        key: 'purpose',
        label: 'Призначення',
        options: [
          { label: 'Тепла підлога', test: p => /підлог/i.test(p.description || '') },
          { label: 'Радіатори',     test: p => /радіатор/i.test(p.description || '') },
          { label: 'ГВС та бойлер', test: p => /бойлер|ГВС/i.test((p.description || '') + p.name) },
        ],
      },
      {
        key: 'side',
        label: 'Сторона подачі',
        options: [
          { label: 'Права', test: p => !/ Л /.test(p.name) && !/ Л$/.test(p.name) && !/\(.*Л\)/.test(p.name) },
          { label: 'Ліва',  test: p => / Л /.test(p.name) || / Л$/.test(p.name) || /\.150-Л/.test(p.name) },
        ],
      },
    ],
  },

  nasosy: {
    groups: [
      {
        key: 'seriya',
        label: 'Серія',
        options: [
          { label: 'APE',  test: p => /\bAPE\b/.test(p.name) },
          { label: 'APM',  test: p => /\bAPM\b/.test(p.name) && !/APM-F/.test(p.name) },
          { label: 'APM-F',test: p => /\bAPM-F\b/.test(p.name) },
          { label: 'XPS',  test: p => /\bXPS\b/i.test(p.name) },
          { label: 'SPE',  test: p => /SPE/i.test(p.name) },
          { label: 'HBS',  test: p => /\bHBS\b/.test(p.name) },
          { label: 'WT',   test: p => /\bWT\b/.test(p.name) },
          { label: 'GRANDLIFT', test: p => /\bGRANDLIFT\b/i.test(p.name) },
          { label: 'MEGA',      test: p => /\bMEGA\b/i.test(p.name) },
          { label: 'SILENCER',  test: p => /\bSILENCER\b/i.test(p.name) },
          { label: 'TBE',       test: p => /\bTBE\b/i.test(p.name) },
        ],
      },
      {
        key: 'pumptype',
        label: 'Тип',
        options: [
          { label: 'Циркуляційний насос',     test: p => /циркуляційний/i.test(p.name) },
          { label: 'Рециркуляційний ГВС',     test: p => /рециркул/i.test(p.name) },
          { label: 'Станція підвищення тиску',test: p => /підвищувальн/i.test(p.name) },
          { label: 'Каналізаційна установка', test: p => /каналізац/i.test(p.name) },
        ],
      },
      {
        key: 'connection',
        label: 'Зʼєднання',
        options: [
          { label: 'Фланцеві', test: isFlangePump },
          { label: 'Різьбові', test: isThreadPump },
        ],
      },
      {
        key: 'power_supply',
        label: 'Живлення',
        options: [
          { label: '1-фазне (220–230 В)', test: p => /1×|230|220 В|160|180/.test(p.specs?.['Напруга'] || '') },
          { label: '3-фазне (380 В)',     test: p => /380/.test(p.specs?.['Напруга'] || '') },
        ],
      },
      {
        key: 'execution',
        label: 'Виконання',
        options: [
          { label: 'Одинарна станція',   test: p => /GRANDLIFT/i.test(p.name) && !/двонасосна/i.test(p.name) },
          { label: 'Двонасосна станція', test: p => /двонасосна/i.test(p.name) },
        ],
      },
      {
        key: 'mountlen',
        label: 'Монтажна довжина',
        options: [
          { label: '130 мм',     test: p => /\/130\b/.test(p.name) },
          { label: '180 мм',     test: p => /\/180\b/.test(p.name) },
          { label: '220–250 мм', test: p => /\/220\b|[-\/]250\b/.test(p.name) },
          { label: '280–340 мм', test: p => /[-\/]280\b|[-\/]340\b/.test(p.name) },
        ],
      },
      {
        key: 'qmax',
        label: 'Продуктивність, м³/год',
        multi: true,
        options: [
          { label: 'до 4',    test: p => { const v = qmaxNum(p); return v !== null && v <= 4 } },
          { label: '4–10',    test: p => { const v = qmaxNum(p); return v !== null && v > 4 && v <= 10 } },
          { label: '10–25',   test: p => { const v = qmaxNum(p); return v !== null && v > 10 && v <= 25 } },
          { label: '25+',     test: p => { const v = qmaxNum(p); return v !== null && v > 25 } },
        ],
      },
      {
        key: 'napir',
        label: 'Напір, м',
        multi: true,
        options: [
          { label: 'до 6',   test: p => { const v = napirNum(p); return v !== null && v <= 6 } },
          { label: '6–10',   test: p => { const v = napirNum(p); return v !== null && v > 6 && v <= 10 } },
          { label: '10+',    test: p => { const v = napirNum(p); return v !== null && v > 10 } },
        ],
      },
    ],
  },

  'termojet-box': {
    groups: [
      {
        key: 'model',
        label: 'Модель',
        options: [
          { label: 'НГ-36', test: p => /НГ-36/i.test(p.name) },
          { label: 'НГ-37', test: p => /НГ-37/i.test(p.name) },
          { label: 'НГ-38', test: p => /НГ-38/i.test(p.name) },
          { label: 'BOX2',  test: p => /BOX\s*2/i.test(p.name) },
          { label: 'BOX3',  test: p => /BOX\s*3/i.test(p.name) },
        ],
      },
      {
        key: 'exec',
        label: 'Виконання',
        multi: true,
        options: [
          { label: 'Пряма',            test: p => /пряма/i.test(p.name) },
          { label: 'Зі змішувачем',    test: p => /змішувач/i.test(p.name) },
          { label: 'З термокраном',    test: p => /термостатичним краном|термокран/i.test(p.name) },
          { label: 'З приводом 413',   test: p => /привід|413|A-?413/i.test(p.name + ' ' + (p.specs?.['Привід'] || '')) },
        ],
      },
      {
        key: 'circuits',
        label: 'Контури (BOX)',
        multi: true,
        options: [
          { label: '2 контури', test: p => /BOX\s*2/i.test(p.name) || /\b2\b/.test(p.specs?.['Контури'] || '') },
          { label: '3 контури', test: p => /BOX\s*3/i.test(p.name) || /\b3\b/.test(p.specs?.['Контури'] || '') },
        ],
      },
    ],
  },

  'rozpodilchi-kolektory': {
    groups: [
      {
        // Друга цифра коду К[розмір][балки]… = кількість балок: 1 = однобалковий
        // (компактний Mini-вузол), 2 = двохбалковий (класична здвоєна гребінка).
        // Перевірено по всіх 41 товарі: чистий розподіл 7/34 без перетинів.
        key: 'beams',
        label: 'Конструкція',
        options: [
          { label: 'Однобалкові', test: p => /К\d1[ВН]/.test(p.name) },
          { label: 'Двохбалкові', test: p => /К\d2[ВН]/.test(p.name) },
        ],
      },
      {
        key: 'outlets',
        label: 'Виходів',
        options: [
          { label: '2 виходи',  test: p => /^К[^Г]?[^С]?2|^К2/.test(p.name) || (/^К/.test(p.name) && /2\+1/.test(p.name)) },
          { label: '3 виходи',  test: p => /^К3/.test(p.name) || (/^К/.test(p.name) && /3\+1/.test(p.name)) },
          { label: '4 виходи',  test: p => /^К4/.test(p.name) || (/^К/.test(p.name) && /4\+1/.test(p.name)) },
          { label: '5+ виходів',test: p => /^К[5-9]/.test(p.name) || (/^К/.test(p.name) && /[5-9]\+1/.test(p.name)) },
        ],
      },
      {
        key: 'direction',
        label: 'Напрямок виходів',
        options: [
          { label: 'Вгору',      test: p => /вгору/i.test(p.name) && !/вниз/i.test(p.name) },
          { label: 'Вниз',       test: p => /вниз/i.test(p.name) && !/вгору/i.test(p.name) },
          { label: 'Вгору+Вниз', test: p => /вгору/i.test(p.name) && /вниз/i.test(p.name) },
        ],
      },
      {
        key: 'ng_interaxis',
        label: 'Міжосьова для НГ',
        options: [
          { label: '125 мм', test: p => /\.125\(/.test(p.name) },
          { label: '150 мм', test: p => /\.150\(/.test(p.name) },
        ],
      },
      {
        key: 'side_interaxis',
        label: 'Міжосьова бокових виходів',
        options: [
          { label: '150 мм', test: p => /\.125\(150\)/.test(p.name) },
          { label: '200 мм', test: p => /\.125\(200\)/.test(p.name) },
          { label: '240 мм', test: p => /\.125\(240\)/.test(p.name) },
          { label: '300 мм', test: p => /\.150\(300\)/.test(p.name) },
        ],
      },
      {
        key: 'balka',
        label: 'Ширина балки',
        options: [
          { label: '80 мм',  test: p => /\.125\(80\)/.test(p.name) },
          { label: '100 мм', test: p => /\.125\(100\)/.test(p.name) },
        ],
      },
      {
        key: 'power',
        label: 'Потужність (ΔT=10°C)',
        options: [
          { label: 'до 30 кВт',  test: p => { const v = p.specs?.['Qmax: △Т=10°С'] || p.specs?.['Потужність макс. ΔT=10°C'] || ''; return /^(25|30)\s*кВт/.test(v) } },
          { label: 'до 75 кВт',  test: p => { const v = p.specs?.['Qmax: △Т=10°С'] || ''; return /^72\s*кВт/.test(v) } },
          { label: 'до 110 кВт', test: p => { const v = p.specs?.['Qmax: △Т=10°С'] || ''; return /^105\s*кВт/.test(v) } },
          { label: '175+ кВт',   test: p => { const v = p.specs?.['Qmax: △Т=10°С'] || ''; return /^175\s*кВт/.test(v) } },
        ],
      },
    ],
  },

  'kolektory-z-hidrostrilkoyu': {
    groups: [
      {
        key: 'outlets',
        label: 'Виходів',
        options: [
          { label: '2 виходи',  test: p => /^КГС2/.test(p.name) || /2\+1/.test(p.name) || /2 вгору/.test(p.name) },
          { label: '3 виходи',  test: p => /^КГС3/.test(p.name) || /3\+1/.test(p.name) || /3 вгору/.test(p.name) },
          { label: '4 виходи',  test: p => /^КГС4/.test(p.name) || /4\+1/.test(p.name) || /4 вгору/.test(p.name) },
          { label: '5+ виходів',test: p => /^КГС[5-9]/.test(p.name) || /[5-9]\+1/.test(p.name) },
        ],
      },
      {
        key: 'direction',
        label: 'Напрямок виходів',
        options: [
          { label: 'Вгору',      test: p => /вгору/i.test(p.name) && !/вниз/i.test(p.name) && !/боков/i.test(p.name) },
          { label: 'Вниз',       test: p => /вниз/i.test(p.name) && !/вгору/i.test(p.name) && !/боков/i.test(p.name) },
          { label: 'Вгору+Вниз', test: p => /вгору/i.test(p.name) && /вниз/i.test(p.name) },
          { label: 'Боковий',    test: p => /боков/i.test(p.name) },
        ],
      },
      {
        key: 'side_interaxis',
        label: 'Міжосьова бокових виходів',
        options: [
          { label: '150 мм', test: p => /\.125\(150\)/.test(p.name) },
          { label: '200 мм', test: p => /\.125\(200\)/.test(p.name) },
        ],
      },
      {
        key: 'power',
        label: 'Потужність (ΔT=10°C)',
        options: [
          { label: 'до 30 кВт', test: p => { const v = p.specs?.['Qmax: △Т=10°С'] || p.specs?.['Потужність макс. ΔT=10°C'] || ''; return /^(25|30)\s*кВт/.test(v) } },
          { label: 'до 65 кВт', test: p => { const v = p.specs?.['Qmax: △Т=10°С'] || ''; return /^60\s*кВт/.test(v) } },
        ],
      },
    ],
  },

  separatory: {
    groups: [
      {
        key: 'septype',
        label: 'Тип',
        options: [
          { label: 'Сепаратори повітря',     test: p => /повітря/i.test(p.name) && !/та бруду/i.test(p.name) },
          { label: 'Повітря + бруду',        test: p => /повітря та бруду/i.test(p.name) },
          { label: 'Сепаратори бруду',       test: p => /Сепаратор бруду/i.test(p.name) },
        ],
      },
      {
        key: 'dn',
        label: 'Діаметр',
        options: [
          { label: 'DN15', test: p => /Dn\s?15\b/i.test(p.name) },
          { label: 'DN20', test: p => /Dn\s?20\b/i.test(p.name) },
          { label: 'DN25', test: p => /Dn\s?25\b/i.test(p.name) },
          { label: 'DN32', test: p => /Dn\s?32\b/i.test(p.name) },
          { label: 'DN40', test: p => /Dn\s?40\b/i.test(p.name) },
          { label: 'DN50', test: p => /Dn\s?50\b/i.test(p.name) },
        ],
      },
    ],
  },

  'hidravlichni-rozdilnyky': {
    groups: [
      {
        key: 'dn',
        label: 'Діаметр',
        options: [
          { label: '1"',     test: p => /ГС-25/.test(p.name) },
          { label: '1 1/4"', test: p => /ГС-26/.test(p.name) },
          { label: '1 1/2"', test: p => /ГС-27/.test(p.name) },
          { label: '2"',     test: p => /ГС-28/.test(p.name) },
          { label: '2 1/2"', test: p => /ГС-30/.test(p.name) },
        ],
      },
      {
        key: 'power',
        label: 'Потужність (ΔT=10°C)',
        options: [
          { label: 'до 30 кВт',   test: p => /ГС-25/.test(p.name) },
          { label: 'до 60 кВт',   test: p => /ГС-26/.test(p.name) },
          { label: 'до 100 кВт',  test: p => /ГС-27/.test(p.name) },
          { label: 'до 150 кВт',  test: p => /ГС-28/.test(p.name) },
          { label: '250+ кВт',    test: p => /ГС-30/.test(p.name) },
        ],
      },
      {
        key: 'gmax',
        label: 'Gmax',
        options: [
          { label: 'до 5 м³/год',  test: p => /ГС-25/.test(p.name) },
          { label: '5–10 м³/год',  test: p => /ГС-26/.test(p.name) },
          { label: '10–15 м³/год', test: p => /ГС-27/.test(p.name) },
          { label: '15+ м³/год',   test: p => /ГС-28|ГС-30/.test(p.name) },
        ],
      },
    ],
  },

  'balansuval-klapany': {
    groups: [
      {
        key: 'dn',
        label: 'Діаметр',
        options: [
          { label: 'DN15 (1/2")', test: p => /DN15/.test(p.name) },
          { label: 'DN20 (3/4")', test: p => /DN20/.test(p.name) },
          { label: 'DN25 (1")',   test: p => /DN25/.test(p.name) },
        ],
      },
    ],
  },

  'zonalne-keruvannya': {
    groups: [
      {
        key: 'devtype',
        label: 'Тип пристрою',
        options: [
          { label: 'Термостат дротовий',    test: p => /HT102|HT120|HT130|Програматор дротовий/i.test(p.name) },
          { label: 'Термостат бездротовий', test: p => /WT102|WT-150|WT150|Програматор бездротовий/i.test(p.name) },
          { label: 'Термоголовка',          test: p => /Термоголовка|TRH/i.test(p.name) },
          { label: 'Сервопривід',           test: p => /Термоелектричний привід|M30x1/i.test(p.name) },
          { label: 'Зональний клапан',      test: p => /зональний клапан|ABF-ZV/i.test(p.name) },
          { label: 'Центр комутації',       test: p => /Центр комутації|TJ03/i.test(p.name) },
          { label: 'Хаб / шлюз',           test: p => /Хаб|EGW/i.test(p.name) },
          { label: 'Датчик / приймач',      test: p => /Датчик|NTC|RO6WIF/i.test(p.name) },
        ],
      },
      {
        key: 'connection',
        label: 'Підключення',
        options: [
          { label: 'Дротовий',    test: p => /дротовий|HT102|HT120|HT130|TJ03CW|M30x1/i.test(p.name) && !/бездрот/i.test(p.name) },
          { label: 'Бездротовий', test: p => /бездрот|WT102|WT-150|WT150|TJ03RF/i.test(p.name) },
          { label: 'WiFi',        test: p => /EGW|RO6WIF/i.test(p.name) },
        ],
      },
    ],
  },

  'kolektory-pidloha': {
    groups: [
      {
        key: 'prodtype',
        label: 'Тип обладнання',
        options: [
          { label: 'Колектор з витратомірами', test: p => /витратомірами/i.test(p.name) },
          { label: 'Колектор з кранами',       test: p => /кранами/i.test(p.name) },
          { label: 'Змішувальний вузол',       test: p => /TJ-MU|Змішувальний вузел|Змішувальний термостат/i.test(p.name) },
          { label: 'Шафа колекторна',          test: p => /Шафа/i.test(p.name) },
          { label: 'Комплектуючі',             test: p => /Байпас|Євроконус|кріплення|накидн|Труба|Скоба|Плівка/i.test(p.name) },
        ],
      },
      {
        key: 'cabinettype',
        label: 'Тип шафи',
        options: [
          { label: 'Внутрішня (вбудована)', test: p => /Шафа колекторна внутрішня/i.test(p.name) },
          { label: 'Зовнішня (накладна)',   test: p => /Шафа колекторна зовнішня/i.test(p.name) },
        ],
      },
    ],
  },

  'termojet-mega': {
    groups: [
      {
        key: 'mega_type',
        label: 'Тип обладнання',
        options: [
          { label: 'Гідрострілка',  test: p => /^ГС-3/.test(p.name) },
          { label: 'Насосна група', test: p => /^НГ-/.test(p.name) },
          { label: 'Колектор',      test: p => /^Колектор/i.test(p.name) },
          { label: 'Перехід',       test: p => /^Перехід/i.test(p.name) },
          { label: 'Муфта',         test: p => /^Муфта/i.test(p.name) },
          { label: 'Підключення',   test: p => /^Підключення/i.test(p.name) },
        ],
      },
      {
        key: 'mega_dn',
        label: 'Розмір (DN)',
        options: [
          { label: 'DN32',  test: p => /DN32\b/.test(p.name) },
          { label: 'DN40',  test: p => /DN40\b|\b40\/40\b/.test(p.name) },
          { label: 'DN50',  test: p => /DN50\b|\b50\/50\b/.test(p.name) },
          { label: 'DN65',  test: p => /DN65\b|ДУ65/.test(p.name) },
          { label: 'DN80',  test: p => /DN80\b|\b80\/80\b/.test(p.name) },
          { label: 'DN100', test: p => /DN100\b|\b100\/100\b/.test(p.name) },
          { label: 'DN125', test: p => /DN125\b|\b125\/125\b/.test(p.name) },
          { label: 'DN150', test: p => /DN150\b|\b150\/150\b/.test(p.name) },
          { label: 'DN200', test: p => /DN200\b/.test(p.name) },
        ],
      },
    ],
  },

  dodatkove: {
    groups: [
      {
        key: 'eqtype',
        label: 'Тип обладнання',
        options: [
          { label: 'Кріплення радіаторів', test: p => /КРН|кріплення радіатор/i.test(p.name) },
          { label: 'Аноди для бойлерів',   test: p => /анод|TI400/i.test(p.name) },
          { label: 'Обладнання для ТН',    test: p => /Підставка|теплового насос/i.test(p.name) },
          { label: 'Кріплення та монтаж',  test: p => /СК-56|Такер/i.test(p.name) },
        ],
      },
    ],
  },
}

// Map of filter group keys → translation keys under catalog.filterGroups.*
const FILTER_GROUP_LABEL_KEYS = {
  type: 'catalog.filterGroups.type',
  thermostat: 'catalog.filterGroups.thermostat',
  thread: 'catalog.filterGroups.thread',
  dn: 'catalog.filterGroups.dn',
  kvs: 'catalog.filterGroups.kvs',
  temprange: 'catalog.filterGroups.temprange',
  connection: 'catalog.filterGroups.connection',
  purpose: 'catalog.filterGroups.purpose',
  side: 'catalog.filterGroups.side',
  seriya: 'catalog.filterGroups.seriya',
  pumptype: 'catalog.filterGroups.pumptype',
  power_supply: 'catalog.filterGroups.powerSupply',
  execution: 'catalog.filterGroups.execution',
  mountlen: 'catalog.filterGroups.mountlen',
  qmax: 'catalog.filterGroups.qmax',
  napir: 'catalog.filterGroups.napir',
  model: 'catalog.filterGroups.model',
  exec: 'catalog.filterGroups.exec',
  circuits: 'catalog.filterGroups.circuits',
  outlets: 'catalog.filterGroups.outlets',
  direction: 'catalog.filterGroups.direction',
  ng_interaxis: 'catalog.filterGroups.ngInteraxis',
  side_interaxis: 'catalog.filterGroups.sideInteraxis',
  balka: 'catalog.filterGroups.balka',
  power: 'catalog.filterGroups.power',
  septype: 'catalog.filterGroups.septype',
  gmax: 'catalog.filterGroups.gmax',
  devtype: 'catalog.filterGroups.devtype',
  prodtype: 'catalog.filterGroups.prodtype',
  cabinettype: 'catalog.filterGroups.cabinettype',
  mega_type: 'catalog.filterGroups.megaType',
  mega_dn: 'catalog.filterGroups.megaDn',
  eqtype: 'catalog.filterGroups.eqtype',
}

// Авто-згенерована мапа перекладу значень фільтрів (показ; ключ=канонічний UA для матчингу).
const FILTER_LABEL_I18N = {
  "1-фазне (220–230 В)": {"en": "Single-phase (220–230 V)", "pl": "Jednofazowe (220–230 V)", "fr": "Monophasé (220–230 V)", "de": "Einphasig (220–230 V)"},
  "100 мм": {"en": "100 mm", "pl": "100 mm", "fr": "100 mm", "de": "100 mm"},
  "10–15 м³/год": {"en": "10–15 m³/h", "pl": "10–15 m³/h", "fr": "10–15 m³/h", "de": "10–15 m³/h"},
  "125 мм": {"en": "125 mm", "pl": "125 mm", "fr": "125 mm", "de": "125 mm"},
  "130 мм": {"en": "130 mm", "pl": "130 mm", "fr": "130 mm", "de": "130 mm"},
  "15+ м³/год": {"en": "15+ m³/h", "pl": "15+ m³/h", "fr": "15+ m³/h", "de": "15+ m³/h"},
  "150 мм": {"en": "150 mm", "pl": "150 mm", "fr": "150 mm", "de": "150 mm"},
  "175+ кВт": {"en": "175+ kW", "pl": "175+ kW", "fr": "175+ kW", "de": "175+ kW"},
  "180 мм": {"en": "180 mm", "pl": "180 mm", "fr": "180 mm", "de": "180 mm"},
  "2 виходи": {"en": "2 outlets", "pl": "2 wyjścia", "fr": "2 sorties", "de": "2 Ausgänge"},
  "2 контури": {"en": "2 circuits", "pl": "2 obwody", "fr": "2 circuits", "de": "2 Kreise"},
  "200 мм": {"en": "200 mm", "pl": "200 mm", "fr": "200 mm", "de": "200 mm"},
  "20–45°C (санітарна)": {"en": "20–45°C (sanitary)", "pl": "20–45°C (sanitarna)", "fr": "20–45°C (sanitaire)", "de": "20–45°C (sanitär)"},
  "220–250 мм": {"en": "220–250 mm", "pl": "220–250 mm", "fr": "220–250 mm", "de": "220–250 mm"},
  "240 мм": {"en": "240 mm", "pl": "240 mm", "fr": "240 mm", "de": "240 mm"},
  "250+ кВт": {"en": "250+ kW", "pl": "250+ kW", "fr": "250+ kW", "de": "250+ kW"},
  "280–340 мм": {"en": "280–340 mm", "pl": "280–340 mm", "fr": "280–340 mm", "de": "280–340 mm"},
  "3 виходи": {"en": "3 outlets", "pl": "3 wyjścia", "fr": "3 sorties", "de": "3 Ausgänge"},
  "3 контури": {"en": "3 circuits", "pl": "3 obwody", "fr": "3 circuits", "de": "3 Kreise"},
  "3-фазне (380 В)": {"en": "Three-phase (380 V)", "pl": "Trójfazowe (380 V)", "fr": "Triphasé (380 V)", "de": "Dreiphasig (380 V)"},
  "3-ходові": {"en": "3-way", "pl": "3-drożne", "fr": "3 voies", "de": "3-Wege"},
  "300 мм": {"en": "300 mm", "pl": "300 mm", "fr": "300 mm", "de": "300 mm"},
  "35–60°C (опалення)": {"en": "35–60°C (heating)", "pl": "35–60°C (ogrzewanie)", "fr": "35–60°C (chauffage)", "de": "35–60°C (Heizung)"},
  "4 виходи": {"en": "4 outlets", "pl": "4 wyjścia", "fr": "4 sorties", "de": "4 Ausgänge"},
  "4-ходові": {"en": "4-way", "pl": "4-drożne", "fr": "4 voies", "de": "4-Wege"},
  "5+ виходів": {"en": "5+ outlets", "pl": "5+ wyjść", "fr": "5+ sorties", "de": "5+ Ausgänge"},
  "5–10 м³/год": {"en": "5–10 m³/h", "pl": "5–10 m³/h", "fr": "5–10 m³/h", "de": "5–10 m³/h"},
  "80 мм": {"en": "80 mm", "pl": "80 mm", "fr": "80 mm", "de": "80 mm"},
  "KVS, м³/год": {"en": "KVS, m³/h", "pl": "KVS, m³/h", "fr": "KVS, m³/h", "de": "KVS, m³/h"},
  "Аноди для бойлерів": {"en": "Anodes for boilers", "pl": "Anody do bojlerów", "fr": "Anodes pour chauffe-eau", "de": "Anoden für Boiler"},
  "Без змішувача": {"en": "Without mixer", "pl": "Bez mieszacza", "fr": "Sans mélangeur", "de": "Ohne Mischer"},
  "Бездротовий": {"en": "Wireless", "pl": "Bezprzewodowy", "fr": "Sans fil", "de": "Kabellos"},
  "Бойлерна": {"en": "Boiler (DHW)", "pl": "Bojler (CWU)", "fr": "Chauffe-eau (ECS)", "de": "Boiler (TWW)"},
  "Боковий": {"en": "Side", "pl": "Boczny", "fr": "Latéral", "de": "Seitlich"},
  "Вгору": {"en": "Up", "pl": "Góra", "fr": "Vers le haut", "de": "Nach oben"},
  "Вгору+Вниз": {"en": "Up+Down", "pl": "Góra+Dół", "fr": "Haut+Bas", "de": "Oben+Unten"},
  "Вид": {"en": "View", "pl": "Widok", "fr": "Vue", "de": "Ansicht"},
  "Виконання": {"en": "Version", "pl": "Wykonanie", "fr": "Version", "de": "Ausführung"},
  "Виходів": {"en": "Outlets", "pl": "Wyjścia", "fr": "Sorties", "de": "Ausgänge"},
  "Вниз": {"en": "Down", "pl": "Dół", "fr": "Vers le bas", "de": "Nach unten"},
  "Внутрішня": {"en": "Female (internal)", "pl": "Wewnętrzny (żeński)", "fr": "Femelle (interne)", "de": "Innengewinde (IG)"},
  "Внутрішня (вбудована)": {"en": "Internal (built-in)", "pl": "Wewnętrzna (wbudowana)", "fr": "Interne (intégrée)", "de": "Intern (eingebaut)"},
  "ГВС та бойлер": {"en": "DHW & boiler", "pl": "CWU i bojler", "fr": "ECS et chauffe-eau", "de": "TWW & Boiler"},
  "Гідрострілка": {"en": "Hydraulic separator", "pl": "Rozdzielacz hydrauliczny", "fr": "Séparateur hydraulique", "de": "Hydraulische Weiche"},
  "Датчик / приймач": {"en": "Sensor / receiver", "pl": "Czujnik / odbiornik", "fr": "Capteur / récepteur", "de": "Sensor / Empfänger"},
  "Двонасосна станція": {"en": "Twin-pump station", "pl": "Stacja dwupompowa", "fr": "Station double pompe", "de": "Doppelpumpstation"},
  "Діаметр": {"en": "Diameter", "pl": "Średnica", "fr": "Diamètre", "de": "Durchmesser"},
  "Діапазон темп.": {"en": "Temp. range", "pl": "Zakres temp.", "fr": "Plage de temp.", "de": "Temp.-Bereich"},
  "до 100 кВт": {"en": "up to 100 kW", "pl": "do 100 kW", "fr": "jusqu'à 100 kW", "de": "bis 100 kW"},
  "до 110 кВт": {"en": "up to 110 kW", "pl": "do 110 kW", "fr": "jusqu'à 110 kW", "de": "bis 110 kW"},
  "до 150 кВт": {"en": "up to 150 kW", "pl": "do 150 kW", "fr": "jusqu'à 150 kW", "de": "bis 150 kW"},
  "до 3": {"en": "up to 3", "pl": "do 3", "fr": "jusqu'à 3", "de": "bis 3"},
  "до 30 кВт": {"en": "up to 30 kW", "pl": "do 30 kW", "fr": "jusqu'à 30 kW", "de": "bis 30 kW"},
  "до 4": {"en": "up to 4", "pl": "do 4", "fr": "jusqu'à 4", "de": "bis 4"},
  "до 5 м³/год": {"en": "up to 5 m³/h", "pl": "do 5 m³/h", "fr": "jusqu'à 5 m³/h", "de": "bis 5 m³/h"},
  "до 6": {"en": "up to 6", "pl": "do 6", "fr": "jusqu'à 6", "de": "bis 6"},
  "до 60 кВт": {"en": "up to 60 kW", "pl": "do 60 kW", "fr": "jusqu'à 60 kW", "de": "bis 60 kW"},
  "до 65 кВт": {"en": "up to 65 kW", "pl": "do 65 kW", "fr": "jusqu'à 65 kW", "de": "bis 65 kW"},
  "до 75 кВт": {"en": "up to 75 kW", "pl": "do 75 kW", "fr": "jusqu'à 75 kW", "de": "bis 75 kW"},
  "Дротовий": {"en": "Wired", "pl": "Przewodowy", "fr": "Filaire", "de": "Kabelgebunden"},
  "Електропривід": {"en": "Electric actuator", "pl": "Siłownik elektryczny", "fr": "Actionneur électrique", "de": "Elektrischer Stellantrieb"},
  "Живлення": {"en": "Power supply", "pl": "Zasilanie", "fr": "Alimentation", "de": "Stromversorgung"},
  "З приводом 413": {"en": "With actuator 413", "pl": "Z siłownikiem 413", "fr": "Avec actionneur 413", "de": "Mit Stellantrieb 413"},
  "З приводом A-413": {"en": "With actuator A-413", "pl": "Z siłownikiem A-413", "fr": "Avec actionneur A-413", "de": "Mit Stellantrieb A-413"},
  "З термокраном": {"en": "With thermostatic valve", "pl": "Z zaworem termostatycznym", "fr": "Avec robinet thermostatique", "de": "Mit Thermostatventil"},
  "З\\": {"en": "W/", "pl": "Z/", "fr": "Av./", "de": "M./"},
  "Зʼєднання": {"en": "Connection", "pl": "Połączenie", "fr": "Raccordement", "de": "Anschluss"},
  "Зі змішувачем": {"en": "With mixer", "pl": "Z mieszaczem", "fr": "Avec mélangeur", "de": "Mit Mischer"},
  "Змішувальний вузол": {"en": "Mixing unit", "pl": "Węzeł mieszający", "fr": "Groupe de mélange", "de": "Mischeinheit"},
  "Зовнішня": {"en": "Male (external)", "pl": "Zewnętrzny (męski)", "fr": "Mâle (externe)", "de": "Außengewinde (AG)"},
  "Зовнішня (накладна)": {"en": "External (surface-mount)", "pl": "Zewnętrzna (natynkowa)", "fr": "Externe (en saillie)", "de": "Extern (aufputz)"},
  "Зональний клапан": {"en": "Zone valve", "pl": "Zawór strefowy", "fr": "Vanne de zone", "de": "Zonenventil"},
  "Каналізаційна установка": {"en": "Sewage pump unit", "pl": "Przepompownia ścieków", "fr": "Station de relevage", "de": "Abwasserhebeanlage"},
  "Колектор": {"en": "Manifold", "pl": "Rozdzielacz", "fr": "Collecteur", "de": "Verteiler"},
  "Колектор з витратомірами": {"en": "Manifold with flow meters", "pl": "Rozdzielacz z przepływomierzami", "fr": "Collecteur avec débitmètres", "de": "Verteiler mit Durchflussmessern"},
  "Конструкція": {"en": "Construction", "pl": "Konstrukcja", "fr": "Construction", "de": "Bauform"},
  "Однобалкові": {"en": "Single-beam", "pl": "Jednobelkowe", "fr": "Simple poutre", "de": "Einbalkig"},
  "Двохбалкові": {"en": "Double-beam", "pl": "Dwubelkowe", "fr": "Double poutre", "de": "Zweibalkig"},
  "Колектор з кранами": {"en": "Manifold with valves", "pl": "Rozdzielacz z zaworami", "fr": "Collecteur avec robinets", "de": "Verteiler mit Ventilen"},
  "Комплектуючі": {"en": "Accessories", "pl": "Akcesoria", "fr": "Accessoires", "de": "Zubehör"},
  "Контури (BOX)": {"en": "Circuits (BOX)", "pl": "Obwody (BOX)", "fr": "Circuits (BOX)", "de": "Kreise (BOX)"},
  "Кріплення радіаторів": {"en": "Radiator brackets", "pl": "Uchwyty do grzejników", "fr": "Supports de radiateurs", "de": "Heizkörperbefestigung"},
  "Кріплення та монтаж": {"en": "Mounting & installation", "pl": "Mocowanie i montaż", "fr": "Fixation et installation", "de": "Befestigung & Montage"},
  "Ліва": {"en": "Left", "pl": "Lewa", "fr": "Gauche", "de": "Links"},
  "Міжосьова бокових виходів": {"en": "Side outlet spacing", "pl": "Rozstaw bocznych wyjść", "fr": "Entraxe des sorties latérales", "de": "Achsabstand Seitenausgänge"},
  "Міжосьова для НГ": {"en": "Spacing for NG", "pl": "Rozstaw dla NG", "fr": "Entraxe pour NG", "de": "Achsabstand für NG"},
  "Модель": {"en": "Model", "pl": "Model", "fr": "Modèle", "de": "Modell"},
  "Монтажна довжина": {"en": "Installation length", "pl": "Długość montażowa", "fr": "Longueur de montage", "de": "Einbaulänge"},
  "Муфта": {"en": "Coupling", "pl": "Mufa", "fr": "Manchon", "de": "Muffe"},
  "Напір, м": {"en": "Head, m", "pl": "Wysokość, m", "fr": "Hauteur manométrique, m", "de": "Förderhöhe, m"},
  "Напрямок виходів": {"en": "Outlet direction", "pl": "Kierunek wyjść", "fr": "Direction des sorties", "de": "Ausgangsrichtung"},
  "Насосна група": {"en": "Pump group", "pl": "Grupa pompowa", "fr": "Groupe de pompage", "de": "Pumpengruppe"},
  "НГ-36": {"en": "NG-36", "pl": "NG-36", "fr": "NG-36", "de": "NG-36"},
  "НГ-37": {"en": "NG-37", "pl": "NG-37", "fr": "NG-37", "de": "NG-37"},
  "НГ-38": {"en": "NG-38", "pl": "NG-38", "fr": "NG-38", "de": "NG-38"},
  "Нетермостатичний": {"en": "Non-thermostatic", "pl": "Nietermostatyczny", "fr": "Non thermostatique", "de": "Nicht thermostatisch"},
  "Обладнання для ТН": {"en": "Heat pump equipment", "pl": "Wyposażenie dla pomp ciepła", "fr": "Équipement pour pompes à chaleur", "de": "Wärmepumpen-Zubehör"},
  "Одинарна станція": {"en": "Single-pump station", "pl": "Stacja jednotlokowa", "fr": "Station simple pompe", "de": "Einzelpumpstation"},
  "Перехід": {"en": "Reducer", "pl": "Przejście", "fr": "Réduction", "de": "Übergang"},
  "Підключення": {"en": "Connection", "pl": "Podłączenie", "fr": "Raccordement", "de": "Anschluss"},
  "Повітря + бруду": {"en": "Air + dirt", "pl": "Powietrze + zanieczyszczenia", "fr": "Air + boues", "de": "Luft + Schmutz"},
  "Потужність (ΔT=10°C)": {"en": "Power (ΔT=10°C)", "pl": "Moc (ΔT=10°C)", "fr": "Puissance (ΔT=10°C)", "de": "Leistung (ΔT=10°C)"},
  "Права": {"en": "Right", "pl": "Prawa", "fr": "Droite", "de": "Rechts"},
  "Призначення": {"en": "Purpose", "pl": "Przeznaczenie", "fr": "Destination", "de": "Verwendungszweck"},
  "Продуктивність, м³/год": {"en": "Flow rate, m³/h", "pl": "Wydajność, m³/h", "fr": "Débit, m³/h", "de": "Durchfluss, m³/h"},
  "Пряма": {"en": "Straight", "pl": "Prosta", "fr": "Droit", "de": "Gerade"},
  "Радіатори": {"en": "Radiators", "pl": "Grzejniki", "fr": "Radiateurs", "de": "Heizkörper"},
  "Рециркуляційний ГВС": {"en": "DHW recirculation", "pl": "Recyrkulacja CWU", "fr": "Recirculation ECS", "de": "TWW-Zirkulation"},
  "Різьба": {"en": "Thread", "pl": "Gwint", "fr": "Filetage", "de": "Gewinde"},
  "Різьбові": {"en": "Threaded", "pl": "Gwintowane", "fr": "Fileté", "de": "Gewindeanschluss"},
  "Розмір (DN)": {"en": "Size (DN)", "pl": "Rozmiar (DN)", "fr": "Taille (DN)", "de": "Größe (DN)"},
  "Сепаратори бруду": {"en": "Dirt separators", "pl": "Separatory zanieczyszczeń", "fr": "Séparateurs de boues", "de": "Schmutzabscheider"},
  "Сепаратори повітря": {"en": "Air separators", "pl": "Separatory powietrza", "fr": "Séparateurs d'air", "de": "Luftabscheider"},
  "Сервопривід": {"en": "Servo actuator", "pl": "Siłownik serwo", "fr": "Servomoteur", "de": "Servoantrieb"},
  "Серія": {"en": "Series", "pl": "Seria", "fr": "Série", "de": "Baureihe"},
  "Станція підвищення тиску": {"en": "Pressure booster station", "pl": "Stacja podnoszenia ciśnienia", "fr": "Station de surpression", "de": "Druckerhöhungsstation"},
  "Сторона подачі": {"en": "Supply side", "pl": "Strona zasilania", "fr": "Côté alimentation", "de": "Vorlaufseite"},
  "Тепла підлога": {"en": "Underfloor heating", "pl": "Ogrzewanie podłogowe", "fr": "Plancher chauffant", "de": "Fußbodenheizung"},
  "Термоголовка": {"en": "Thermostatic head", "pl": "Głowica termostatyczna", "fr": "Tête thermostatique", "de": "Thermostatkopf"},
  "Термостат бездротовий": {"en": "Wireless thermostat", "pl": "Termostat bezprzewodowy", "fr": "Thermostat sans fil", "de": "Funk-Thermostat"},
  "Термостат дротовий": {"en": "Wired thermostat", "pl": "Termostat przewodowy", "fr": "Thermostat filaire", "de": "Kabel-Thermostat"},
  "Термостатичний": {"en": "Thermostatic", "pl": "Termostatyczny", "fr": "Thermostatique", "de": "Thermostatisch"},
  "Тип": {"en": "Type", "pl": "Typ", "fr": "Type", "de": "Typ"},
  "Тип клапана": {"en": "Valve type", "pl": "Typ zaworu", "fr": "Type de vanne", "de": "Ventiltyp"},
  "Тип обладнання": {"en": "Equipment type", "pl": "Typ urządzenia", "fr": "Type d'équipement", "de": "Gerätetyp"},
  "Тип пристрою": {"en": "Device type", "pl": "Typ urządzenia", "fr": "Type d'appareil", "de": "Gerätetyp"},
  "Тип шафи": {"en": "Cabinet type", "pl": "Typ szafy", "fr": "Type d'armoire", "de": "Schranktyp"},
  "Фланцеві": {"en": "Flanged", "pl": "Kołnierzowe", "fr": "À brides", "de": "Flanschanschluss"},
  "Хаб / шлюз": {"en": "Hub / gateway", "pl": "Hub / brama", "fr": "Hub / passerelle", "de": "Hub / Gateway"},
  "Центр комутації": {"en": "Switching center", "pl": "Centrum przełączania", "fr": "Centre de commutation", "de": "Schaltzentrale"},
  "Циркуляційний насос": {"en": "Circulation pump", "pl": "Pompa obiegowa", "fr": "Pompe de circulation", "de": "Umwälzpumpe"},
  "Шафа колекторна": {"en": "Manifold cabinet", "pl": "Szafka rozdzielaczowa", "fr": "Armoire collecteur", "de": "Verteilerkasten"},
  "Ширина балки": {"en": "Beam width", "pl": "Szerokość belki", "fr": "Largeur de poutre", "de": "Balkenbreite"},
}

function Sidebar({ categorySlug, filters, setFilters, priceBounds, price, setPrice }) {
  const t = useT()
  const { lang } = useApp()
  // Показ значення фільтра перекладеною мовою; ключ opt.label лишається UA для матчингу.
  const flabel = (label) => (lang !== 'uk' && FILTER_LABEL_I18N[label]?.[lang]) || label
  const config = CATEGORY_FILTERS[categorySlug]
  const hasPrice = priceBounds && priceBounds[1] > priceBounds[0]
  if (!config && !hasPrice) return null

  const mono = { fontFamily: "'JetBrains Mono', monospace" }
  const lo = price ? price[0] : (priceBounds ? priceBounds[0] : 0)
  const hi = price ? price[1] : (priceBounds ? priceBounds[1] : 0)
  const priceActive = hasPrice && (lo > priceBounds[0] || hi < priceBounds[1])
  const filtersActive = Object.values(filters).some(v => Array.isArray(v) ? v.length : v)
  const hasAny = filtersActive || priceActive
  const fmt = n => Math.round(n).toLocaleString('uk-UA')

  return (
    <aside className="hidden lg:block w-52 flex-shrink-0">
      <div className="bg-white border border-[var(--ink-200)] sticky top-[72px] max-h-[calc(100vh-88px)] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--ink-200)] flex-shrink-0">
          <span style={{ ...mono, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
            {t('catalog.filters.heading')}
          </span>
          {hasAny && (
            <button onClick={() => { setFilters({}); setPrice(null) }}
              className="flex items-center gap-1 transition-colors hover:text-[var(--accent)]"
              style={{ ...mono, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              <X size={10} /> {t('catalog.filters.reset')}
            </button>
          )}
        </div>

        <div className="p-3 space-y-5 overflow-y-auto overscroll-contain flex-1">

          {/* Ціна (#5) */}
          {hasPrice && (
            <div>
              <div className="mb-2 px-1 flex items-center justify-between"
                style={{ ...mono, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
                <span>{t('catalog.filters.priceLabel')}</span>
              </div>
              <div className="px-1">
                <div className="flex items-center justify-between mb-1.5" style={{ ...mono, fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>
                  <span>{fmt(lo)}</span><span>{fmt(hi)}</span>
                </div>
                <input type="range" min={priceBounds[0]} max={priceBounds[1]} value={lo}
                  onChange={e => setPrice([Math.min(+e.target.value, hi), hi])}
                  className="w-full" style={{ accentColor: 'var(--accent)' }} aria-label={t('catalog.filters.priceFrom')} />
                <input type="range" min={priceBounds[0]} max={priceBounds[1]} value={hi}
                  onChange={e => setPrice([lo, Math.max(+e.target.value, lo)])}
                  className="w-full" style={{ accentColor: 'var(--accent)' }} aria-label={t('catalog.filters.priceTo')} />
              </div>
            </div>
          )}

          {/* Filter groups */}
          {config && config.groups.map(group => (
            <div key={group.key}>
              <div className="mb-2 px-1"
                style={{ ...mono, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
                {FILTER_GROUP_LABEL_KEYS[group.key] ? t(FILTER_GROUP_LABEL_KEYS[group.key]) : flabel(group.label)}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.options.map(opt => {
                  const sel = filters[group.key]
                  const active = group.multi ? (Array.isArray(sel) && sel.includes(opt.label)) : sel === opt.label
                  const toggle = () => setFilters(f => {
                    if (group.multi) {
                      const cur = Array.isArray(f[group.key]) ? f[group.key] : []
                      const next = cur.includes(opt.label) ? cur.filter(l => l !== opt.label) : [...cur, opt.label]
                      return { ...f, [group.key]: next }
                    }
                    return { ...f, [group.key]: active ? '' : opt.label }
                  })
                  return (
                    <button key={opt.label} onClick={toggle}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-left transition-all"
                      style={{
                        background: active ? 'rgba(255,85,0,0.07)' : 'transparent',
                        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                      }}>
                      <span className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center border transition-colors"
                        style={{
                          border: active ? '1px solid var(--accent)' : '1px solid #ccc',
                          background: active ? 'var(--accent)' : 'transparent',
                          borderRadius: group.multi ? '3px' : '50%',
                        }}>
                        {active && <span style={{ color: 'white', fontSize: '9px', lineHeight: 1 }}>✓</span>}
                      </span>
                      <span style={{ ...mono, fontSize: '11px', fontWeight: active ? 700 : 500, color: active ? 'var(--accent)' : 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                        {flabel(opt.label)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

// #16 (Етап 3): корисні характеристики в картках per-категорія.
// Значення беремо за пріоритетним списком матчерів ключів (підрядок lower-case;
// масив = всі підрядки мають бути в ключі — для розрізнення ΔT=10/ΔT=20 за «10»/«20»,
// що стійко до різних юнікодів Δ/△ і Т/T у даних).
const BADGE_PREFERRED = {
  'separatory':                 ['розмір', 'пропускна'],
  'nasosni-hrupy':              [['qmax', '10'], ['qmax', '20'], 'kvs', 'ізоляц'],
  'klapany':                    ['dn', 'kvs', 'діапазон темп', 'різьба', 'тиск', 'крутний момент', 'керування', 'напруга', 'час оберт', 'підключ'],
  'nasosy':                     ['діаметр', 'qmax', 'макс. продуктивн', 'hmax', 'напір', 'споживана потужн', 'потужн'],
  'termojet-box':               ['контури', 'dn', 'діаметр', ['потужність', '10'], ['потужність', '20'], 'підключ', 'привід', 'ізоляц'],
  'avtomatyka':                 ['кількість контур', 'wi-fi', 'погодозалеж', 'дисплей'],
  'zonalne-keruvannya':         ['напруга', 'тип', 'різьба', 'монтаж', 'діапазон темп', 'живлення', 'wi-fi'],
  'rozpodilchi-kolektory':      ['кількість виход', ['qmax', '10'], ['qmax', '20'], 'підключення котла'],
  'kolektory-z-hidrostrilkoyu': ['кількість виход', 'виходи', ['qmax', '10'], ['qmax', '20'], 'підключення котла'],
  'hidravlichni-rozdilnyky':    ['діаметр', ['qmax', '10'], ['qmax', '20'], "об'єм"],
  'kolektory-pidloha':          ['кількість виход', 'підключ', 'матеріал', 'витратомір', 'температура'],
  'balansuval-klapany':         ['dn', 'kvs', 'pn', 'функці'],
  'termojet-mega':              ['dn', 'діаметр', 'розмір', ['qmax', '10'], ['qmax', '20'], 'kvs', 'gmax', 'підключ'],
  'rozprodazh':                 ['розмір', 'dn', 'діаметр'],
}
const BADGE_EXCLUDE_KEYS = ['артикул', 'назва', 'виробник', 'характеристика', 'рідина']
const BADGE_EXCLUDE_VALS = ['одиниця вимірювання', 'termojet', 'так', 'ні', 'немає', 'n/a', '—', '-', '']
const BADGE_BOOL_KEYS = ['wi-fi', 'погодозалеж', 'гвс', 'термокран', 'термометр'] // показуємо як мітку, якщо «так»

// Одиниці-слова для бейджів за мовами (для голих чисел: контури/виходи/потік)
const BADGE_UNITS = {
  circuits: { uk: ' контури', en: ' circuits', pl: ' obiegi', fr: ' circuits', de: ' Kreise' },
  outlets:  { uk: ' виходи',  en: ' outlets',  pl: ' wyjścia', fr: ' sorties',  de: ' Ausgänge' },
  flow:     { uk: ' м³/год',  en: ' m³/h',     pl: ' m³/h',    fr: ' m³/h',     de: ' m³/h' },
}

function extractBadges(product, displaySpecs, lang = 'uk') {
  const badges = []
  const name = (lang !== 'uk' && product[`name_${lang}`]) ? product[`name_${lang}`] : (product.name || '')
  // specs (canonical UA) drives key selection; displaySpecs (translated) used for displayed values
  const specs = product.specs || {}
  const dspecs = displaySpecs || specs
  const cat = product.categorySlug || ''
  // specs_<lang> має ПЕРЕКЛАДЕНІ ключі — зіставляємо значення/ключ за ПОЗИЦІЄЮ канонічного ключа
  const canonKeys = Object.keys(specs)
  const dVals = Object.values(dspecs)
  const dKeys = Object.keys(dspecs)
  const tVal = (k) => { const i = canonKeys.indexOf(k); return (i >= 0 && dVals[i] !== undefined) ? dVals[i] : specs[k] }
  const tKey = (k) => { const i = canonKeys.indexOf(k); return (i >= 0 && dKeys[i] !== undefined) ? dKeys[i] : k }
  const uw = (kind) => BADGE_UNITS[kind][lang] || BADGE_UNITS[kind].uk

  const specKeys = Object.keys(specs)
  if (specKeys.length > 0) {
    const sku = String(product.sku || '').trim().toLowerCase()
    const cleanVal = raw => String(raw).split(/[,;]\s+/)[0].trim() // не ріже десяткову кому «7,2»
    const valBad = v => !v || v.length > 32 || BADGE_EXCLUDE_VALS.includes(v.toLowerCase()) || v.toLowerCase() === sku
    const keyBad = k => BADGE_EXCLUDE_KEYS.some(e => k.toLowerCase().includes(e))
    // голі числа → осмислена мітка за змістом ключа (DN15, «2 виходи»)
    const fmtVal = (lk, v) => {
      if (/пропускна|здатн/.test(lk)) return v + uw('flow')
      if (/^\d+$/.test(v)) {
        if (/\bdn\b|діаметр|розмір/.test(lk)) return 'DN' + v
        if (/контур/.test(lk)) return v + uw('circuits')
        if (/виход/.test(lk)) return v + uw('outlets')
      }
      return v
    }
    const findKey = m => specKeys.find(k => {
      if (keyBad(k)) return false
      const lk = k.toLowerCase()
      return Array.isArray(m) ? m.every(s => lk.includes(s)) : lk.includes(m)
    })
    const out = []
    const push = label => {
      const l = (label || '').trim()
      if (!l || out.some(b => b.label.toLowerCase() === l.toLowerCase())) return
      out.push({ label: l, type: ['blue', 'orange', 'gray'][out.length % 3] })
    }

    // тип сепаратора з підкатегорії (повітря / бруд / комбі) замість бренду
    if (cat === 'separatory' && product.subcategory) {
      push(product.subcategory.replace(/сепаратори\s+/i, '').trim())
    }

    const order = BADGE_PREFERRED[cat]
    const keys = order
      ? order.map(findKey).filter(Boolean)
      : specKeys.filter(k => !keyBad(k))
    for (const k of keys) {
      if (out.length >= 4) break
      const lk = k.toLowerCase()
      // for bool keys, use canonical UA value for the true/false gate; display key label as-is
      if (BADGE_BOOL_KEYS.some(b => lk.includes(b))) {
        const v = cleanVal(specs[k]).toLowerCase()
        if (['ні', 'немає', '-', ''].includes(v)) continue
        if (['так', '+', 'є'].includes(v)) { push(tKey(k).replace(/[:(].*$/, '').trim()); continue }
        // інакше — справжнє значення (напр. «2.4 GHz»): show translated
      }
      // translated displayed value (matched by canonical key position), canonical key for lookup
      const v = cleanVal(tVal(k))
      if (!valBad(v)) push(fmtVal(lk, v))
    }
    return out
  }

  const pumpMatch = name.match(/APM\s*(\d+)\/(\d+)\/(\d+)/)
  if (pumpMatch) {
    badges.push({ label: `Dn${pumpMatch[1]}`, type: 'blue' })
    badges.push({ label: `H=${pumpMatch[2]}м`, type: 'orange' })
    badges.push({ label: `L=${pumpMatch[3]}мм`, type: 'gray' })
    return badges
  }

  const kwMatch = name.match(/(\d+)\s*кВт/)
  if (kwMatch) badges.push({ label: `${kwMatch[1]} кВт`, type: 'orange' })

  const dnMatch = name.match(/DN\s*(\d+)|Dn\s*(\d+)|(\d+)\s*мм/)
  if (dnMatch) badges.push({ label: `DN${dnMatch[1] || dnMatch[2] || dnMatch[3]}`, type: 'blue' })

  const outMatch = name.match(/(\d+)\s*(вих|виход|контур)/)
  if (outMatch) badges.push({ label: `${outMatch[1]} вих`, type: 'gray' })

  const circMatch = name.match(/(\d+)\+(\d+)/)
  if (circMatch && !pumpMatch) badges.push({ label: `${circMatch[1]}+${circMatch[2]}`, type: 'blue' })

  return badges.slice(0, 5)
}

// Порядок товарів у «Колектори теплої підлоги» (за замовчуванням):
// змішувальні вузли → колектори з витратомірами (2→15) → з кранами (2→12) → шафи → інше
function kpRank(p) {
  const n = p.name || '', sku = p.sku || ''
  if (/TJ-MU/i.test(sku) || /змішу/i.test(n)) return 1000
  let m = sku.match(/TJ-R-W-(\d+)/)
  if (m) return 2100 + parseInt(m[1])            // з кранами
  m = sku.match(/TJ-W-(\d+)/)
  if (m) return 2000 + parseInt(m[1])            // з витратомірами
  if (/Шафа колекторна/i.test(n)) {
    const num = parseInt((n.match(/№\s*0*(\d+)/) || [])[1] || '99')
    return 3000 + (/зовнішня/i.test(n) ? 50 : 0) + num
  }
  return 4000                                     // інше
}

// Порядок у «Сепаратори»: повітря → повітря+бруду → бруду → інше; усередині — за серією і DN
function sepRank(p) {
  const n = p.name || '', sku = p.sku || '', sub = p.subcategory || ''
  const dn = parseInt((n.match(/Dn\s?(\d+)/i) || [])[1] || '99')
  let g = 4
  if (/повітря та бруду/i.test(sub) || /повітря та бруду/i.test(n)) g = 2
  else if (/Сепаратори повітря/i.test(sub) || (/повітря/i.test(n) && !/та бруду/i.test(n))) g = 1
  else if (/Сепаратори бруду/i.test(sub) || /Сепаратор бруду/i.test(n)) g = 3
  let pr = 5
  if (/^TJ4F/.test(sku)) pr = 0
  else if (/^TJV6G/.test(sku)) pr = 1
  else if (/^TJV7G/.test(sku)) pr = 2
  else if (/^TJVT6G/.test(sku)) pr = 0
  else if (/^TJT6G/.test(sku)) pr = 0
  else if (/^TJT7G/.test(sku)) pr = 1
  else if (/^TJ7575/.test(sku)) pr = 2
  return g * 10000 + pr * 1000 + dn
}

// Порядок категорій для перегляду «всі товари» (без вибраної категорії) —
// точно як плитки-категорії зверху, тобто порядок масиву CATEGORIES.
const CAT_ORDER = (() => {
  const m = {}
  CATEGORIES.forEach((c, i) => { m[c.slug] = i; if (c.id != null) m[c.id] = i })
  return m
})()
const catRank = p => (p.categorySlug in CAT_ORDER ? CAT_ORDER[p.categorySlug] : 999)

// ── Смужка плиток-категорій зі стрілками + fade + peek ───────────────────────────
function CategoryStrip({ products, categories, catCounts, currentCategory, lang }) {
  const t = useT()
  const scrollRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const [bar, setBar] = useState({ scrollable: false, w: 0, x: 0 })

  const update = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < max - 4)
    // індикатор прокрутки (моб): ширина бігунця = частка видимого, позиція = частка скролу
    const w = Math.min(100, (el.clientWidth / el.scrollWidth) * 100)
    const pos = max > 0 ? el.scrollLeft / max : 0
    setBar({ scrollable: max > 4, w, x: pos * (100 - w) })
  }, [])

  useEffect(() => {
    update()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    // повторний замір після завантаження зображень / шрифтів
    const t = setTimeout(update, 400)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); clearTimeout(t) }
  }, [update])

  const scrollByDir = dir => {
    const el = scrollRef.current
    if (!el) return
    // крок = ширина однієї картки + gap (gap-3 = 12px) → гортаємо по одній категорії
    const firstCard = el.querySelector('a')
    const step = firstCard ? firstCard.offsetWidth + 12 : 136
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const arrowBase = 'hidden md:flex absolute top-[74px] -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white border border-[var(--ink-200)] shadow-md text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors'

  return (
    <div className="mb-6 relative">
      {/* Смужка — сильніший peek через scroll-padding праворуч */}
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-3 cat-strip snap-x"
        style={{ scrollPaddingLeft: 8, scrollPaddingRight: 56 }}>
        {/* Плитка "Всі категорії" */}
        <LLink to="/catalog"
          className={`group flex-shrink-0 w-[124px] snap-start flex flex-col bg-white border transition-all rounded-xl overflow-hidden ${!currentCategory ? 'border-[var(--accent)] shadow-md' : 'border-[var(--ink-200)] hover:border-[var(--accent)] hover:shadow-md'}`}>
          <div className="h-[96px] flex items-center justify-center pt-3">
            <span className="flex items-center justify-center w-14 h-14 rounded-full"
              style={{ background: !currentCategory ? 'var(--accent)' : 'rgba(255,107,0,0.1)' }}>
              <CategoryIcon name="LayoutGrid" size={26}
                className={!currentCategory ? 'text-white' : 'text-[var(--accent)]'} />
            </span>
          </div>
          <div className="px-2 pb-3 pt-2 text-center">
            <div className="text-[11.5px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {t('catalog.filter.all')}
            </div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
              {products.length}
            </div>
          </div>
        </LLink>

        {categories.map(c => {
          const isActive = currentCategory?.id === c.id
          const n = catCounts[c.id] || 0
          const src = (c.image || '').startsWith('/') ? assetPath(c.image) : c.image
          return (
            <LLink key={c.id} to={`/catalog/${c.slug}`}
              className={`group flex-shrink-0 w-[124px] snap-start flex flex-col bg-white border transition-all rounded-xl overflow-hidden ${isActive ? 'border-[var(--accent)] shadow-md' : 'border-[var(--ink-200)] hover:border-[var(--accent)] hover:shadow-md'}`}>
              <div className="h-[96px] flex items-center justify-center p-2 overflow-hidden bg-white">
                {src ? (
                  <img src={src} alt={c.name[lang] || c.name.uk} loading="lazy"
                    className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                    onError={e => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <CategoryIcon name={c.icon} size={30} className="text-[var(--accent)]" />
                )}
              </div>
              <div className="px-2 pb-3 pt-1.5 text-center">
                <div className="text-[11.5px] font-semibold leading-tight line-clamp-3 min-h-[42px] flex items-center justify-center"
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {c.name[lang] || c.name.uk}
                </div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {n}
                </div>
              </div>
            </LLink>
          )
        })}
      </div>

      {/* Fade ліворуч + стрілка */}
      {canLeft && (
        <>
          <div className="absolute left-0 top-0 bottom-3 w-12 md:w-14 pointer-events-none z-10"
            style={{ background: 'linear-gradient(90deg, var(--bg) 35%, transparent)' }} />
          <button type="button" aria-label={t('catalog.scrollLeft')} onClick={() => scrollByDir(-1)}
            className={`${arrowBase} left-1`}>
            <ChevronLeft size={20} />
          </button>
        </>
      )}

      {/* Fade праворуч + стрілка */}
      {canRight && (
        <>
          <div className="absolute right-0 top-0 bottom-3 w-12 md:w-14 pointer-events-none z-10"
            style={{ background: 'linear-gradient(270deg, var(--bg) 35%, transparent)' }} />
          <button type="button" aria-label={t('catalog.scrollRight')} onClick={() => scrollByDir(1)}
            className={`${arrowBase} right-1`}>
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Індикатор прокрутки — лише мобільний (десктоп має стрілки) */}
      {bar.scrollable && (
        <div className="md:hidden mt-1.5 mx-auto h-[3px] rounded-full overflow-hidden"
          style={{ width: '64px', background: 'var(--ink-200)' }} aria-hidden="true">
          <div className="h-full rounded-full"
            style={{ width: `${bar.w}%`, marginLeft: `${bar.x}%`, background: 'var(--accent)', transition: 'margin-left .08s linear' }} />
        </div>
      )}
    </div>
  )
}

export default function CatalogPage() {
  const { categorySlug } = useParams()
  const [searchParams] = useSearchParams()
  const { products, lang, addToCart, eurRate } = useApp()
  const t = useT()
  const cat = t('catalog')

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState('default')
  const [catFilters, setCatFilters] = useState({})
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [price, setPrice] = useState(null) // [lo, hi] у ₴ або null

  const currentCategory = categorySlug ? CATEGORIES.find(c => c.slug === categorySlug) : null

  // Скидаємо фільтри й ціну при зміні категорії
  useMemo(() => { setCatFilters({}); setPrice(null) }, [categorySlug])

  const catProducts = useMemo(() => {
    if (!currentCategory) return products
    // Категорія «Акція» збирає всі товари з акційною ціною (+ явно призначені)
    if (currentCategory.slug === SALE_CATEGORY_SLUG) {
      return products.filter(p => isOnSale(p) || p.categorySlug === currentCategory.id || p.categorySlug === currentCategory.slug)
    }
    return products.filter(p => p.categorySlug === currentCategory.id || p.categorySlug === currentCategory.slug)
  }, [products, currentCategory])

  // Кількість товарів у кожній категорії (для плиток-категорій)
  const catCounts = useMemo(() => {
    const m = {}
    for (const c of CATEGORIES) {
      m[c.id] = c.slug === SALE_CATEGORY_SLUG
        ? products.filter(p => isOnSale(p) || p.categorySlug === c.id || p.categorySlug === c.slug).length
        : products.filter(p => p.categorySlug === c.id || p.categorySlug === c.slug).length
    }
    return m
  }, [products])

  // Межі ціни (#5) — у ₴, по поточній категорії
  const priceBounds = useMemo(() => {
    const vals = catProducts.map(p => toUAH(p.price, p.currency, eurRate) || 0).filter(v => v > 0)
    if (!vals.length) return null
    return [Math.floor(Math.min(...vals)), Math.ceil(Math.max(...vals))]
  }, [catProducts, eurRate])

  const filtered = useMemo(() => {
    let list = catProducts

    if (search) list = list.filter(p => {
      const name = (lang !== 'uk' && p[`name_${lang}`]) ? p[`name_${lang}`] : (p.name || '')
      return name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase())
    })
    if (inStockOnly) list = list.filter(p => p.inStock)

    // Category-specific filters
    const filterConfig = categorySlug ? CATEGORY_FILTERS[categorySlug] : null
    if (filterConfig) {
      filterConfig.groups.forEach(group => {
        const sel = catFilters[group.key]
        if (group.multi) {
          const labels = Array.isArray(sel) ? sel : []
          if (!labels.length) return
          const opts = group.options.filter(o => labels.includes(o.label))
          if (opts.length) list = list.filter(p => opts.some(o => o.test(p))) // OR у групі
        } else {
          if (!sel) return
          const opt = group.options.find(o => o.label === sel)
          if (opt) list = list.filter(opt.test)
        }
      })
    }

    const priceInUah = p => toUAH(p.price, p.currency, eurRate) || 0
    // Фільтр за ціною (#5) — товари «по запиту» (ціна 0) лишаємо видимими
    if (price && priceBounds && (price[0] > priceBounds[0] || price[1] < priceBounds[1])) {
      list = list.filter(p => { const u = priceInUah(p); return u <= 0 || (u >= price[0] && u <= price[1]) })
    }
    if (sort === 'priceAsc')  list = [...list].sort((a, b) => priceInUah(a) - priceInUah(b))
    if (sort === 'priceDesc') list = [...list].sort((a, b) => priceInUah(b) - priceInUah(a))
    if (sort === 'nameAsc')   list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    if (sort === 'default' && categorySlug === 'kolektory-pidloha')
      list = [...list].sort((a, b) => kpRank(a) - kpRank(b))
    if (sort === 'default' && categorySlug === 'separatory')
      list = [...list].sort((a, b) => sepRank(a) - sepRank(b))
    // «Всі товари» (без вибраної категорії): групуємо за порядком категорій зверху
    if (sort === 'default' && !categorySlug)
      list = [...list].sort((a, b) => catRank(a) - catRank(b))
    return list
  }, [catProducts, search, inStockOnly, sort, catFilters, categorySlug, lang, price, priceBounds, eurRate])

  return (
    <>
      <SEO title={currentCategory ? (currentCategory.name[lang] || currentCategory.name.uk) : cat.title} />

      {/* ── Page header (заходить під прозорий навбар, як hero на головній) ── */}
      <div className="relative overflow-hidden text-white pb-8"
        style={{
          marginTop: '-60px',
          paddingTop: 'calc(2rem + 60px)',
          background: `
            radial-gradient(ellipse 70% 100% at 100% 100%, rgba(232,93,4,0.15), transparent 55%),
            radial-gradient(ellipse 50% 80% at 0% 0%, rgba(255,85,0,0.08), transparent 50%),
            linear-gradient(160deg, #080808, #111111)
          `
        }}>
        {(currentCategory ? CATEGORY_BANNERS[currentCategory.slug] : CATALOG_COVER) && (
          <>
            <img src={assetPath(currentCategory ? CATEGORY_BANNERS[currentCategory.slug] : CATALOG_COVER)} alt="" aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: 'center right' }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to right, rgba(8,7,6,0.70) 0%, rgba(8,7,6,0.48) 45%, rgba(8,7,6,0.18) 100%)' }} />
          </>
        )}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(232,93,4,0.4)] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
            <LLink to="/" className="hover:text-white/70 transition-colors">{t('catalog.breadcrumbHome')}</LLink>
            <ChevronRight size={12} />
            {currentCategory ? (
              <>
                <LLink to="/catalog" className="hover:text-white/70 transition-colors">{t('nav.catalog')}</LLink>
                <ChevronRight size={12} />
                <span className="text-white/70">{currentCategory.name[lang] || currentCategory.name.uk}</span>
              </>
            ) : (
              <span className="text-white/70">{t('nav.catalog')}</span>
            )}
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black font-['Archivo',sans-serif]">
                {currentCategory ? (currentCategory.name[lang] || currentCategory.name.uk) : cat.title}
              </h1>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-black font-['Archivo',sans-serif]">{filtered.length}</div>
              <div className="text-white/50 text-xs">{t('catalog.productsWord')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Опис категорії (видимий + SEO body-текст) ── */}
        {currentCategory && (currentCategory.desc[lang] || currentCategory.desc.uk) && (
          <p className="text-gray-600 text-[15px] leading-relaxed max-w-3xl mb-5">
            {currentCategory.desc[lang] || currentCategory.desc.uk}
          </p>
        )}

        {/* ── Смужка плиток-категорій (стиль Prom) — стрілки + fade + peek ── */}
        <CategoryStrip products={products} categories={CATEGORIES} catCounts={catCounts} currentCategory={currentCategory} lang={lang} />

        {/* ── Основний контент: сайдбар + товари ── */}
        <div className="flex gap-6">

        <Sidebar categorySlug={categorySlug} filters={catFilters} setFilters={setCatFilters}
          priceBounds={priceBounds} price={price} setPrice={setPrice} />

        <div className="flex-1 min-w-0">

        {/* ── Toolbar: search + filters + view toggle ── */}
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white border border-[var(--ink-200)]">
          <div className="relative flex-1 min-w-40">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={cat.search}
              className="w-full pl-8 pr-8 py-2 border border-gray-200 focus:outline-none focus:border-[var(--primary)] text-sm bg-gray-50/70" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-gray-50/70 cursor-pointer text-sm text-gray-600 hover:border-[var(--primary)] transition-colors select-none">
            <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="accent-[var(--primary)] w-3.5 h-3.5" />
            {cat.filter.inStock}
          </label>

          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-3 py-2 border border-gray-200 bg-gray-50/70 text-sm focus:outline-none focus:border-[var(--primary)] text-gray-600">
            <option value="default">{cat.sort.default}</option>
            <option value="priceAsc">{cat.sort.priceAsc}</option>
            <option value="priceDesc">{cat.sort.priceDesc}</option>
            <option value="nameAsc">{cat.sort.nameAsc}</option>
          </select>

          {/* View toggle */}
          <div className="flex border border-gray-200 overflow-hidden">
            <button onClick={() => setViewMode('grid')}
              className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-[var(--primary)] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              title={t('catalog.viewGrid')}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`px-3 py-2 transition-colors border-l border-gray-200 ${viewMode === 'list' ? 'bg-[var(--primary)] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              title={t('catalog.viewList')}>
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Result count */}
        <div className="text-xs text-gray-400 font-mono mb-4">
          {t('catalog.foundCount')} <span className="font-bold text-gray-600">{filtered.length}</span> {t('catalog.productsWord')}
          {(search || inStockOnly || price || Object.values(catFilters).some(v => Array.isArray(v) ? v.length : v)) && (
            <button onClick={() => { setSearch(''); setInStockOnly(false); setCatFilters({}); setPrice(null) }}
              className="ml-3 text-[var(--accent)] hover:underline">
              {t('catalog.resetFilters')}
            </button>
          )}
        </div>

        {/* ── Products ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold mb-2 text-gray-600">{cat.noResults}</p>
            <p className="text-sm">{t('catalog.tryChangeSearch')}</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── GRID VIEW ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product, i) => {
              const name = (lang !== 'uk' && product[`name_${lang}`]) ? product[`name_${lang}`] : (product.name || '')
              // Prefer per-lang shortDesc/desc, fall back to UA
              const rawDesc = (lang !== 'uk' && (product[`shortDesc_${lang}`] || product[`desc_${lang}`]))
                ? (product[`shortDesc_${lang}`] || product[`desc_${lang}`])
                : (product.shortDesc || product.description || '')
              const shortDesc = rawDesc.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/^Опис\s+/i, '').replace(/^(моделі|Опис моделі)\s+/i, '').replace(/\s+/g, ' ').trim()
              const catObj = CATEGORIES.find(c => c.slug === product.categorySlug || c.id === product.categorySlug)
              // Prefer per-lang specs for badge display; selection stays on canonical UA specs inside extractBadges
              const pSpecs = (lang !== 'uk' && product[`specs_${lang}`]) ? product[`specs_${lang}`] : product.specs
              const badges = extractBadges(product, pSpecs, lang)
              const href = `/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`

              return (
                <motion.div key={product.id} variants={fadeUp} initial="hidden" animate="show"
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }} className="h-full">
                  {/* 1. Фіксована висота фото: overflow-hidden + height строго 240px */}
                  <div className="product-card-new group flex flex-col" style={{ height: '100%' }}>

                    <div className="relative flex-shrink-0 overflow-hidden bg-[var(--bg)]" style={{ height: '240px' }}>
                      <LLink to={href} className="block w-full h-full">
                        {product.image ? (
                          <img src={imgUrl(product.image)} alt={name} loading="lazy" decoding="async"
                            className="pdp-card-photo group-hover:scale-[1.06] transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl">⚙️</div>
                        )}
                      </LLink>

                      {isOnSale(product) && (
                        <span className="absolute top-2 right-2 z-10 text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full">
                          {t('catalog.saleBadge')}
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-gray-700 text-white rounded-full">
                          {t('catalog.outOfStock')}
                        </span>
                      )}

                      <div className="quick-bar">
                        <button onClick={() => addToCart(product)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                          style={{ background: 'linear-gradient(135deg,var(--accent),#c94d00)' }}>
                          <ShoppingCart size={12} /> {t('catalog.buyOneClick')}
                        </button>
                        <LLink to={href}
                          className="flex items-center gap-1 px-3 h-9 border border-[var(--ink-200)] rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 text-xs font-semibold whitespace-nowrap">
                          {t('catalog.details')} <ArrowRight size={11} />
                        </LLink>
                      </div>
                    </div>

                    {/* Content area: flex-col з фіксованим низом */}
                    <div className="p-4 flex flex-col flex-1">

                      {/* Верхній блок: назва + опис + badges */}
                      <div className="flex-1">
                        {catObj && (
                          <div className="eyebrow mb-1.5 truncate">{catObj.name[lang] || catObj.name.uk}</div>
                        )}
                        <LLink to={href}>
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors mb-2 leading-snug">
                            {name}
                          </h3>
                        </LLink>
                        {/* 2. Опис без слова "Опис" */}
                        {shortDesc && (
                          <p className="text-xs text-gray-400 leading-relaxed mb-2.5 line-clamp-2">{shortDesc}</p>
                        )}
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {badges.map((b, i) => (
                              <span key={i} className={`spec-badge spec-badge-${b.type}`}>{b.label}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. Ціна — завжди на одному рівні (прибита до низу) */}
                      <div className="mt-4 pt-3 border-t border-[var(--ink-200)]">
                        <div className="flex items-center justify-between mb-1.5">
                          <ProductPrice product={product} eurRate={eurRate} />
                          <div className={`text-[10px] font-semibold flex items-center gap-1 ${product.inStock ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: product.inStock ? '#22c55e' : '#9ca3af' }} />
                            {product.inStock ? t('catalog.inStock') : t('catalog.orderShort')}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-gray-300">{product.sku || ''}</div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div className="flex flex-col gap-3">
            {filtered.map((product, i) => {
              const name = (lang !== 'uk' && product[`name_${lang}`]) ? product[`name_${lang}`] : (product.name || '')
              // Prefer per-lang shortDesc/desc, fall back to UA
              const rawDesc2 = (lang !== 'uk' && (product[`shortDesc_${lang}`] || product[`desc_${lang}`]))
                ? (product[`shortDesc_${lang}`] || product[`desc_${lang}`])
                : (product.shortDesc || product.description || '')
              const shortDesc = rawDesc2.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/^Опис\s+/i, '').replace(/^(моделі|Опис моделі)\s+/i, '').replace(/\s+/g, ' ').trim()
              const catObj = CATEGORIES.find(c => c.slug === product.categorySlug || c.id === product.categorySlug)
              // Prefer per-lang specs for badge display; selection stays on canonical UA specs inside extractBadges
              const pSpecs = (lang !== 'uk' && product[`specs_${lang}`]) ? product[`specs_${lang}`] : product.specs
              const badges = extractBadges(product, pSpecs, lang)
              const href = `/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`

              return (
                <motion.div key={product.id} variants={fadeUp} initial="hidden" animate="show"
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}>
                  <div className="product-card-new group flex flex-row gap-0 overflow-hidden">

                    {/* Image */}
                    <LLink to={href} className="flex-shrink-0 bg-[var(--bg)] flex items-center justify-center overflow-hidden w-[104px] sm:w-[140px] min-h-[120px]">
                      {product.image ? (
                        <img src={imgUrl(product.image)} alt={name} loading="lazy" decoding="async"
                          className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="text-gray-200 text-5xl">⚙️</div>
                      )}
                    </LLink>

                    {/* Content */}
                    <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-between border-l border-[var(--ink-200)]">
                      <div>
                        {catObj && (
                          <div className="eyebrow mb-1">{catObj.name[lang] || catObj.name.uk}</div>
                        )}
                        <LLink to={href}>
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors leading-snug mb-1.5">
                            {name}
                          </h3>
                        </LLink>
                        {shortDesc && (
                          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-2">{shortDesc}</p>
                        )}
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {badges.map((b, i) => (
                              <span key={i} className={`spec-badge spec-badge-${b.type}`}>{b.label}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--ink-200)] flex-wrap">
                        <span className="text-[10px] font-mono text-gray-400">{product.sku || '—'}</span>
                        <span className={`text-[10px] font-semibold flex items-center gap-1 ${product.inStock ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: product.inStock ? '#22c55e' : '#9ca3af' }} />
                          {product.inStock ? t('catalog.inStock') : t('catalog.outOfStock')}
                        </span>
                        {/* Ціна — інлайн лише на мобільному */}
                        <span className="sm:hidden ml-auto">
                          <ProductPrice product={product} eurRate={eurRate} />
                        </span>
                      </div>
                      {/* Дії — лише на мобільному (на десктопі вони у правій колонці) */}
                      <div className="flex sm:hidden gap-1.5 mt-2.5">
                        <button onClick={() => addToCart(product)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-white text-xs font-bold py-2 px-3 rounded-lg"
                          style={{ background: 'linear-gradient(135deg,var(--accent),#c94d00)' }}>
                          <ShoppingCart size={12} /> {t('catalog.addToCart')}
                        </button>
                        <LLink to={href}
                          className="flex items-center justify-center gap-1 py-2 px-3 border border-gray-200 rounded-lg text-gray-600 text-xs font-semibold">
                          {t('catalog.details')} <ArrowRight size={11} />
                        </LLink>
                      </div>
                    </div>

                    {/* Price + actions — лише на десктопі */}
                    <div className="hidden sm:flex flex-shrink-0 flex-col items-end justify-between p-4 border-l border-[var(--ink-200)] min-w-[140px]">
                      <div className="text-right">
                        <ProductPrice product={product} eurRate={eurRate} />
                      </div>
                      <div className="flex flex-col gap-1.5 w-full mt-3">
                        <button onClick={() => addToCart(product)}
                          className="flex items-center justify-center gap-1.5 text-white text-xs font-bold py-2 px-3 w-full rounded-lg transition-colors"
                          style={{ background: 'linear-gradient(135deg,var(--accent),#c94d00)' }}>
                          <ShoppingCart size={12} /> {t('catalog.addToCart')}
                        </button>
                        <LLink to={href}
                          className="flex items-center justify-center gap-1 py-2 px-3 border border-gray-200 rounded-lg hover:border-[var(--primary)] text-gray-600 hover:text-[var(--primary)] text-xs font-semibold transition-colors w-full">
                          {t('catalog.details')} <ArrowRight size={11} />
                        </LLink>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        </div>{/* end flex-1 */}
        </div>{/* end flex gap-6 */}

      </div>
    </>
  )
}
