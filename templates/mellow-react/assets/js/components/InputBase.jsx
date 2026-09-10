import { twMerge } from 'tailwind-merge'
import Input from '@/components/ui/input/Input.jsx'
import WarningTriangle from '@/components/ui/icons/WarningTriangle.jsx'
import '~/css/forms.css'

export default function InputBase({
  label,
  id,
  icon,
  suffix,
  type,
  placeholder,
  error = '',
  className,
  ...props
}) {
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="block space-y-1.5">
      <label htmlFor={id} className="block text-base font-medium text-gray-900">
        {label}
      </label>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center">
          {icon}
        </span>
        <Input
          id={id}
          className={twMerge(
            `placeholder:text-gray min-h-12 block w-full rounded-lg border bg-white py-3 pl-11 pr-10 text-base shadow-none transition-colors placeholder:text-base focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-300 bg-red-50/40 text-red-950 focus:border-red-500 focus:ring-red-100'
                : 'border-gray/50 focus:ring-gray-100'
            }`,
            className
          )}
          type={type}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          {...props}
        />
        {suffix ? suffix : null}
      </span>
      {error ? (
        <p
          id={errorId}
          className="flex max-w-full items-start gap-1.5 break-words text-sm leading-5 text-red-600"
          role="alert"
        >
          <WarningTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}
