import { useApp } from '../context/AppContext'
import { T } from './translations'

export function useT() {
  const { lang } = useApp()
  const dict = T[lang] ?? T.uk
  return function t(key) {
    const keys = key.split('.')
    let v = dict
    for (const k of keys) v = v?.[k]
    return v ?? key
  }
}
