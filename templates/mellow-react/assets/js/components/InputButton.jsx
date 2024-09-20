const mergeClasses = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
export default function InputButton({
  processing,
  className,
  label,
  ...props
}) {
  return (
    <button
      type="submit"
      className={mergeClasses(
        'relative flex items-center justify-center rounded-md border border-brand bg-brand px-4 py-3 text-white',
        'disabled:cursor-not-allowed disabled:border-gray-200/40 disabled:bg-gray-200/40 disabled:text-gray',
        className
      )}
      {...props}
    >
      {processing && (
        <svg
          className="absolute h-5 w-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      <span className={processing ? 'invisible' : undefined}>
        {label ? label : 'Submit'}
      </span>
    </button>
  )
}
