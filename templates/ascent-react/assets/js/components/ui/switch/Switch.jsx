import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

const BASE_CLASSES = [
  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full border-0 bg-gray-300 p-0 outline-none transition-colors duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] after:pointer-events-none after:absolute after:left-0.5 after:top-1/2 after:block after:size-5 after:rounded-full after:bg-white after:transform-[translate(0,-50%)] after:[transition-property:transform] after:duration-200 after:ease-[cubic-bezier(0.32,0.72,0,1)] after:content-['']",
  'checked:bg-gray-950 checked:after:transform-[translate(1.25rem,-50%)]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-red-600 aria-invalid:focus-visible:outline-red-600',
  'motion-reduce:duration-100 motion-reduce:ease-out motion-reduce:after:duration-100 motion-reduce:after:ease-out',
  'dark:bg-gray-700 dark:checked:bg-white dark:checked:after:bg-gray-950 dark:focus-visible:outline-white dark:aria-invalid:outline-red-500',
  'forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:checked:bg-[Highlight] forced-colors:after:bg-[CanvasText] forced-colors:checked:after:bg-[HighlightText]'
]

const Switch = forwardRef(function Switch(
  {
    checked,
    defaultChecked = false,
    disabled = false,
    'aria-invalid': ariaInvalid,
    'aria-checked': _ariaChecked,
    className,
    onChange,
    role: _role,
    type: _type,
    'data-slot': _dataSlot,
    'data-state': _dataState,
    'data-disabled': _dataDisabled,
    'data-invalid': _dataInvalid,
    ...props
  },
  forwardedRef
) {
  const localRef = useRef(null)
  const controlled = checked !== undefined
  const [localChecked, setLocalChecked] = useState(Boolean(defaultChecked))
  const resolvedChecked = controlled ? Boolean(checked) : localChecked
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  useEffect(() => {
    const node = localRef.current
    const form = node?.form
    if (!form || controlled) return

    function handleReset() {
      queueMicrotask(() => setLocalChecked(Boolean(node.checked)))
    }

    form.addEventListener('reset', handleReset)
    return () => form.removeEventListener('reset', handleReset)
  }, [controlled])

  const setElement = useCallback(
    (node) => {
      localRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef]
  )

  function handleChange(event) {
    if (!controlled) setLocalChecked(Boolean(event.target.checked))
    onChange?.(event)
  }

  return (
    <input
      {...props}
      ref={setElement}
      type="checkbox"
      role="switch"
      checked={controlled ? Boolean(checked) : undefined}
      defaultChecked={controlled ? undefined : Boolean(defaultChecked)}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      data-slot="switch"
      data-state={resolvedChecked ? 'checked' : 'unchecked'}
      data-disabled={disabled ? '' : undefined}
      data-invalid={invalid ? '' : undefined}
      className={twMerge(BASE_CLASSES, className)}
      onChange={handleChange}
    />
  )
})

export default Switch
