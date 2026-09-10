<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch
} from 'vue'
import { twMerge } from 'tailwind-merge'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  /** The native id targeted by a button's `commandfor` attribute. */
  id: { type: String, default: undefined },
  /** Framework-native controlled state. Omit for native uncontrolled use. */
  open: { type: Boolean, default: undefined },
  /** Initial state when `open` is not controlled. */
  defaultOpen: { type: Boolean, default: false },
  /** Whether Escape, platform dismissal, and backdrop clicks may close it. */
  dismissible: { type: Boolean, default: true }
})

const emit = defineEmits(['update:open'])
const attrs = useAttrs()
const dialog = ref()
const internalOpen = ref(props.defaultOpen)
const nativeOpen = ref(false)
const isControlled = computed(() => props.open !== undefined)
const desiredOpen = computed(() =>
  isControlled.value ? props.open : internalOpen.value
)
const dialogAttrs = computed(() => {
  const {
    class: _class,
    closedby: _closedby,
    open: _open,
    'data-slot': _dataSlot,
    'data-state': _dataState,
    onBeforetoggle: _onBeforetoggle,
    onBeforeToggle: _onBeforeToggle,
    onCancel: _onCancel,
    onClick: _onClick,
    onClose: _onClose,
    onToggle: _onToggle,
    ...rest
  } = attrs

  return rest
})
const dialogClasses = computed(() =>
  twMerge(
    [
      'm-auto w-[calc(100vw-2rem)] max-w-lg overflow-hidden rounded-lg border border-gray-200 bg-white p-6 text-gray-950 shadow-xl outline-none',
      'backdrop:bg-black/50',
      'dark:border-gray-700 dark:bg-gray-950 dark:text-white'
    ],
    attrs.class
  )
)

let commandRoot
let previousDocumentOverflow = ''
let scrollLocked = false
let fallbackInvoker

function resolveInvoker(source, element) {
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
}

function callListener(listener, event) {
  for (const callback of Array.isArray(listener) ? listener : [listener]) {
    callback?.(event)
  }
}

function lockScroll() {
  if (scrollLocked || typeof document === 'undefined') return
  previousDocumentOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  scrollLocked = true
}

function unlockScroll() {
  if (!scrollLocked || typeof document === 'undefined') return
  document.documentElement.style.overflow = previousDocumentOverflow
  scrollLocked = false
}

function observeNativeOpen(nextOpen) {
  const shouldNotify = desiredOpen.value !== nextOpen
  nativeOpen.value = nextOpen

  if (!isControlled.value) internalOpen.value = nextOpen
  if (nextOpen) lockScroll()
  else unlockScroll()
  if (shouldNotify) emit('update:open', nextOpen)
}

function showModal(source) {
  const element = dialog.value
  if (!element || element.open) return

  fallbackInvoker = resolveInvoker(source, element)
  element.showModal()
  observeNativeOpen(true)
}

function close(returnValue) {
  const element = dialog.value
  if (!element?.open) return

  element.close(returnValue)
  observeNativeOpen(false)
}

function requestClose(returnValue) {
  const element = dialog.value
  if (!element?.open) return

  if (typeof element.requestClose === 'function') {
    element.requestClose(returnValue)
    return
  }

  const event = new Event('cancel', { cancelable: true })
  if (element.dispatchEvent(event)) close(returnValue)
}

function handleBeforeToggle(event) {
  callListener(attrs.onBeforetoggle ?? attrs.onBeforeToggle, event)
}

function handleToggle(event) {
  observeNativeOpen(event.newState === 'open' || dialog.value?.open === true)
  callListener(attrs.onToggle, event)
}

function handleCancel(event) {
  if (!props.dismissible) event.preventDefault()
  callListener(attrs.onCancel, event)
}

function handleClose(event) {
  observeNativeOpen(false)

  if (fallbackInvoker?.isConnected) {
    fallbackInvoker.focus({ preventScroll: true })
  }
  fallbackInvoker = undefined
  callListener(attrs.onClose, event)
}

function clickIsOutsideDialog(event) {
  const rect = event.currentTarget.getBoundingClientRect()

  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
}

function handleClick(event) {
  callListener(attrs.onClick, event)

  if (
    event.defaultPrevented ||
    !props.dismissible ||
    'closedBy' in event.currentTarget ||
    event.target !== event.currentTarget ||
    !clickIsOutsideDialog(event)
  ) {
    return
  }

  requestClose()
}

function commandButton(event) {
  return (event.composedPath?.() ?? [event.target]).find(
    (element) =>
      element?.tagName === 'BUTTON' &&
      element.getAttribute('commandfor') === props.id
  )
}

function handleFallbackCommand(event) {
  const button = commandButton(event)
  if (!button || button.matches(':disabled')) return

  const command = button.getAttribute('command')
  if (command === 'show-modal') showModal(button)
  else if (command === 'close') close(button.value)
  else if (command === 'request-close') requestClose(button.value)
}

function supportsInvokerCommands() {
  return (
    typeof HTMLButtonElement !== 'undefined' &&
    'commandForElement' in HTMLButtonElement.prototype
  )
}

async function syncDesiredOpen() {
  await nextTick()
  const element = dialog.value
  if (!element) return

  if (desiredOpen.value && !element.open) showModal()
  else if (!desiredOpen.value && element.open) close()
  else observeNativeOpen(element.open)
}

watch(desiredOpen, syncDesiredOpen, { flush: 'post' })

onMounted(() => {
  commandRoot = dialog.value?.getRootNode?.() ?? document
  if (!supportsInvokerCommands() && props.id) {
    commandRoot.addEventListener('click', handleFallbackCommand)
  }
  syncDesiredOpen()
})

onBeforeUnmount(() => {
  commandRoot?.removeEventListener('click', handleFallbackCommand)
  if (dialog.value?.open) dialog.value.close()
  unlockScroll()
})

defineExpose({ dialog, showModal, close, requestClose })
</script>

<template>
  <dialog
    ref="dialog"
    v-bind="dialogAttrs"
    :id="id"
    :closedby="dismissible ? 'any' : 'none'"
    data-slot="dialog"
    :data-state="nativeOpen ? 'open' : 'closed'"
    :class="dialogClasses"
    @beforetoggle="handleBeforeToggle"
    @toggle="handleToggle"
    @cancel="handleCancel"
    @close="handleClose"
    @click="handleClick"
  >
    <slot />
  </dialog>
</template>
