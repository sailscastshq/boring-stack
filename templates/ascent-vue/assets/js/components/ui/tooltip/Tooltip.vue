<script>
let closeActiveTooltip
</script>

<script setup>
import {
  arrow as floatingArrow,
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
  useId
} from 'vue'
import { twMerge } from 'tailwind-merge'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  /** Short supplementary text. Interactive content belongs in Popover. */
  text: { type: String, required: true },
  /** Preferred side. Collision handling may flip it. */
  placement: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
  },
  /** Space in pixels between the trigger and floating surface. */
  offset: { type: Number, default: 8 }
})

const attrs = useAttrs()
const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const tooltipId = `klean-tooltip-${generatedId}`
const root = ref()
const trigger = ref()
const content = ref()
const arrow = ref()
const isOpen = ref(false)
const supportsNative = ref(false)
const resolvedPlacement = ref(props.placement)
const positionStyle = ref({ position: 'fixed', left: '0px', top: '0px' })
const arrowStyle = ref({})
let openTimer
let closeTimer
let cleanupPosition = () => {}
let observer
let lastTouchAt = 0

const OPEN_DELAY = 400
const CLOSE_DELAY = 80
const ARROW_OVERHANG = 8
const ARROW_CLIP_PATHS = {
  top: 'polygon(0 0, 100% 0, 50% 100%)',
  right: 'polygon(100% 0, 0 50%, 100% 100%)',
  bottom: 'polygon(50% 0, 100% 100%, 0 100%)',
  left: 'polygon(0 0, 100% 50%, 0 100%)'
}

const contentAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    id: _id,
    role: _role,
    popover: _popover,
    hidden: _hidden,
    'data-slot': _dataSlot,
    ...rest
  } = attrs
  return rest
})

const contentClasses = computed(() =>
  twMerge(
    [
      'pointer-events-none z-50 m-0 w-max max-w-[calc(100vw-1rem)] overflow-visible rounded-md border border-gray-950 bg-gray-950 px-2.5 py-1.5 text-xs font-medium leading-none text-white shadow-md outline-none',
      'transition-opacity duration-100 starting:opacity-0 motion-reduce:transition-none',
      'dark:border-white dark:bg-white dark:text-gray-950',
      'forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]'
    ],
    attrs.class
  )
)

function descriptionTokens(element) {
  return (element?.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .filter(Boolean)
}

function addDescription(element) {
  if (!element) return
  const tokens = new Set(descriptionTokens(element))
  tokens.add(tooltipId)
  element.setAttribute('aria-describedby', [...tokens].join(' '))
}

function removeDescription(element) {
  if (!element) return
  const tokens = descriptionTokens(element).filter(
    (token) => token !== tooltipId
  )
  if (tokens.length) element.setAttribute('aria-describedby', tokens.join(' '))
  else element.removeAttribute('aria-describedby')
}

function syncTrigger() {
  const nextTrigger = root.value?.firstElementChild
  if (nextTrigger === trigger.value) return

  removeDescription(trigger.value)
  trigger.value = nextTrigger
  addDescription(trigger.value)

  if (!trigger.value) closeNow()
}

function popoverIsShowing() {
  if (!supportsNative.value || !content.value) return false
  try {
    return content.value.matches(':popover-open')
  } catch {
    return false
  }
}

function syncNativePopover() {
  if (!supportsNative.value || !content.value) return
  try {
    if (isOpen.value && !popoverIsShowing()) {
      content.value.showPopover({ source: trigger.value })
    } else if (!isOpen.value && popoverIsShowing()) {
      content.value.hidePopover()
    }
  } catch {
    // Rapid pointer and focus changes can make show/hide requests redundant.
  }
}

async function updatePosition() {
  if (!trigger.value?.isConnected || !content.value?.isConnected) {
    closeNow()
    return
  }

  const result = await computePosition(trigger.value, content.value, {
    placement: props.placement,
    strategy: 'fixed',
    middleware: [
      floatingOffset(props.offset),
      flip(),
      shift({ padding: 8 }),
      floatingArrow({ element: arrow.value, padding: 6 })
    ]
  })

  const side = result.placement.split('-')[0]
  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
  }[side]
  const arrowData = result.middlewareData.arrow ?? {}

  resolvedPlacement.value = result.placement
  positionStyle.value = {
    position: 'fixed',
    left: `${result.x}px`,
    top: `${result.y}px`
  }
  arrowStyle.value = {
    left: arrowData.x == null ? '' : `${arrowData.x}px`,
    top: arrowData.y == null ? '' : `${arrowData.y}px`,
    right: '',
    bottom: '',
    clipPath: ARROW_CLIP_PATHS[side],
    [staticSide]: `-${ARROW_OVERHANG}px`
  }
}

