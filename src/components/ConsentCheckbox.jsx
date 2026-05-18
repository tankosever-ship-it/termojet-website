import { Link } from 'react-router-dom'

export default function ConsentCheckbox({ register, error }) {
  const props = register ? register('consent', { required: true }) : { required: true }
  return (
    <div>
      <label className="flex items-start gap-2 cursor-pointer">
        <input type="checkbox" {...props} className="mt-0.5 accent-[var(--primary)]" />
        <span className="text-xs text-gray-500 leading-relaxed">
          Я погоджуюсь на обробку{' '}
          <Link to="/privacy" className="text-[var(--primary)] underline hover:no-underline" target="_blank">
            персональних даних
          </Link>
        </span>
      </label>
      {error && <p className="text-xs text-red-500 mt-1">Потрібна ваша згода</p>}
    </div>
  )
}
