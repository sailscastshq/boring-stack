<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useTemplateRef,
  watch
} from 'vue'
import { twMerge } from 'tailwind-merge'
import { toast } from './toast.js'

defineOptions({ inheritAttrs: false })

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
  if (direction === 'fade' || direction === 'none') {
    return { x: '0px', y: '0px' }
  }

  const nearby = POSITION_EDGES[position]?.includes(direction)
  const horizontal = direction === 'left' || direction === 'right'
  const distance = nearby
    ? 'calc(100% + 1rem)'
    : horizontal
      ? '100vw'
      : '100dvh'
  const negative = direction === 'left' || direction === 'top'
  const signedDistance = negative
    ? nearby
      ? 'calc(-100% - 1rem)'
      : horizontal
        ? '-100vw'
        : '-100dvh'
    : distance

  return horizontal
    ? { x: signedDistance, y: '0px' }
    : { x: '0px', y: signedDistance }
}

function motionDuration(phase, direction, position) {
  if (direction === 'none') return 0
  if (['fade', ...POSITION_EDGES[position]].includes(direction)) {
    return NEARBY_DURATION[phase]
  }
  return CROSS_VIEWPORT_DURATION[phase]
}

const props = defineProps({
  /** Optional isolated controller. The shared `toast` works without a provider. */
  controller: { type: Function, default: undefined },
  /** Fixed viewport position. */
  position: {
    type: String,
    default: 'top-right',
    validator: (value) =>
      [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right'
      ].includes(value)
  },
  /** Direction new notifications enter from. */
  from: {
    type: String,
    default: undefined,
    validator: (value) =>
      ['left', 'right', 'top', 'bottom', 'fade', 'none'].includes(value)
  },
  /** Direction dismissed notifications leave toward. */
  to: {
    type: String,
    default: undefined,
    validator: (value) =>
      ['left', 'right', 'top', 'bottom', 'fade', 'none'].includes(value)
  },
  /** Accessible name for the persistent live region. */
  label: { type: String, default: 'Notifications' }
})

const attrs = useAttrs()
const items = ref([])
const viewport = useTemplateRef('viewport')
const activeController = computed(() => props.controller ?? toast)
const defaultDirection = computed(() =>
  props.position.endsWith('-left') ? 'left' : 'right'
)
const resolvedFrom = computed(() => props.from ?? defaultDirection.value)
const resolvedTo = computed(() => props.to ?? defaultDirection.value)
let unsubscribe = () => {}
let promotedItemId

const viewportClasses = computed(() =>
  twMerge(
    'pointer-events-none fixed inset-auto z-100 m-0 flex w-[min(24rem,calc(100vw-2rem))] flex-col border-0 bg-transparent p-0',
    POSITIONS[props.position],
    attrs.class
  )
)

const viewportAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    'aria-label': _ariaLabel,
    'aria-live': _ariaLive,
    popover: _popover,
    'data-slot': _dataSlot,
    ...rest
  } = attrs

  return rest
})

const motionStyle = computed(() => {
  const enter = motionVector(resolvedFrom.value, props.position)
  const leave = motionVector(resolvedTo.value, props.position)
  const enterDuration = motionDuration(
    'enter',
    resolvedFrom.value,
    props.position
  )
  const leaveDuration = motionDuration(
    'leave',
    resolvedTo.value,
    props.position
  )
  const collapseDelay = Math.min(80, Math.round(leaveDuration * 0.4))

  return {
    '--klean-toast-enter-x': enter.x,
    '--klean-toast-enter-y': enter.y,
    '--klean-toast-leave-x': leave.x,
    '--klean-toast-leave-y': leave.y,
    '--klean-toast-enter-duration': `${enterDuration}ms`,
    '--klean-toast-leave-duration': `${leaveDuration}ms`,
    '--klean-toast-collapse-delay': `${collapseDelay}ms`,
    '--klean-toast-collapse-duration': `${Math.max(0, leaveDuration - collapseDelay)}ms`
  }
})