function startPositioning() {
  cleanupPosition()
  if (!trigger.value || !content.value) return
  cleanupPosition = autoUpdate(trigger.value, content.value, updatePosition)
}

async function openNow() {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
  syncTrigger()
  if (!trigger.value || !props.text) return

  if (closeActiveTooltip && closeActiveTooltip !== closeNow) {
    closeActiveTooltip()
  }
  closeActiveTooltip = closeNow
  isOpen.value = true
  syncNativePopover()
  await nextTick()
  startPositioning()
}

function closeNow() {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
  cleanupPosition()
  cleanupPosition = () => {}
  isOpen.value = false
  syncNativePopover()
  if (closeActiveTooltip === closeNow) closeActiveTooltip = undefined
}

function scheduleOpen() {
  clearTimeout(closeTimer)
  if (isOpen.value) return
  clearTimeout(openTimer)
  openTimer = setTimeout(openNow, OPEN_DELAY)
}

function scheduleClose() {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
  closeTimer = setTimeout(closeNow, CLOSE_DELAY)
}

function handlePointerOver(event) {
  if (event.pointerType === 'touch') return
  if (content.value?.contains(event.target)) {
    clearTimeout(closeTimer)
    return
  }
  scheduleOpen()
}

function handlePointerOut(event) {
  if (
    root.value?.contains(event.relatedTarget) ||
    content.value?.contains(event.relatedTarget)
  ) {
    return
  }
  scheduleClose()
}

function handlePointerDown(event) {
  if (event.pointerType !== 'touch') return
  lastTouchAt = Date.now()
  closeNow()
}

function handleFocusIn() {
  if (Date.now() - lastTouchAt < 1000) return
  scheduleOpen()
}

function handleFocusOut(event) {
  if (root.value?.contains(event.relatedTarget)) return
  scheduleClose()
}

function handleEscape(event) {
  if (event.key !== 'Escape' || !isOpen.value) return
  event.preventDefault()
  closeNow()
}

function handleContextChange(event) {
  if (!isOpen.value) return
  const path = event.composedPath?.() ?? [event.target]
  if (path.includes(trigger.value) || path.includes(content.value)) return
  closeNow()
}

function handleNativeToggle(event) {
  if (event.newState === 'closed' && isOpen.value) {
    isOpen.value = false
    cleanupPosition()
    cleanupPosition = () => {}
  }
}

onMounted(async () => {
  await nextTick()
  if (!root.value) return
  supportsNative.value =
    typeof content.value?.showPopover === 'function' &&
    typeof content.value?.hidePopover === 'function'
  syncTrigger()

  observer = new MutationObserver(syncTrigger)
  observer.observe(root.value, { childList: true })
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('pointerdown', handleContextChange, true)
  window.addEventListener('blur', closeNow)
})

onBeforeUnmount(() => {
  closeNow()
  removeDescription(trigger.value)
  observer?.disconnect()
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('pointerdown', handleContextChange, true)
  window.removeEventListener('blur', closeNow)
})
</script>

<template>
  <span
    ref="root"
    role="presentation"
    class="contents"
    @pointerover="handlePointerOver"
    @pointerout="handlePointerOut"
    @pointerdown="handlePointerDown"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
  >
    <slot />
    <div
      v-bind="contentAttrs"
      :id="tooltipId"
      ref="content"
      popover="hint"
      role="tooltip"
      data-slot="tooltip"
      :data-state="isOpen ? 'open' : 'closed'"
      :data-placement="resolvedPlacement"
      :hidden="!supportsNative && !isOpen"
      :class="contentClasses"
      :style="[positionStyle, attrs.style]"
      @toggle="handleNativeToggle"
    >
      {{ text }}
      <span
        ref="arrow"
        aria-hidden="true"
        data-slot="tooltip-arrow"
        class="pointer-events-none absolute size-3 bg-inherit forced-colors:hidden"
        :style="arrowStyle"
      />
    </div>
  </span>
</template>
