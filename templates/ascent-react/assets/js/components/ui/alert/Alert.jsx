import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const BASE_CLASSES =
  'relative w-full rounded-md bg-gray-100 p-4 text-sm text-gray-950 dark:bg-gray-900 dark:text-white'

const Alert = forwardRef(function Alert(
  { as: Component = 'div', className, 'data-slot': _dataSlot, ...props },
  ref
) {
  return (
    <Component
      {...props}
      ref={ref}
      data-slot="alert"
      className={twMerge(BASE_CLASSES, className)}
    />
  )
})

export default Alert
