import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { twMerge } from 'tailwind-merge'
import { toast } from './toast.js'

const POSITIONS = {
  'top-left': 'left-4 top-4 items-start',
  'top-center': 'left-1/2 top-4 -translate-x-1/2 items-center',
  'top-right': 'right-4 top-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-4 right-4 items-end'
}

const POSITION_EDGES = {
  'top-left': ['top', 'left'],
  'top-center': ['top'],
  'top-right': ['top', 'right'],
  'bottom-left': ['bottom', 'left'],
  'bottom-center': ['bottom'],
  'bottom-right': ['bottom', 'right']
}

const NEARBY_DURATION = { enter: 300, leave: 200 }
const CROSS_VIEWPORT_DURATION = { enter: 450, leave: 320 }

function motionVector(direction, position) {
  if (direction === 'fade' || direction === 'none') return ['0px', '0px']

  const nearby = POSITION_EDGES[position]?.includes(direction)
  const horizontal = direction === 'left' || direction === 'right'
  const negative = direction === 'left' || direction === 'top'
  const distance = nearby
    ? negative
      ? 'calc(-100% - 1rem)'
      : 'calc(100% + 1rem)'
    : horizontal
    ? negative
      ? '-100vw'
      : '100vw'
    : negative
    ? '-100dvh'
    : '100dvh'

  return horizontal ? [distance, '0px'] : ['0px', distance]
}

function motionDuration(phase, direction, position) {
  if (direction === 'none') return 0
  if (['fade', ...POSITION_EDGES[position]].includes(direction)) {
    return NEARBY_DURATION[phase]
  }
  return CROSS_VIEWPORT_DURATION[phase]
}

const MOTION_CSS = `
@keyframes klean-toast-enter {
  0% { opacity: 0; transform: translate3d(var(--klean-toast-enter-x), var(--klean-toast-enter-y), 0) scale(.98); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes klean-toast-leave {
  0% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  100% { opacity: 0; transform: translate3d(var(--klean-toast-leave-x), var(--klean-toast-leave-y), 0) scale(.98); }
}
@keyframes klean-toast-collapse {
  0% { grid-template-rows: 1fr; padding-block-end: .75rem; }
  100% { grid-template-rows: 0fr; padding-block-end: 0; }
}
[data-klean-toast-item][data-state="entering"] { animation: klean-toast-enter var(--klean-toast-enter-duration) ease-out both; }
[data-klean-toast-item][data-state="closing"] { animation: klean-toast-leave var(--klean-toast-leave-duration) ease-in both; pointer-events: none; }
[data-klean-toast-row][data-state="closing"] { animation: klean-toast-collapse var(--klean-toast-collapse-duration) ease-in var(--klean-toast-collapse-delay) both; overflow: hidden; }
@media (prefers-reduced-motion: reduce) {
  [data-klean-toast-item][data-state] { animation-duration: 1ms; animation-timing-function: linear; }
  [data-klean-toast-row][data-state="closing"] { animation-delay: 0ms; animation-duration: 1ms; }
}`

function motionStyle(from, to, position, style) {
  const enter = motionVector(from, position)
  const leave = motionVector(to, position)
  const enterDuration = motionDuration('enter', from, position)
  const leaveDuration = motionDuration('leave', to, position)
  const collapseDelay = Math.min(80, Math.round(leaveDuration * 0.4))

  return {
    '--klean-toast-enter-x': enter[0],
    '--klean-toast-enter-y': enter[1],
    '--klean-toast-leave-x': leave[0],
    '--klean-toast-leave-y': leave[1],
    '--klean-toast-enter-duration': `${enterDuration}ms`,
    '--klean-toast-leave-duration': `${leaveDuration}ms`,
    '--klean-toast-collapse-delay': `${collapseDelay}ms`,
    '--klean-toast-collapse-duration': `${Math.max(
      0,
      leaveDuration - collapseDelay
    )}ms`,
    ...style
  }
}

