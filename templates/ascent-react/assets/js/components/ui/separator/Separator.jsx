import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const BASE_CLASSES =
  'shrink-0 border-0 bg-gray-200 forced-colors:bg-current dark:bg-gray-800'

const Separator = forwardRef(function Separator(
  {
    orientation = 'horizontal',
    className,
    role: _role,
    'aria-orientation': _ariaOrientation,
    'data-orientation': _dataOrientation,
    'data-slot': _dataSlot,
    ...props
  },
  ref
) {
  const isVertical = orientation === 'vertical'
  const Component = isVertical ? 'div' : 'hr'

  return (
    <Component
      {...props}
      ref={ref}
      data-slot="separator"
      data-orientation={isVertical ? 'vertical' : 'horizontal'}
      role={isVertical ? 'separator' : undefined}
      aria-orientation={isVertical ? 'vertical' : undefined}
      className={twMerge(
        BASE_CLASSES,
        isVertical ? 'w-px self-stretch' : 'h-px w-full',
        className
      )}
    />
  )
})

export default Separator
