import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

const BASE_CLASSES = [
  'm-auto w-[calc(100vw-2rem)] max-w-lg overflow-hidden rounded-lg border border-gray-200 bg-white p-6 text-gray-950 shadow-xl outline-none',
  'backdrop:bg-black/50',
  'dark:border-gray-700 dark:bg-gray-950 dark:text-white'
]

const Dialog = forwardRef(function Dialog(
  {
    id,
    open: controlledOpen,
    defaultOpen = false,
    dismissible = true,
    onOpenChange,
    className,
    children,
    onBeforeToggle,
    onToggle,
    onCancel,
    onClose,
    onClick,
    ...dialogProps
  },
  forwardedRef
) {
  const dialogRef = useRef(null)
  const fallbackInvoker = useRef()
  const previousDocumentOverflow = useRef('')
  const scrollLocked = useRef(false)
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [nativeOpen, setNativeOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const desiredOpen = isControlled ? controlledOpen : internalOpen
  const controlledRef = useRef(isControlled)
  const desiredOpenRef = useRef(desiredOpen)
  const onOpenChangeRef = useRef(onOpenChange)

  controlledRef.current = isControlled
  desiredOpenRef.current = desiredOpen
  onOpenChangeRef.current = onOpenChange

  const resolveInvoker = useCallback((source, element) => {
    const activeElement =
      typeof document === 'undefined' ? undefined : document.activeElement

    return [source, activeElement].find(
      (candidate) =>
        candidate &&
        candidate !== document.body &&
        candidate !== document.documentElement &&
        candidate !== element &&
        !element.contains(candidate) &&
        candidate.isConnected &&
        typeof candidate.focus === 'function'
    )
  }, [])

  const setRef = useCallback(
    (element) => {
      dialogRef.current = element

      if (typeof forwardedRef === 'function') forwardedRef(element)
      else if (forwardedRef) forwardedRef.current = element
    },
    [forwardedRef]
  )

  const lockScroll = useCallback(() => {
    if (scrollLocked.current || typeof document === 'undefined') return
    previousDocumentOverflow.current = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    scrollLocked.current = true
  }, [])

  const unlockScroll = useCallback(() => {
    if (!scrollLocked.current || typeof document === 'undefined') return
    document.documentElement.style.overflow = previousDocumentOverflow.current
    scrollLocked.current = false
  }, [])

  const observeNativeOpen = useCallback(
    (nextOpen) => {
      const shouldNotify = desiredOpenRef.current !== nextOpen
      setNativeOpen(nextOpen)

      if (!controlledRef.current) setInternalOpen(nextOpen)
      if (nextOpen) lockScroll()
      else unlockScroll()
      if (shouldNotify) onOpenChangeRef.current?.(nextOpen)
    },
    [lockScroll, unlockScroll]
  )

  const showModal = useCallback(
    (source) => {
      const element = dialogRef.current
      if (!element || element.open) return

      fallbackInvoker.current = resolveInvoker(source, element)
      element.showModal()
      observeNativeOpen(true)
    },
    [observeNativeOpen, resolveInvoker]
  )

  const close = useCallback(
    (returnValue) => {
      const element = dialogRef.current
      if (!element?.open) return

      if (returnValue === undefined) element.close()
      else element.close(returnValue)
      observeNativeOpen(false)
    },
    [observeNativeOpen]
  )

  const requestClose = useCallback(
    (returnValue) => {
      const element = dialogRef.current
      if (!element?.open) return

      if (typeof element.requestClose === 'function') {
        if (returnValue === undefined) element.requestClose()
        else element.requestClose(returnValue)
        return
      }

      const event = new Event('cancel', { cancelable: true })
      if (element.dispatchEvent(event)) close(returnValue)
    },
    [close]
  )

  useEffect(() => {
    const element = dialogRef.current
    if (!element) return

    if (desiredOpen && !element.open) showModal()
    else if (!desiredOpen && element.open) close()
    else observeNativeOpen(element.open)
  }, [close, desiredOpen, observeNativeOpen, showModal])

  useEffect(() => {
    const element = dialogRef.current
    const root = element?.getRootNode?.() ?? document
    const supportsCommands =
      typeof HTMLButtonElement !== 'undefined' &&
      'commandForElement' in HTMLButtonElement.prototype

    if (supportsCommands || !id) return

    function handleFallbackCommand(event) {
      const button = (event.composedPath?.() ?? [event.target]).find(
        (candidate) =>
          candidate?.tagName === 'BUTTON' &&
          candidate.getAttribute('commandfor') === id
      )
      if (!button || button.matches(':disabled')) return

      const command = button.getAttribute('command')
      if (command === 'show-modal') showModal(button)
      else if (command === 'close') close(button.value)
      else if (command === 'request-close') requestClose(button.value)
    }

    root.addEventListener('click', handleFallbackCommand)
    return () => root.removeEventListener('click', handleFallbackCommand)
  }, [close, id, requestClose, showModal])

  useEffect(
    () => () => {
      if (dialogRef.current?.open) dialogRef.current.close()
      unlockScroll()
    },
    [unlockScroll]
  )

  function handleToggle(event) {
    observeNativeOpen(
      event.nativeEvent?.newState === 'open' || dialogRef.current?.open === true
    )
    onToggle?.(event)
  }

  function handleCancel(event) {
    if (!dismissible) event.preventDefault()
    onCancel?.(event)
  }

  function handleClose(event) {
    observeNativeOpen(false)

    if (fallbackInvoker.current?.isConnected) {
      fallbackInvoker.current.focus({ preventScroll: true })
    }
    fallbackInvoker.current = undefined
    onClose?.(event)
  }

  function handleClick(event) {
    onClick?.(event)

    const rect = event.currentTarget.getBoundingClientRect()
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom

    if (
      event.defaultPrevented ||
      !dismissible ||
      'closedBy' in event.currentTarget ||
      event.target !== event.currentTarget ||
      !outside
    ) {
      return
    }

    requestClose()
  }

  return (
    <dialog
      {...dialogProps}
      ref={setRef}
      id={id}
      closedby={dismissible ? 'any' : 'none'}
      data-slot="dialog"
      data-state={nativeOpen ? 'open' : 'closed'}
      className={twMerge(BASE_CLASSES, className)}
      onBeforeToggle={onBeforeToggle}
      onToggle={handleToggle}
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleClick}
    >
      {children}
    </dialog>
  )
})

export default Dialog
