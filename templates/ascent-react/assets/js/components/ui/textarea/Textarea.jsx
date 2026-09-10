import { forwardRef, useCallback, useLayoutEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

const BASE_CLASSES = [
  'block h-(--klean-textarea-height) min-h-28 w-full resize-none overflow-y-hidden rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-950 shadow-sm outline-none transition-colors duration-150',
  'placeholder:text-gray-500 hover:border-gray-400',
  'focus-visible:border-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950',
  'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
  'aria-invalid:border-red-600 aria-invalid:focus-visible:outline-red-600',
  'dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-400 dark:hover:border-gray-600 dark:focus-visible:border-white dark:focus-visible:outline-white dark:disabled:bg-gray-900 dark:disabled:text-gray-500 dark:aria-invalid:border-red-500 dark:aria-invalid:focus-visible:outline-red-500',
  'motion-reduce:transition-none'
]

const Textarea = forwardRef(function Textarea(
  { value, defaultValue, className, onInput, ...props },
  ref
) {
  const element = useRef(null)

  const setRefs = useCallback(
    (node) => {
      element.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  const resizeToContent = useCallback(() => {
    if (!element.current) return
    element.current.style.removeProperty('--klean-textarea-height')
    element.current.style.setProperty(
      '--klean-textarea-height',
      `${element.current.scrollHeight}px`
    )
  }, [])

  useLayoutEffect(() => {
    resizeToContent()
  }, [value, defaultValue, resizeToContent])

  useLayoutEffect(() => {
    if (!element.current || typeof ResizeObserver === 'undefined') return
    let width = element.current.offsetWidth
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === width) return
      width = entry.contentRect.width
      resizeToContent()
    })
    observer.observe(element.current)
    return () => observer.disconnect()
  }, [resizeToContent])

  function handleInput(event) {
    resizeToContent()
    onInput?.(event)
  }

  return (
    <textarea
      {...props}
      ref={setRefs}
      value={value}
      defaultValue={defaultValue}
      data-slot="textarea"
      className={twMerge(BASE_CLASSES, className)}
      onInput={handleInput}
    />
  )
})

export default Textarea
