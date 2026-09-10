import Button from '@/components/ui/button/Button.jsx'
import Spinner from '@/components/ui/spinner/Spinner.jsx'
const mergeClasses = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
export default function InputButton({
  processing,
  disabled = false,
  className,
  label,
  ...props
}) {
  return (
    <Button
      disabled={disabled || processing}
      aria-busy={processing}
      type="submit"
      className={mergeClasses(
        'hover:bg-brand active:bg-brand dark:bg-brand dark:hover:bg-brand dark:active:bg-brand border-brand bg-brand relative flex items-center justify-center rounded-md border px-4 py-3 text-base font-normal text-white dark:text-white',
        'disabled:text-gray disabled:cursor-not-allowed disabled:border-gray-200/40 disabled:bg-gray-200/40 disabled:opacity-100',
        className
      )}
      {...props}
    >
      {processing && <Spinner className="absolute h-5 w-5 text-white" />}
      <span className={processing ? 'text-transparent' : undefined}>
        {label ? label : 'Submit'}
      </span>
    </Button>
  )
}