function activateAction(item, event) {
  item.action?.onClick?.(event, item)
  activeController.value.dismiss(item.id)
}

function subscribe(controller) {
  unsubscribe()
  promotedItemId = undefined
  const sync = () => {
    const snapshot = controller.getSnapshot()
    items.value = snapshot

    const enteringItem = snapshot.findLast((item) => item.state === 'entering')
    if (enteringItem && enteringItem.id !== promotedItemId) {
      promotedItemId = enteringItem.id
      hideTopLayer()
      showTopLayer()
    }

    if (resolvedFrom.value === 'none' || resolvedTo.value === 'none') {
      queueMicrotask(() => {
        for (const item of controller.getSnapshot()) {
          if (item.state === 'entering' && resolvedFrom.value === 'none') {
            controller.completeEnter(item.id)
          } else if (item.state === 'closing' && resolvedTo.value === 'none') {
            controller.remove(item.id)
          }
        }
      })
    }
  }

  sync()
  unsubscribe = controller.subscribe(sync)
}

function handleAnimationEnd(item, event) {
  if (event.target !== event.currentTarget) return

  if (item.state === 'entering') activeController.value.completeEnter(item.id)
  else if (item.state === 'closing') activeController.value.remove(item.id)
}

function handleFocusOut(item, event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    activeController.value.resume(item.id, 'focus')
  }
}

function handleVisibility() {
  if (document.hidden) activeController.value.pauseAll('page-hidden')
  else activeController.value.resumeAll('page-hidden')
}

function handleWindowBlur() {
  activeController.value.pauseAll('window-blur')
}

function handleWindowFocus() {
  activeController.value.resumeAll('window-blur')
}

function showTopLayer() {
  try {
    viewport.value?.showPopover?.()
  } catch {
    // Already open or rejected by a partial Popover API implementation.
  }
}

function hideTopLayer() {
  try {
    viewport.value?.hidePopover?.()
  } catch {
    // Already closed during teardown.
  }
}

watch(activeController, subscribe)

onMounted(() => {
  showTopLayer()
  subscribe(activeController.value)
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('blur', handleWindowBlur)
  window.addEventListener('focus', handleWindowFocus)
  handleVisibility()
})

onBeforeUnmount(() => {
  hideTopLayer()
  unsubscribe()
  document.removeEventListener('visibilitychange', handleVisibility)
  window.removeEventListener('blur', handleWindowBlur)
  window.removeEventListener('focus', handleWindowFocus)
  activeController.value.resumeAll('page-hidden')
  activeController.value.resumeAll('window-blur')
})
</script>

