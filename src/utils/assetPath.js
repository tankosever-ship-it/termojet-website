const base = import.meta.env.BASE_URL || '/'

export function assetPath(path) {
  const clean = path.startsWith('/') ? path.slice(1) : path
  return base.endsWith('/') ? base + clean : base + '/' + clean
}
