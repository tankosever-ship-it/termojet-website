import { useT } from '../i18n/useT'
import LLink from './LLink'

// Інлайн-текст згоди на обробку персональних даних (без чекбокса).
// buttonLabel — назва кнопки сабміту відповідної форми.
export default function ConsentCheckbox({ buttonLabel = 'Надіслати' }) {
  const t = useT()
  return (
    <p className="text-xs text-gray-500 leading-relaxed">
      {t('consent.agreePrefix').replace('{buttonLabel}', buttonLabel)}{' '}
      <LLink to="/privacy" className="text-[var(--primary)] underline hover:no-underline" target="_blank">
        {t('footer.privacy')}
      </LLink>.
    </p>
  )
}