export default function Toast({
  controller = toast,
  position = 'top-right',
  from,
  to,
  label = 'Notifications',
  className,
  style,
  children,
  ...viewportProps
}) {
  const viewportRef = useRef(null)
  const promotedItemRef = useRef()
  const defaultDirection = position.endsWith('-left') ? 'left' : 'right'
  const resolvedFrom = from ?? defaultDirection
  const resolvedTo = to ?? defaultDirection
  const items = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot
  )
  const resolvedStyle = useMemo(
    () => motionStyle(resolvedFrom, resolvedTo, position, style),
    [position, resolvedFrom, resolvedTo, style]
  )

  useEffect(() => {
    const viewport = viewportRef.current
    try {
      viewport?.showPopover?.()
    } catch {
      // Already open or rejected by a partial Popover API implementation.
    }

    return () => {
      try {
        viewport?.hidePopover?.()
      } catch {
        // Already closed during teardown.
      }
    }
  }, [])

  useEffect(() => {
    const enteringItem = items.findLast((item) => item.state === 'entering')
    if (!enteringItem || enteringItem.id === promotedItemRef.current) return

    promotedItemRef.current = enteringItem.id
    const viewport = viewportRef.current
    try {
      viewport?.hidePopover?.()
    } catch {
      // Not open yet or already closed.
    }
    try {
      viewport?.showPopover?.()
    } catch {
      // Rejected by a partial Popover API implementation.
    }
  }, [items])

  useEffect(() => {
    function syncInstantMotion() {
      queueMicrotask(() => {
        for (const item of controller.getSnapshot()) {
          if (item.state === 'entering' && resolvedFrom === 'none') {
            controller.completeEnter(item.id)
          } else if (item.state === 'closing' && resolvedTo === 'none') {
            controller.remove(item.id)
          }
        }
      })
    }

    syncInstantMotion()
    return controller.subscribe(syncInstantMotion)
  }, [controller, resolvedFrom, resolvedTo])

  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) controller.pauseAll('page-hidden')
      else controller.resumeAll('page-hidden')
    }
    function handleBlur() {
      controller.pauseAll('window-blur')
    }
    function handleFocus() {
      controller.resumeAll('window-blur')
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    handleVisibility()

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      controller.resumeAll('page-hidden')
      controller.resumeAll('window-blur')
    }
  }, [controller])

  function handleAnimationEnd(item, event) {
    if (event.target !== event.currentTarget) return
    if (item.state === 'entering') controller.completeEnter(item.id)
    else if (item.state === 'closing') controller.remove(item.id)
  }

  function activateAction(item, event) {
    item.action?.onClick?.(event, item)
    controller.dismiss(item.id)
  }

  function defaultContent(item) {
    return (
      <>
        <div className="min-w-0 pt-0.5">
          {item.title ? (
            <p
              data-slot="toast-title"
              className="text-sm font-semibold leading-5"
            >
              {item.title}
            </p>
          ) : null}
          {item.message ? (
            <p
              data-slot="toast-message"
              className={twMerge(
                'text-sm leading-5 text-gray-600 dark:text-gray-300',
                item.title && 'mt-0.5'
              )}
            >
              {item.message}
            </p>
          ) : null}
          {item.action?.href ? (
            <a
              data-slot="toast-action"
              href={item.action.href}
              className={twMerge(
                'mt-2 inline-flex min-h-8 max-w-full items-center whitespace-normal text-left text-sm font-semibold text-gray-950 underline decoration-gray-300 underline-offset-4 hover:decoration-current focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:text-white dark:decoration-gray-600 dark:focus-visible:ring-white',
                item.action.class,
                item.action.className
              )}
              onClick={(event) => activateAction(item, event)}
            >
              {item.action.label}
            </a>
          ) : item.action?.label ? (
            <button
              type="button"
              data-slot="toast-action"
              className={twMerge(
                'mt-2 inline-flex min-h-8 max-w-full cursor-pointer items-center whitespace-normal text-left text-sm font-semibold text-gray-950 hover:text-gray-600 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:text-white dark:hover:text-gray-300 dark:focus-visible:ring-white',
                item.action.class,
                item.action.className
              )}
              onClick={(event) => activateAction(item, event)}
            >
              {item.action.label}
            </button>
          ) : null}
        </div>
        {item.dismissible !== false ? (
          <button
            type="button"
            data-slot="toast-dismiss"
            className="-mr-2 -mt-1 grid size-9 cursor-pointer place-items-center rounded-lg text-lg leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:ring-white"
            aria-label={
              item.dismissLabel ?? `Dismiss ${item.title || 'notification'}`
            }
            onClick={() => controller.dismiss(item.id)}
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
      </>
    )
  }

  return (
    <section
      ref={viewportRef}
      {...viewportProps}
      popover="manual"
      data-slot="toast-viewport"
      data-position={position}
      data-from={resolvedFrom}
      data-to={resolvedTo}
      aria-label={label}
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions text"
      className={twMerge(
        'z-100 pointer-events-none fixed inset-auto m-0 flex w-[min(24rem,calc(100vw-2rem))] flex-col border-0 bg-transparent p-0',
        POSITIONS[position],
        className
      )}
      style={resolvedStyle}
    >
      <style>{MOTION_CSS}</style>
      <ol
        data-slot="toast-list"
        className="m-0 flex w-full min-w-0 list-none flex-col p-0"
      >
        {items.map((item) => (
          <li
            key={item.id}
            data-klean-toast-row=""
            data-state={item.state}
            aria-atomic="true"
            className="grid min-w-0 grid-cols-1 grid-rows-[1fr] pb-3"
            onMouseEnter={() => controller.pause(item.id, 'hover')}
            onMouseLeave={() => controller.resume(item.id, 'hover')}
            onFocus={() => controller.pause(item.id, 'focus')}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                controller.resume(item.id, 'focus')
              }
            }}
          >
            <div
              data-slot="toast"
              data-klean-toast-item=""
              data-state={item.state}
              data-from={resolvedFrom}
              data-to={resolvedTo}
              className={twMerge(
                'wrap-anywhere pointer-events-auto grid min-h-0 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 overflow-hidden rounded-xl bg-white px-4 py-3 text-gray-950 shadow-xl ring-1 ring-gray-950/10 dark:bg-gray-950 dark:text-white dark:ring-white/15',
                item.class,
                item.className
              )}
              onAnimationEnd={(event) => handleAnimationEnd(item, event)}
            >
              {typeof children === 'function'
                ? children({
                    item,
                    dismiss: () => controller.dismiss(item.id)
                  })
                : defaultContent(item)}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
