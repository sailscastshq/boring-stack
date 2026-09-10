<script setup>
import {
  autoUpdate,
  computePosition,
  flip,
  offset as floatingOffset,
  shift
} from '@floating-ui/dom'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useId,
  watch
} from 'vue'
import { twMerge } from 'tailwind-merge'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  /** Matches the native button's `popovertarget`. */
  id: { type: String, default: undefined },
  /** Framework-native controlled state. Omit for native uncontrolled use. */
  open: { type: Boolean, default: undefined },
  /** Initial state when `open` is not controlled. */
  defaultOpen: { type: Boolean, default: false },
  /** Element or element id used only for floating-surface positioning. */
  anchor: { type: [String, Object], default: undefined },
  /** Preferred logical placement. Collision handling may flip it. */
  placement: {
    type: String,
    default: 'bottom-start',
    validator: (value) =>
      [
        'top',
        'top-start',
        'top-end',
        'right',
        'right-start',
        'right-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end'
      ].includes(value)
  },
  /** Space in pixels between the invoker and floating surface. */
  offset: { type: Number, default: 8 }
})

const emit = defineEmits(['update:open'])
const attrs = useAttrs()
const generatedId = useId()
const content = ref()
const activeInvoker = ref()
const internalOpen = ref(props.defaultOpen)
const nativePopover = ref(false)
const resolvedPlacement = ref(props.placement)
const positionStyle = ref({
  position: 'fixed',
  inset: 'auto',
  left: '0px',
  top: '0px'
})
let cleanupPosition = () => {}

const isControlled = computed(() => props.open !== undefined)
const isOpen = computed(() =>
  isControlled.value ? props.open : internalOpen.value
)
const contentId = computed(
  () =>
    props.id ?? `klean-popover-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`
)
const contentAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    hidden: _hidden,
    popover: _popover,
    'data-slot': _dataSlot,
    ...rest
  } = attrs
  return rest
})
const contentClasses = computed(() =>
  twMerge(
    [
      'z-50 m-0 w-max max-w-[calc(100vw-1rem)] rounded-md border border-gray-200 bg-white p-4 text-gray-950 shadow-lg outline-none',
      'dark:border-gray-700 dark:bg-gray-950 dark:text-white'
    ],
    attrs.class
  )
)
const dataSlot = computed(() => attrs['data-slot'] ?? 'popover-content')

function invokers() {
  const root = content.value?.getRootNode?.() ?? document

  return [...(root.querySelectorAll?.('[popovertarget]') ?? [])].filter(
    (element) => element.getAttribute('popovertarget') === contentId.value
  )
}

function eventPath(event) {
  return event.composedPath?.() ?? [event.target]
}

function resolveInvoker(candidate) {
  if (candidate?.isConnected) {
    activeInvoker.value = candidate
  }

  if (!activeInvoker.value?.isConnected) {
    activeInvoker.value = invokers()[0]
  }

  return activeInvoker.value
}

function resolveAnchor() {
  if (typeof props.anchor === 'string') {
    const root = content.value?.getRootNode?.() ?? document
    const element =
      root.getElementById?.(props.anchor) ??
      document.getElementById(props.anchor)

    if (element?.isConnected) return element
  } else if (props.anchor?.isConnected) {
    return props.anchor
  }

  return resolveInvoker()
}

function syncInvokerAria() {
  for (const invoker of invokers()) {
    invoker.setAttribute('aria-controls', contentId.value)
    invoker.setAttribute('aria-expanded', String(isOpen.value))
  }
}

function popoverIsShowing() {
  if (!content.value || !nativePopover.value) return false

  try {
    return content.value.matches(':popover-open')
  } catch {
    return false
  }
}

function syncNativePopover() {
  if (!content.value || !nativePopover.value) return

  const showing = popoverIsShowing()

  try {
    if (isOpen.value && !showing) {
      content.value.showPopover({ source: resolveInvoker() })
    } else if (!isOpen.value && showing) {
      content.value.hidePopover()
    }
  } catch {
    // A rapid native toggle can briefly make the requested state redundant.
  }
}

function setOpen(nextOpen, { restoreFocus = false } = {}) {
  if (!isControlled.value) internalOpen.value = nextOpen
  emit('update:open', nextOpen)

  nextTick(() => {
    syncInvokerAria()
    syncNativePopover()

    const invoker = resolveInvoker()
    if (!nextOpen && restoreFocus && invoker?.isConnected) {
      invoker.focus({ preventScroll: true })
    }
  })
}

function close({ restoreFocus = isOpen.value } = {}) {
  setOpen(false, { restoreFocus })
}

