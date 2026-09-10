import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const BASE_CLASSES =
  'inline-flex items-center gap-1.5 rounded-full border border-transparent bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 text-nowrap forced-colors:border-current dark:bg-gray-800 dark:text-gray-300'

const Badge = forwardRef(function Badge(
  { className, 'data-slot': _dataSlot, ...props },
  ref
) {
  return (
    <span
      {...props}
      ref={ref}
      data-slot="badge"
      className={twMerge(BASE_CLASSES, className)}
    />
  )
})

export default Badge
