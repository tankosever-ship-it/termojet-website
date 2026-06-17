// i18n key merger — deep-merges new translation keys into src/i18n/translations.js
// Usage: node scripts/i18n-merge.mjs <additions.json> [<more.json> ...]
//
// additions.json shape (namespace -> nested keys -> per-lang leaf):
//   { "navbar": { "becomePartner": { "uk":"...", "en":"...", "pl":"...", "fr":"...", "de":"..." } } }
// A node is a LEAF when it has a string "uk" property; otherwise it is recursed.
import fs from 'fs'
import { T, LANGS } from '../src/i18n/translations.js'

const LANG_CODES = ['uk', 'en', 'pl', 'fr', 'de']
const files = process.argv.slice(2)
if (!files.length) { console.error('no additions files given'); process.exit(1) }

// Expand any dotted keys ("a.b.c") into nested objects, recursively.
// Guards against agents emitting flat dotted keys instead of nested objects.
const expand = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj
  if (typeof obj.uk === 'string') return obj // leaf
  const out = {}
  for (const rawKey of Object.keys(obj)) {
    const val = expand(obj[rawKey])
    const parts = rawKey.split('.')
    let node = out
    for (let i = 0; i < parts.length - 1; i++) node = (node[parts[i]] ??= {})
    const last = parts[parts.length - 1]
    if (node[last] && typeof node[last] === 'object' && typeof val === 'object' && typeof val.uk !== 'string') {
      Object.assign(node[last], val)
    } else {
      node[last] = val
    }
  }
  return out
}

const isLeaf = (o) => o && typeof o === 'object' && !Array.isArray(o) && typeof o.uk === 'string'
const localize = (node, lang) => {
  if (isLeaf(node)) return node[lang] ?? node.uk
  const out = {}
  for (const k of Object.keys(node)) out[k] = localize(node[k], lang)
  return out
}
const deepMerge = (target, src) => {
  for (const k of Object.keys(src)) {
    if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) &&
        target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
      deepMerge(target[k], src[k])
    } else {
      target[k] = src[k]
    }
  }
}

let added = 0
const countLeaves = (o) => { let n = 0; for (const k in o) { if (isLeaf(o[k])) n++; else n += countLeaves(o[k]) } return n }
for (const file of files) {
  const additions = expand(JSON.parse(fs.readFileSync(file, 'utf-8')))
  added += countLeaves(additions)
  for (const lang of LANG_CODES) deepMerge(T[lang], localize(additions, lang))
}

const out =
  `export const LANGS = ${JSON.stringify(LANGS, null, 2)}\n\n` +
  `export const T = ${JSON.stringify(T, null, 2)}\n`
fs.writeFileSync(new URL('../src/i18n/translations.js', import.meta.url), out)
console.log(`merged ${added} leaf keys from ${files.length} file(s) into translations.js`)