function open(source) {
  resolveInvoker(source)
  setOpen(true)
}

function handleNativeToggle(event) {
  const nextOpen = event.newState === 'open'
  const shouldRestoreFocus =
    !nextOpen && event.source?.getAttribute?.('popovertargetaction') === 'hide'
  if (nextOpen) resolveInvoker(event.source)
  if (nextOpen === isOpen.value) return

  if (!isControlled.value) internalOpen.value = nextOpen
  emit('update:open', nextOpen)
  syncInvokerAria()

  if (isControlled.value) nextTick(syncNativePopover)

  if (shouldRestoreFocus) {
    nextTick(() => {
      const invoker = resolveInvoker()
      if (invoker?.isConnected) invoker.focus({ preventScroll: true })
    })
  }
}

function matchingInvokerFromEvent(event) {
  const candidate = eventPath(event).find(
    (element) => element?.getAttribute?.('popovertarget') === contentId.value
  )
  return candidate?.getAttribute('popovertarget') === contentId.value
    ? candidate
    : undefined
}

function handleFallbackInvokerClick(event) {
  const invoker = matchingInvokerFromEvent(event)
  if (!invoker) return

  resolveInvoker(invoker)
  const action = invoker.getAttribute('popovertargetaction') ?? 'toggle'

  if (action === 'show') setOpen(true)
  else if (action === 'hide') setOpen(false, { restoreFocus: true })
  else setOpen(!isOpen.value)
}

function handleOutsidePointer(event) {
  const path = eventPath(event)
  const invoker = resolveInvoker()
  const anchor = resolveAnchor()

  if (
    path.includes(content.value) ||
    (invoker && (path.includes(invoker) || invoker.contains?.(event.target))) ||
    (anchor && (path.includes(anchor) || anchor.contains?.(event.target))) ||
    invokers().some(
      (invoker) => path.includes(invoker) || invoker.contains(event.target)
    )
  ) {
    return
  }

  setOpen(false)
}

function handleEscape(event) {
  if (event.key !== 'Escape') return

  if (nativePopover.value) {
    const openPopovers = [...document.querySelectorAll(':popover-open')]
    if (openPopovers.at(-1) !== content.value) return
  }

  event.preventDefault()
  setOpen(false, { restoreFocus: true })
}

async function updatePosition() {
  const anchor = resolveAnchor()
  if (!isOpen.value || !anchor || !content.value) return

  const { x, y, placement } = await computePosition(anchor, content.value, {
    placement: props.placement,
    strategy: 'fixed',
    middleware: [floatingOffset(props.offset), flip(), shift({ padding: 8 })]
  })

  resolvedPlacement.value = placement
  positionStyle.value = {
    position: 'fixed',
    inset: 'auto',
    left: `${x}px`,
    top: `${y}px`
  }
}

function stopOpenEffects() {
  cleanupPosition()
  cleanupPosition = () => {}
  document.removeEventListener('pointerdown', handleOutsidePointer, true)
  document.removeEventListener('keydown', handleEscape)
}

async function syncOpenEffects() {
  stopOpenEffects()
  await nextTick()
  syncInvokerAria()
  syncNativePopover()

  const anchor = resolveAnchor()
  if (!isOpen.value || !anchor || !content.value) return

  cleanupPosition = autoUpdate(anchor, content.value, updatePosition)

  document.addEventListener('keydown', handleEscape)
  document.addEventListener('pointerdown', handleOutsidePointer, true)
}

watch(
  () => [
    isOpen.value,
    props.anchor,
    props.placement,
    props.offset,
    activeInvoker.value
  ],
  syncOpenEffects,
  { flush: 'post' }
)

onMounted(() => {
  nativePopover.value =
    typeof content.value?.showPopover === 'function' &&
    typeof content.value?.hidePopover === 'function'
  resolveInvoker()
  syncInvokerAria()

  if (!nativePopover.value) {
    document.addEventListener('click', handleFallbackInvokerClick)
  }

  syncOpenEffects()
})

onBeforeUnmount(() => {
  stopOpenEffects()
  document.removeEventListener('click', handleFallbackInvokerClick)
})

defineExpose({ content, close, open })
</script>

<template>
  <div
    ref="content"
    v-bind="contentAttrs"
    :id="contentId"
    popover="auto"
    :hidden="!nativePopover && !isOpen"
    :data-slot="dataSlot"
    :data-state="isOpen ? 'open' : 'closed'"
    :data-placement="resolvedPlacement"
    :class="contentClasses"
    :style="[positionStyle, attrs.style]"
    @toggle="handleNativeToggle"
  >
    <slot :open="isOpen" :close="close" />
  </div>
</template>
