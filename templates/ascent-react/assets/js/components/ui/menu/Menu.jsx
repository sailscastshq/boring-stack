import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { twMerge } from 'tailwind-merge'
import Popover from '../popover/Popover.jsx'

const ITEM_SELECTOR =
  '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]'
const TABBABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]'

function eventPath(event) {
  return (
    event.nativeEvent?.composedPath?.() ??
    event.composedPath?.() ?? [event.target]
  )
}

function itemRole(element) {
  return ['menuitem', 'menuitemcheckbox', 'menuitemradio'].includes(
    element.getAttribute('role')
  )
}

function itemIsDisabled(item) {
  return (
    item.matches(':disabled') ||
    item.getAttribute('aria-disabled') === 'true' ||
    item.hidden ||
    item.closest('[hidden]') !== null
  )
}

const Menu = forwardRef(function Menu(
  {
    id,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    placement = 'bottom-start',
    offset = 8,
    className,
    children,
    onKeyDown,
    onClickCapture,
    ...contentProps
  },
  forwardedRef
) {
  const popoverRef = useRef(null)
  const activeInvoker = useRef(null)
  const pendingFocus = useRef('first')
  const restoreOnClose = useRef(false)
  const tabExit = useRef({ pending: false, target: undefined })
  const typeahead = useRef('')
  const typeaheadTimer = useRef()
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const latestOpen = useRef(isOpen)
  latestOpen.current = isOpen

  const contentElement = useCallback(() => popoverRef.current?.content, [])

  const invokers = useCallback(() => {
    const content = contentElement()
    const root = content?.getRootNode?.() ?? document

    return [...(root.querySelectorAll?.('[popovertarget]') ?? [])].filter(
      (element) => element.getAttribute('popovertarget') === content?.id
    )
  }, [contentElement])

  const syncInvokerSemantics = useCallback(() => {
    for (const invoker of invokers()) {
      invoker.setAttribute('aria-haspopup', 'menu')
    }
  }, [invokers])

  const matchingInvoker = useCallback(
    (event) => {
      const contentId = contentElement()?.id
      if (!contentId) return undefined
      return eventPath(event).find(
        (element) => element?.getAttribute?.('popovertarget') === contentId
      )
    },
    [contentElement]
  )

  const restoreInvokerFocus = useCallback(() => {
    const invoker = activeInvoker.current?.isConnected
      ? activeInvoker.current
      : invokers()[0]
    invoker?.focus?.({ preventScroll: true })
  }, [invokers])

  const adjacentTabStop = useCallback(
    (backward) => {
      const content = contentElement()
      const invoker = activeInvoker.current?.isConnected
        ? activeInvoker.current
        : invokers()[0]
      let anchor = invoker
      let root = content?.getRootNode?.() ?? document

      while (anchor && root) {
        const stops = [
          ...(root.querySelectorAll?.(TABBABLE_SELECTOR) ?? [])
        ].filter(
          (element) =>
            !content?.contains(element) &&
            element.tabIndex >= 0 &&
            !element.matches(':disabled') &&
            !element.closest('[hidden], [inert]')
        )
        const current = stops.indexOf(anchor)
        let target

        if (current >= 0) {
          target = stops[current + (backward ? -1 : 1)]
        } else {
          const candidates = stops.filter((element) => {
            const relation = anchor.compareDocumentPosition(element)
            return backward ? Boolean(relation & 2) : Boolean(relation & 4)
          })
          target = backward ? candidates.at(-1) : candidates[0]
        }

        if (target) return target
        if (!root.host) return undefined
        anchor = root.host
        root = anchor.getRootNode?.()
      }

      return undefined
    },
    [contentElement, invokers]
  )

  const completeTabExit = useCallback(() => {
    const target = tabExit.current.target
    if (target?.isConnected) {
      target.focus({ preventScroll: true })
    } else {
      const root = contentElement()?.getRootNode?.() ?? document
      root.activeElement?.blur?.()
    }

    tabExit.current = { pending: false, target: undefined }
  }, [contentElement])

  const menuItems = useCallback(() => {
    const content = contentElement()
    if (!content) return []

    for (const element of content.querySelectorAll('button, a[href]')) {
      if (!element.hasAttribute('role'))
        element.setAttribute('role', 'menuitem')
    }

    const items = [...content.querySelectorAll(ITEM_SELECTOR)].filter(
      (element) => element.closest('[role="menu"]') === content
    )
    for (const item of items) item.tabIndex = -1
    return items
  }, [contentElement])

  const enabledItems = useCallback(
    () => menuItems().filter((item) => !itemIsDisabled(item)),
    [menuItems]
  )

  const focusedElement = useCallback(
    () =>
      contentElement()?.getRootNode?.().activeElement ?? document.activeElement,
    [contentElement]
  )

  const focusItem = useCallback(
    (item) => {
      if (!item) return
      for (const candidate of menuItems()) candidate.tabIndex = -1
      item.tabIndex = 0
      item.focus({ preventScroll: true })
    },
    [menuItems]
  )

  const focusEdge = useCallback(
    (edge = 'first') => {
      const items = enabledItems()
      const item = edge === 'last' ? items.at(-1) : items[0]
      if (item) focusItem(item)
      else contentElement()?.focus({ preventScroll: true })
    },
    [contentElement, enabledItems, focusItem]
  )

  const clearTypeahead = useCallback(() => {
    typeahead.current = ''
    clearTimeout(typeaheadTimer.current)
    typeaheadTimer.current = undefined
  }, [])

  const requestOpen = useCallback(
    (nextOpen) => {
      if (!isControlled) setInternalOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  const openMenu = useCallback(
    (edge = 'first') => {
      pendingFocus.current = edge
      if (latestOpen.current) focusEdge(edge)
      else requestOpen(true)
    },
    [focusEdge, requestOpen]
  )

  const closeMenu = useCallback(
    ({ restoreFocus = false } = {}) => {
      restoreOnClose.current ||= restoreFocus
      if (latestOpen.current) requestOpen(false)
      else if (restoreOnClose.current) {
        restoreOnClose.current = false
        queueMicrotask(restoreInvokerFocus)
      }
    },
    [requestOpen, restoreInvokerFocus]
  )

  useImperativeHandle(
    forwardedRef,
    () => ({ content: contentElement(), open: openMenu, close: closeMenu }),
    [closeMenu, contentElement, openMenu]
  )

  useEffect(() => {
    syncInvokerSemantics()

    if (isOpen) {
      focusEdge(pendingFocus.current)
      pendingFocus.current = 'first'
      return
    }

    clearTypeahead()
    menuItems()
    if (tabExit.current.pending) completeTabExit()
    else if (restoreOnClose.current) restoreInvokerFocus()
    restoreOnClose.current = false
  }, [
    clearTypeahead,
    completeTabExit,
    focusEdge,
    isOpen,
    menuItems,
    restoreInvokerFocus,
    syncInvokerSemantics
  ])

  useEffect(() => {
    const content = contentElement()
    const root = content?.getRootNode?.() ?? document

    function rememberInvoker(event) {
      const invoker = matchingInvoker(event)
      if (invoker) activeInvoker.current = invoker
    }

    function handleInvokerKeydown(event) {
      const invoker = matchingInvoker(event)
      if (!invoker || invoker.matches(':disabled')) return
      activeInvoker.current = invoker

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        openMenu(event.key === 'ArrowUp' ? 'last' : 'first')
      }
    }

    root.addEventListener('keydown', handleInvokerKeydown)
    root.addEventListener('click', rememberInvoker, true)
    syncInvokerSemantics()
    menuItems()

    const observer =
      typeof MutationObserver !== 'undefined' && content
        ? new MutationObserver(menuItems)
        : undefined
    observer?.observe(content, { childList: true, subtree: true })

    return () => {
      observer?.disconnect()
      root.removeEventListener('keydown', handleInvokerKeydown)
      root.removeEventListener('click', rememberInvoker, true)
      clearTypeahead()
    }
  }, [
    clearTypeahead,
    contentElement,
    matchingInvoker,
    menuItems,
    openMenu,
    syncInvokerSemantics
  ])

  function itemFromEvent(event) {
    const content = contentElement()
    return eventPath(event).find(
      (element) =>
        element?.nodeType === 1 &&
        itemRole(element) &&
        element.closest?.('[role="menu"]') === content
    )
  }

  function handleClick(event) {
    const item = itemFromEvent(event)
    if (!item) {
      onClickCapture?.(event)
      return
    }

    if (itemIsDisabled(item)) {
      event.preventDefault()
      event.nativeEvent.stopImmediatePropagation()
      return
    }

    closeMenu({ restoreFocus: true })
    onClickCapture?.(event)
  }

  function handleTypeahead(event) {
    if (
      event.key.length !== 1 ||
      event.key === ' ' ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return false
    }

    event.preventDefault()
    clearTimeout(typeaheadTimer.current)
    typeahead.current += event.key.toLocaleLowerCase()
    typeaheadTimer.current = setTimeout(clearTypeahead, 500)

    const items = enabledItems()
    if (!items.length) return true
    const current = items.indexOf(focusedElement())
    const ordered = [
      ...items.slice(current + 1),
      ...items.slice(0, current + 1)
    ]
    const itemText = (item) =>
      (item.getAttribute('aria-label') ?? item.textContent ?? '')
        .trim()
        .toLocaleLowerCase()
    let match = ordered.find((item) =>
      itemText(item).startsWith(typeahead.current)
    )

    if (!match && new Set(typeahead.current).size === 1) {
      typeahead.current = typeahead.current.at(-1)
      match = ordered.find((item) =>
        itemText(item).startsWith(typeahead.current)
      )
    }

    if (match) focusItem(match)
    return true
  }

  function handleKeydown(event) {
    const items = enabledItems()
    const currentIndex = items.indexOf(focusedElement())
    let nextIndex

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeMenu({ restoreFocus: true })
    } else if (event.key === 'Tab') {
      event.preventDefault()
      clearTypeahead()
      restoreOnClose.current = false
      tabExit.current = {
        pending: true,
        target: adjacentTabStop(event.shiftKey)
      }
      closeMenu()
    } else if (event.key === 'ArrowDown') {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length
    } else if (event.key === 'ArrowUp') {
      nextIndex =
        currentIndex < 0
          ? items.length - 1
          : (currentIndex - 1 + items.length) % items.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = items.length - 1
    } else if (!handleTypeahead(event)) {
      onKeyDown?.(event)
      return
    }

    if (nextIndex !== undefined && items.length) {
      event.preventDefault()
      focusItem(items[nextIndex])
    }
    onKeyDown?.(event)
  }

  return (
    <Popover
      {...contentProps}
      ref={popoverRef}
      id={id}
      open={isOpen}
      onOpenChange={requestOpen}
      placement={placement}
      offset={offset}
      role="menu"
      tabIndex={-1}
      data-slot="menu"
      className={twMerge('min-w-40 p-1', className)}
      onClickCapture={handleClick}
      onKeyDown={handleKeydown}
    >
      {typeof children === 'function'
        ? children({ open: isOpen, close: closeMenu })
        : children}
    </Popover>
  )
})

export default Menu
