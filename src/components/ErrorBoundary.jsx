import { Component } from 'react'
import { isChunkError, reloadForFreshChunks } from '../utils/chunkReload'

// Ловить помилки рендеру у піддереві (у т.ч. падіння lazy()-чанків) і не дає
// «білому екрану»: для помилок завантаження чанка — авто-перезавантаження на свіжу
// версію; для інших помилок — дружній фолбек із кнопкою «Оновити».
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, chunk: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, chunk: isChunkError(error) }
  }

  componentDidCatch(error) {
    if (isChunkError(error)) reloadForFreshChunks()
    else console.error('App error:', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const wrap = {
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24,
      textAlign: 'center', fontFamily: "'Rubik', sans-serif", color: 'var(--text-primary, #1a1a1a)',
    }

    // Помилка чанка — вже запустили reload (або cooldown). Показуємо нейтральний
    // «Оновлення…», а не порожній екран.
    if (this.state.chunk) {
      return (
        <div style={wrap}>
          <div style={{ width: 34, height: 34, border: '3px solid #FF5500', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ color: '#888', fontSize: 14 }}>Оновлення до нової версії…</div>
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      )
    }

    return (
      <div style={wrap}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Щось пішло не так</div>
        <div style={{ color: '#888', fontSize: 14, maxWidth: 360 }}>
          Сталася помилка під час завантаження сторінки. Спробуйте оновити.
        </div>
        <button onClick={() => window.location.reload()}
          style={{ marginTop: 6, background: '#FF5500', color: '#fff', border: 'none', padding: '10px 22px', fontWeight: 700, cursor: 'pointer', borderRadius: 6 }}>
          Оновити сторінку
        </button>
      </div>
    )
  }
}
