import { useState, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ChevronRight, X, ShoppingCart, LayoutGrid, List, ArrowRight } from 'lucide-react'
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

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { show: { transition: { staggerChildren: 0.04 } } }

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

function Sidebar({ categorySlug, filters, setFilters, priceBounds, price, setPrice }) {
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
            Фільтри
          </span>
          {hasAny && (
            <button onClick={() => { setFilters({}); setPrice(null) }}
              className="flex items-center gap-1 transition-colors hover:text-[var(--accent)]"
              style={{ ...mono, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              <X size={10} /> Скинути
            </button>
          )}
        </div>

        <div className="p-3 space-y-5 overflow-y-auto overscroll-contain flex-1">

          {/* Ціна (#5) */}
          {hasPrice && (
            <div>
              <div className="mb-2 px-1 flex items-center justify-between"
                style={{ ...mono, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
                <span>Ціна, ₴</span>
              </div>
              <div className="px-1">
                <div className="flex items-center justify-between mb-1.5" style={{ ...mono, fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>
                  <span>{fmt(lo)}</span><span>{fmt(hi)}</span>
                </div>
                <input type="range" min={priceBounds[0]} max={priceBounds[1]} value={lo}
                  onChange={e => setPrice([Math.min(+e.target.value, hi), hi])}
                  className="w-full" style={{ accentColor: 'var(--accent)' }} aria-label="Ціна від" />
                <input type="range" min={priceBounds[0]} max={priceBounds[1]} value={hi}
                  onChange={e => setPrice([lo, Math.max(+e.target.value, lo)])}
                  className="w-full" style={{ accentColor: 'var(--accent)' }} aria-label="Ціна до" />
              </div>
            </div>
          )}

          {/* Filter groups */}
          {config && config.groups.map(group => (
            <div key={group.key}>
              <div className="mb-2 px-1"
                style={{ ...mono, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
                {group.label}
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
                        {opt.label}
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

function extractBadges(product) {
  const badges = []
  const name = product.name || ''
  const specs = product.specs || {}
  const cat = product.categorySlug || ''

  const specKeys = Object.keys(specs)
  if (specKeys.length > 0) {
    const sku = String(product.sku || '').trim().toLowerCase()
    const cleanVal = raw => String(raw).split(/[,;]\s+/)[0].trim() // не ріже десяткову кому «7,2»
    const valBad = v => !v || v.length > 32 || BADGE_EXCLUDE_VALS.includes(v.toLowerCase()) || v.toLowerCase() === sku
    const keyBad = k => BADGE_EXCLUDE_KEYS.some(e => k.toLowerCase().includes(e))
    // голі числа → осмислена мітка за змістом ключа (DN15, «2 виходи»)
    const fmtVal = (lk, v) => {
      if (/пропускна|здатн/.test(lk)) return v + ' м³/год'
      if (/^\d+$/.test(v)) {
        if (/\bdn\b|діаметр|розмір/.test(lk)) return 'DN' + v
        if (/контур/.test(lk)) return v + ' контури'
        if (/виход/.test(lk)) return v + ' виходи'
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
      if (BADGE_BOOL_KEYS.some(b => lk.includes(b))) {
        const v = cleanVal(specs[k]).toLowerCase()
        if (['ні', 'немає', '-', ''].includes(v)) continue
        if (['так', '+', 'є'].includes(v)) { push(k.replace(/[:(].*$/, '').trim()); continue }
        // інакше — справжнє значення (напр. «2.4 GHz»)
      }
      const v = cleanVal(specs[k])
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
        {currentCategory && CATEGORY_BANNERS[currentCategory.slug] && (
          <>
            <img src={assetPath(CATEGORY_BANNERS[currentCategory.slug])} alt="" aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: 'center right' }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to right, rgba(8,7,6,0.70) 0%, rgba(8,7,6,0.48) 45%, rgba(8,7,6,0.18) 100%)' }} />
          </>
        )}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(232,93,4,0.4)] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
            <Link to="/" className="hover:text-white/70 transition-colors">Головна</Link>
            <ChevronRight size={12} />
            {currentCategory ? (
              <>
                <Link to="/catalog" className="hover:text-white/70 transition-colors">Каталог</Link>
                <ChevronRight size={12} />
                <span className="text-white/70">{currentCategory.name[lang] || currentCategory.name.uk}</span>
              </>
            ) : (
              <span className="text-white/70">Каталог</span>
            )}
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black font-['Archivo',sans-serif]">
                {currentCategory ? (currentCategory.name[lang] || currentCategory.name.uk) : cat.title}
              </h1>
              {currentCategory && (
                <p className="text-white/60 mt-1.5 text-sm">{currentCategory.desc[lang] || currentCategory.desc.uk}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-black font-['Archivo',sans-serif]">{filtered.length}</div>
              <div className="text-white/50 text-xs">товарів</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Смужка плиток-категорій (стиль Prom) ── */}
        <div className="mb-6 -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-3 cat-strip snap-x">
            {/* Плитка "Всі категорії" */}
            <Link to="/catalog"
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
                  Всі категорії
                </div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {products.length}
                </div>
              </div>
            </Link>

            {CATEGORIES.map(c => {
              const isActive = currentCategory?.id === c.id
              const n = catCounts[c.id] || 0
              const src = (c.image || '').startsWith('/') ? assetPath(c.image) : c.image
              return (
                <Link key={c.id} to={`/catalog/${c.slug}`}
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
                </Link>
              )
            })}
          </div>
        </div>

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
              title="Сітка">
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`px-3 py-2 transition-colors border-l border-gray-200 ${viewMode === 'list' ? 'bg-[var(--primary)] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              title="Список">
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Result count */}
        <div className="text-xs text-gray-400 font-mono mb-4">
          Знайдено: <span className="font-bold text-gray-600">{filtered.length}</span> товарів
          {(search || inStockOnly || price || Object.values(catFilters).some(v => Array.isArray(v) ? v.length : v)) && (
            <button onClick={() => { setSearch(''); setInStockOnly(false); setCatFilters({}); setPrice(null) }}
              className="ml-3 text-[var(--accent)] hover:underline">
              скинути фільтри
            </button>
          )}
        </div>

        {/* ── Products ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold mb-2 text-gray-600">{cat.noResults}</p>
            <p className="text-sm">Спробуйте змінити параметри пошуку</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── GRID VIEW ── */
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(product => {
              const name = (lang !== 'uk' && product[`name_${lang}`]) ? product[`name_${lang}`] : (product.name || '')
              // 2. Strip leading "Опис " prefix from shortDesc
              const rawDesc = product.shortDesc || product.description || ''
              const shortDesc = rawDesc.replace(/^Опис\s+/i, '').replace(/^(моделі|Опис моделі)\s+/i, '')
              const catObj = CATEGORIES.find(c => c.slug === product.categorySlug || c.id === product.categorySlug)
              const badges = extractBadges(product)
              const href = `/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`

              return (
                <motion.div key={product.id} variants={fadeUp} className="h-full">
                  {/* 1. Фіксована висота фото: overflow-hidden + height строго 240px */}
                  <div className="product-card-new group flex flex-col" style={{ height: '100%' }}>

                    <div className="relative flex-shrink-0 overflow-hidden bg-[var(--bg)]" style={{ height: '240px' }}>
                      <Link to={href} className="block w-full h-full">
                        {product.image ? (
                          <img src={imgUrl(product.image)} alt={name} loading="lazy" decoding="async"
                            className="w-full h-full object-contain p-4 group-hover:scale-[1.06] transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl">⚙️</div>
                        )}
                      </Link>

                      {isOnSale(product) && (
                        <span className="absolute top-2 right-2 z-10 text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full">
                          Акція
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-gray-700 text-white rounded-full">
                          Під замовлення
                        </span>
                      )}

                      <div className="quick-bar">
                        <button onClick={() => addToCart(product)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                          style={{ background: 'linear-gradient(135deg,var(--accent),#c94d00)' }}>
                          <ShoppingCart size={12} /> Купити в 1 клік
                        </button>
                        <Link to={href}
                          className="flex items-center gap-1 px-3 h-9 border border-[var(--ink-200)] rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 text-xs font-semibold whitespace-nowrap">
                          Детальніше <ArrowRight size={11} />
                        </Link>
                      </div>
                    </div>

                    {/* Content area: flex-col з фіксованим низом */}
                    <div className="p-4 flex flex-col flex-1">

                      {/* Верхній блок: назва + опис + badges */}
                      <div className="flex-1">
                        {catObj && (
                          <div className="eyebrow mb-1.5 truncate">{catObj.name[lang] || catObj.name.uk}</div>
                        )}
                        <Link to={href}>
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors mb-2 leading-snug">
                            {name}
                          </h3>
                        </Link>
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
                            {product.inStock ? 'В наявності' : 'Замовлення'}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-gray-300">{product.sku || ''}</div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          /* ── LIST VIEW ── */
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-3">
            {filtered.map(product => {
              const name = (lang !== 'uk' && product[`name_${lang}`]) ? product[`name_${lang}`] : (product.name || '')
              const rawDesc2 = product.shortDesc || product.description || ''
              const shortDesc = rawDesc2.replace(/^Опис\s+/i, '').replace(/^(моделі|Опис моделі)\s+/i, '')
              const catObj = CATEGORIES.find(c => c.slug === product.categorySlug || c.id === product.categorySlug)
              const badges = extractBadges(product)
              const href = `/catalog/${product.categorySlug || 'products'}/${product.slug || product.id}`

              return (
                <motion.div key={product.id} variants={fadeUp}>
                  <div className="product-card-new group flex flex-row gap-0 overflow-hidden">

                    {/* Image */}
                    <Link to={href} className="flex-shrink-0 bg-[var(--bg)] flex items-center justify-center overflow-hidden w-[104px] sm:w-[140px] min-h-[120px]">
                      {product.image ? (
                        <img src={imgUrl(product.image)} alt={name} loading="lazy" decoding="async"
                          className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="text-gray-200 text-5xl">⚙️</div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-between border-l border-[var(--ink-200)]">
                      <div>
                        {catObj && (
                          <div className="eyebrow mb-1">{catObj.name[lang] || catObj.name.uk}</div>
                        )}
                        <Link to={href}>
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors leading-snug mb-1.5">
                            {name}
                          </h3>
                        </Link>
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
                          {product.inStock ? 'В наявності' : 'Під замовлення'}
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
                          <ShoppingCart size={12} /> В кошик
                        </button>
                        <Link to={href}
                          className="flex items-center justify-center gap-1 py-2 px-3 border border-gray-200 rounded-lg text-gray-600 text-xs font-semibold">
                          Детальніше <ArrowRight size={11} />
                        </Link>
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
                          <ShoppingCart size={12} /> В кошик
                        </button>
                        <Link to={href}
                          className="flex items-center justify-center gap-1 py-2 px-3 border border-gray-200 rounded-lg hover:border-[var(--primary)] text-gray-600 hover:text-[var(--primary)] text-xs font-semibold transition-colors w-full">
                          Детальніше <ArrowRight size={11} />
                        </Link>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        </div>{/* end flex-1 */}
        </div>{/* end flex gap-6 */}

      </div>
    </>
  )
}
