import {
  autoUpdate,
  computePosition,
  flip,
  offset as floatingOffset,
  shift
} from '@floating-ui/dom'
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { twMerge } from 'tailwind-merge'

const BASE_CLASSES = [
  'z-50 m-0 w-max max-w-[calc(100vw-1rem)] rounded-md border border-gray-200 bg-white p-4 text-gray-950 shadow-lg outline-none',
  'dark:border-gray-700 dark:bg-gray-950 dark:text-white'
]

const Popover = forwardRef(function Popover(
  {
    id,
    open: controlledOpen,
    defaultOpen = false,
    anchor,
    onOpenChange,
    placement = 'bottom-start',
    offset = 8,
    className,
    style,
    'data-slot': dataSlot = 'popover-content',
    children,
    ...contentProps
  },
  forwardedRef
) {
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const contentId = id ?? `klean-popover-${generatedId}`
  const contentRef = useRef(null)
  const activeInvoker = useRef(null)
  const [referenceVersion, setReferenceVersion] = useState(0)
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [supportsNative, setSupportsNative] = useState(false)
  const [resolvedPlacement, setResolvedPlacement] = useState(placement)
  const [positionStyle, setPositionStyle] = useState({
    position: 'fixed',
    inset: 'auto',
    left: 0,
    top: 0
  })
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const latestOpen = useRef(isOpen)
  latestOpen.current = isOpen

  const invokers = useCallback(() => {
    const root = contentRef.current?.getRootNode?.() ?? document

    return [...(root.querySelectorAll?.('[popovertarget]') ?? [])].filter(
      (element) => element.getAttribute('popovertarget') === contentId
    )
  }, [contentId])

  const eventPath = (event) =>
    event.nativeEvent?.composedPath?.() ??
    event.composedPath?.() ?? [event.target]

  const resolveInvoker = useCallback(
    (candidate) => {
      if (candidate?.isConnected && activeInvoker.current !== candidate) {
        activeInvoker.current = candidate
        setReferenceVersion((version) => version + 1)
      }

      if (!activeInvoker.current?.isConnected) {
        const fallback = invokers()[0]
        if (activeInvoker.current !== fallback) {
          activeInvoker.current = fallback
          setReferenceVersion((version) => version + 1)
        }
      }

      return activeInvoker.current
    },
    [contentId, invokers]
  )

  const resolveAnchor = useCallback(() => {
    if (typeof anchor === 'string') {
      const root = contentRef.current?.getRootNode?.() ?? document
      const element =
        root.getElementById?.(anchor) ?? document.getElementById(anchor)

      if (element?.isConnected) return element
    } else if (anchor?.isConnected) {
      return anchor
    }

    return resolveInvoker()
  }, [anchor, resolveInvoker])

  const syncInvokerAria = useCallback(() => {
    for (const invoker of invokers()) {
      invoker.setAttribute('aria-controls', contentId)
      invoker.setAttribute('aria-expanded', String(latestOpen.current))
    }
  }, [contentId, invokers])

  const popoverIsShowing = useCallback(() => {
    if (!supportsNative || !contentRef.current) return false

    try {
      return contentRef.current.matches(':popover-open')
    } catch {
      return false
    }
  }, [supportsNative])

  const syncNativePopover = useCallback(() => {
    if (!supportsNative || !contentRef.current) return

    const showing = popoverIsShowing()

    try {
      if (latestOpen.current && !showing) {
        contentRef.current.showPopover({ source: resolveInvoker() })
      } else if (!latestOpen.current && showing) {
        contentRef.current.hidePopover()
      }
    } catch {
      // A rapid native toggle can briefly make the requested state redundant.
    }
  }, [popoverIsShowing, resolveInvoker, supportsNative])

  const requestOpen = useCallback(
    (nextOpen, { restoreFocus = false } = {}) => {
      if (!isControlled) setInternalOpen(nextOpen)
      onOpenChange?.(nextOpen)

      queueMicrotask(() => {
        syncInvokerAria()
        syncNativePopover()

        const invoker = resolveInvoker()
        if (!nextOpen && restoreFocus && invoker?.isConnected) {
          invoker.focus({ preventScroll: true })
        }
      })
    },
    [
      isControlled,
      onOpenChange,
      resolveInvoker,
      syncInvokerAria,
      syncNativePopover
    ]
  )

  useImperativeHandle(
    forwardedRef,
    () => ({
      content: contentRef.current,
      open: (source) => {
        resolveInvoker(source)
        requestOpen(true)
      },
      close: ({ restoreFocus = latestOpen.current } = {}) =>
        requestOpen(false, { restoreFocus })
    }),
    [requestOpen, resolveInvoker]
  )

  useEffect(() => {
    const native =
      typeof contentRef.current?.showPopover === 'function' &&
      typeof contentRef.current?.hidePopover === 'function'
    setSupportsNative(native)
    resolveInvoker()
    syncInvokerAria()

    if (native) return

    function handleFallbackInvokerClick(event) {
      const candidate = eventPath(event).find(
        (element) => element?.getAttribute?.('popovertarget') === contentId
      )
      if (candidate?.getAttribute('popovertarget') !== contentId) return

      resolveInvoker(candidate)
      const action = candidate.getAttribute('popovertargetaction') ?? 'toggle'

      if (action === 'show') requestOpen(true)
      else if (action === 'hide') {
        requestOpen(false, { restoreFocus: true })
      } else requestOpen(!latestOpen.current)
    }

    document.addEventListener('click', handleFallbackInvokerClick)
    return () =>
      document.removeEventListener('click', handleFallbackInvokerClick)
  }, [contentId, requestOpen, resolveInvoker, syncInvokerAria])

  useEffect(() => {
    syncInvokerAria()
    syncNativePopover()

    const anchorElement = resolveAnchor()
    if (!isOpen || !anchorElement || !contentRef.current) return

    const updatePosition = async () => {
      const result = await computePosition(anchorElement, contentRef.current, {
        placement,
        strategy: 'fixed',
        middleware: [floatingOffset(offset), flip(), shift({ padding: 8 })]
      })

      setResolvedPlacement(result.placement)
      setPositionStyle({
        position: 'fixed',
        inset: 'auto',
        left: result.x,
        top: result.y
      })
    }

    return autoUpdate(anchorElement, contentRef.current, updatePosition)
  }, [
    isOpen,
    offset,
    placement,
    referenceVersion,
    resolveAnchor,
    resolveInvoker,
    syncInvokerAria,
    syncNativePopover
  ])

  useEffect(() => {
    if (!isOpen) return

    function handleOutsidePointer(event) {
      const path = eventPath(event)
      const invoker = resolveInvoker()
      const anchorElement = resolveAnchor()

      if (
        path.includes(contentRef.current) ||
        (invoker &&
          (path.includes(invoker) || invoker.contains?.(event.target))) ||
        (anchorElement &&
          (path.includes(anchorElement) ||
            anchorElement.contains?.(event.target))) ||
        invokers().some(
          (invoker) => path.includes(invoker) || invoker.contains(event.target)
        )
      ) {
        return
      }

      requestOpen(false)
    }

    function handleEscape(event) {
      if (event.key !== 'Escape') return

      if (supportsNative) {
        const openPopovers = [...document.querySelectorAll(':popover-open')]
        if (openPopovers.at(-1) !== contentRef.current) return
      }

      event.preventDefault()
      requestOpen(false, { restoreFocus: true })
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('pointerdown', handleOutsidePointer, true)

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer, true)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [
    isOpen,
    invokers,
    requestOpen,
    resolveAnchor,
    resolveInvoker,
    supportsNative
  ])

  function handleNativeToggle(event) {
    const nativeEvent = event.nativeEvent
    const nextOpen = nativeEvent.newState === 'open'
    const shouldRestoreFocus =
      !nextOpen &&
      nativeEvent.source?.getAttribute?.('popovertargetaction') === 'hide'
    if (nextOpen) resolveInvoker(nativeEvent.source)
    if (nextOpen === latestOpen.current) return

    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
    queueMicrotask(syncInvokerAria)

    if (isControlled) queueMicrotask(syncNativePopover)

    if (shouldRestoreFocus) {
      queueMicrotask(() => {
        const invoker = resolveInvoker()
        if (invoker?.isConnected) invoker.focus({ preventScroll: true })
      })
    }
  }

  const close = ({ restoreFocus = latestOpen.current } = {}) =>
    requestOpen(false, { restoreFocus })

  return (
    <div
      {...contentProps}
      ref={contentRef}
      id={contentId}
      popover="auto"
      hidden={!supportsNative && !isOpen}
      data-slot={dataSlot}
      data-state={isOpen ? 'open' : 'closed'}
      data-placement={resolvedPlacement}
      className={twMerge(BASE_CLASSES, className)}
      style={{ ...positionStyle, ...style }}
      onToggle={handleNativeToggle}
    >
      {typeof children === 'function'
        ? children({ open: isOpen, close })
        : children}
    </div>
  )
})

export default Popover
