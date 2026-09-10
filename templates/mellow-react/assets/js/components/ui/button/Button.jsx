import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const BASE_CLASSES = [
  'inline-flex min-h-11 min-w-11 cursor-pointer select-none items-center justify-center gap-2 rounded-md no-underline',
  'bg-gray-950 px-4 py-2 text-sm font-medium text-nowrap text-white',
  'transition-colors duration-150 ease-out',
  'hover:bg-gray-800 active:bg-gray-700',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 dark:focus-visible:outline-gray-400',
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  'aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
  'dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 dark:active:bg-gray-200',
  'motion-reduce:transition-none'
]

const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    type = 'button',
    disabled = false,
    className,
    onClick,
    onKeyDown,
    tabIndex,
    'aria-disabled': ariaDisabled,
    children,
    ...props
  },
  ref
) {
  const isNativeButton = Component === 'button'

  function handleClick(event) {
    if (disabled && !isNativeButton) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    onClick?.(event)
  }

  function handleKeyDown(event) {
    if (disabled && !isNativeButton && ['Enter', ' '].includes(event.key)) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    onKeyDown?.(event)
  }

  return (
    <Component
      {...props}
      ref={ref}
      type={isNativeButton ? type : undefined}
      disabled={isNativeButton ? disabled : undefined}
      aria-disabled={
        isNativeButton ? undefined : disabled ? true : ariaDisabled
      }
      tabIndex={!isNativeButton && disabled ? -1 : tabIndex}
      data-disabled={disabled ? '' : undefined}
      data-slot="button"
      className={twMerge(BASE_CLASSES, className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </Component>
  )
})

export default Button