<template>
  <section
    ref="viewport"
    v-bind="viewportAttrs"
    popover="manual"
    data-slot="toast-viewport"
    :data-position="position"
    :data-from="resolvedFrom"
    :data-to="resolvedTo"
    :aria-label="label"
    aria-live="polite"
    aria-atomic="false"
    aria-relevant="additions text"
    :class="viewportClasses"
    :style="[motionStyle, attrs.style]"
  >
    <ol
      data-slot="toast-list"
      class="m-0 flex min-w-0 w-full list-none flex-col p-0"
    >
      <li
        v-for="item in items"
        :key="item.id"
        data-klean-toast-row
        :data-state="item.state"
        aria-atomic="true"
        class="grid min-w-0 grid-cols-1 grid-rows-[1fr] pb-3"
        @mouseenter="activeController.pause(item.id, 'hover')"
        @mouseleave="activeController.resume(item.id, 'hover')"
        @focusin="activeController.pause(item.id, 'focus')"
        @focusout="handleFocusOut(item, $event)"
      >
        <div
          data-slot="toast"
          data-klean-toast-item
          :data-state="item.state"
          :data-from="resolvedFrom"
          :data-to="resolvedTo"
          :class="
            twMerge(
              'pointer-events-auto grid min-h-0 min-w-0 w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-3 overflow-hidden rounded-xl bg-white px-4 py-3 wrap-anywhere text-gray-950 shadow-xl ring-1 ring-gray-950/10 dark:bg-gray-950 dark:text-white dark:ring-white/15',
              item.class
            )
          "
          @animationend="handleAnimationEnd(item, $event)"
        >
          <slot :item="item" :dismiss="() => activeController.dismiss(item.id)">
            <div class="min-w-0 pt-0.5">
              <p
                v-if="item.title"
                data-slot="toast-title"
                class="text-sm font-semibold leading-5"
              >
                {{ item.title }}
              </p>
              <p
                v-if="item.message"
                data-slot="toast-message"
                :class="
                  twMerge(
                    'text-sm leading-5 text-gray-600 dark:text-gray-300',
                    item.title && 'mt-0.5'
                  )
                "
              >
                {{ item.message }}
              </p>
              <a
                v-if="item.action?.href"
                data-slot="toast-action"
                :href="item.action.href"
                :class="
                  twMerge(
                    'mt-2 inline-flex min-h-8 max-w-full items-center text-left text-sm font-semibold whitespace-normal text-gray-950 underline decoration-gray-300 underline-offset-4 hover:decoration-current focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:text-white dark:decoration-gray-600 dark:focus-visible:ring-white',
                    item.action.class
                  )
                "
                @click="activateAction(item, $event)"
              >
                {{ item.action.label }}
              </a>
              <button
                v-else-if="item.action?.label"
                type="button"
                data-slot="toast-action"
                :class="
                  twMerge(
                    'mt-2 inline-flex min-h-8 max-w-full cursor-pointer items-center text-left text-sm font-semibold whitespace-normal text-gray-950 hover:text-gray-600 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:text-white dark:hover:text-gray-300 dark:focus-visible:ring-white',
                    item.action.class
                  )
                "
                @click="activateAction(item, $event)"
              >
                {{ item.action.label }}
              </button>
            </div>
            <button
              v-if="item.dismissible !== false"
              type="button"
              data-slot="toast-dismiss"
              class="-mr-2 -mt-1 grid size-9 cursor-pointer place-items-center rounded-lg text-lg leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:ring-white"
              :aria-label="
                item.dismissLabel ?? `Dismiss ${item.title || 'notification'}`
              "
              @click="activeController.dismiss(item.id)"
            >
              <span aria-hidden="true">×</span>
            </button>
          </slot>
        </div>
      </li>
    </ol>
  </section>
</template>

<style>
@keyframes klean-toast-enter {
  0% {
    opacity: 0;
    transform: translate3d(
        var(--klean-toast-enter-x),
        var(--klean-toast-enter-y),
        0
      )
      scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes klean-toast-leave {
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate3d(
        var(--klean-toast-leave-x),
        var(--klean-toast-leave-y),
        0
      )
      scale(0.98);
  }
}

@keyframes klean-toast-collapse {
  0% {
    grid-template-rows: 1fr;
    padding-block-end: 0.75rem;
  }
  100% {
    grid-template-rows: 0fr;
    padding-block-end: 0;
  }
}

[data-klean-toast-item][data-state='entering'] {
  animation: klean-toast-enter var(--klean-toast-enter-duration) ease-out both;
}

[data-klean-toast-item][data-state='closing'] {
  animation: klean-toast-leave var(--klean-toast-leave-duration) ease-in both;
  pointer-events: none;
}

[data-klean-toast-row][data-state='closing'] {
  animation: klean-toast-collapse var(--klean-toast-collapse-duration) ease-in
    var(--klean-toast-collapse-delay) both;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  [data-klean-toast-item][data-state] {
    animation-duration: 1ms;
    animation-timing-function: linear;
  }

  [data-klean-toast-row][data-state='closing'] {
    animation-delay: 0ms;
    animation-duration: 1ms;
  }
}
</style>
