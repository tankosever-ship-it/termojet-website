const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

export function captureUTM() {
  const params = new URLSearchParams(window.location.search)
  const utm = {}
  UTM_KEYS.forEach(k => { if (params.has(k)) utm[k] = params.get(k) })
  if (Object.keys(utm).length) sessionStorage.setItem('tj_utm', JSON.stringify(utm))
}

export function getUTM() {
  try { return JSON.parse(sessionStorage.getItem('tj_utm') || '{}') } catch { return {} }
}
