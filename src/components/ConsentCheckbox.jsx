import { Link } from 'react-router-dom'

// Інлайн-текст згоди на обробку персональних даних (без чекбокса).
// buttonLabel — назва кнопки сабміту відповідної форми.
export default function ConsentCheckbox({ buttonLabel = 'Надіслати' }) {
  return (
    <p className="text-xs text-gray-500 leading-relaxed">
      Натискаючи «{buttonLabel}», ви погоджуєтесь з обробкою персональних даних згідно з{' '}
      <Link to="/privacy" className="text-[var(--primary)] underline hover:no-underline" target="_blank">
        Політикою конфіденційності
      </Link>.
    </p>
  )
}
