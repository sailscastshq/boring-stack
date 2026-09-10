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
import Popover from '../popover/Popover.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  /** Matches the native button's `popovertarget`. */
  id: { type: String, default: undefined },
  /** Framework-native controlled state. Omit for native uncontrolled use. */
  open: { type: Boolean, default: undefined },
  /** Initial state when `open` is not controlled. */
  defaultOpen: { type: Boolean, default: false },
  /** Preferred logical placement. Collision handling may flip it. */
  placement: { type: String, default: 'bottom-start' },
  /** Space in pixels between the invoker and menu. */
  offset: { type: Number, default: 8 }
})

const emit = defineEmits(['update:open'])
const attrs = useAttrs()
const popover = ref()
const internalOpen = ref(props.defaultOpen)
const activeInvoker = ref()
const isControlled = computed(() => props.open !== undefined)
const isOpen = computed(() =>
  isControlled.value ? props.open : internalOpen.value
)
const menuAttrs = computed(() => {
  const {
    class: _class,
    role: _role,
    tabindex: _tabindex,
    'data-slot': _dataSlot,
    ...rest
  } = attrs
  return rest
})
const menuClasses = computed(() => twMerge('min-w-40 p-1', attrs.class))
const TABBABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]'

let interactionRoot
let itemObserver
let pendingFocus = 'first'
let restoreOnClose = false
let tabExitPending = false
let tabExitTarget
let typeahead = ''
let typeaheadTimer

function contentElement() {
  const exposed = popover.value?.content
  return exposed?.value ?? exposed
}

function eventPath(event) {
  return event.composedPath?.() ?? [event.target]
}

function invokers() {
  const content = contentElement()
  const root = content?.getRootNode?.() ?? document

  return [...(root.querySelectorAll?.('[popovertarget]') ?? [])].filter(
    (element) => element.getAttribute('popovertarget') === content?.id
  )
}

function syncInvokerSemantics() {
  for (const invoker of invokers()) {
    invoker.setAttribute('aria-haspopup', 'menu')
  }
}

function matchingInvoker(event) {
  const id = contentElement()?.id
  if (!id) return undefined
  return eventPath(event).find(
    (element) => element?.getAttribute?.('popovertarget') === id
  )
}

function rememberInvoker(event) {
  const invoker = matchingInvoker(event)
  if (invoker) activeInvoker.value = invoker
}

function restoreInvokerFocus() {
  const invoker = activeInvoker.value?.isConnected
    ? activeInvoker.value
    : invokers()[0]
  invoker?.focus?.({ preventScroll: true })
}

function tabStopsOutsideMenu(root, content) {
  return [...(root.querySelectorAll?.(TABBABLE_SELECTOR) ?? [])].filter(
    (element) =>
      !content?.contains(element) &&
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      !element.closest('[hidden], [inert]')
  )
}

function adjacentTabStop(backward) {
  const content = contentElement()
  const invoker = activeInvoker.value?.isConnected
    ? activeInvoker.value
    : invokers()[0]
  let anchor = invoker
  let root = content?.getRootNode?.() ?? document

  while (anchor && root) {
    const stops = tabStopsOutsideMenu(root, content)
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
}

function completeTabExit() {
  if (tabExitTarget?.isConnected) {
    tabExitTarget.focus({ preventScroll: true })
  } else {
    const root = contentElement()?.getRootNode?.() ?? document
    root.activeElement?.blur?.()
  }

  tabExitTarget = undefined
  tabExitPending = false
}

function itemRole(element) {
  return ['menuitem', 'menuitemcheckbox', 'menuitemradio'].includes(
    element.getAttribute('role')
  )
}

function menuItems() {
  const content = contentElement()
  if (!content) return []

  for (const element of content.querySelectorAll('button, a[href]')) {
    if (!element.hasAttribute('role')) element.setAttribute('role', 'menuitem')
  }

  const items = [
    ...content.querySelectorAll(
      '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]'
    )
  ].filter((element) => element.closest('[role="menu"]') === content)

  for (const item of items) item.tabIndex = -1
  return items
}

function itemIsDisabled(item) {
  return (
    item.matches(':disabled') ||
    item.getAttribute('aria-disabled') === 'true' ||
    item.hidden ||
    item.closest('[hidden]') !== null
  )
}

function enabledItems() {
  return menuItems().filter((item) => !itemIsDisabled(item))
}

function focusedElement() {
  return (
    contentElement()?.getRootNode?.().activeElement ?? document.activeElement
  )
}

function focusItem(item) {
  if (!item) return
  for (const candidate of menuItems()) candidate.tabIndex = -1
  item.tabIndex = 0
  item.focus({ preventScroll: true })
}

function focusEdge(edge = 'first') {
  const items = enabledItems()
  const item = edge === 'last' ? items.at(-1) : items[0]
  if (item) focusItem(item)
  else contentElement()?.focus({ preventScroll: true })
}

function clearTypeahead() {
  typeahead = ''
  clearTimeout(typeaheadTimer)
  typeaheadTimer = undefined
}

function normalizedText(item) {
  return (item.getAttribute('aria-label') ?? item.textContent ?? '')
    .trim()
    .toLocaleLowerCase()
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
  clearTimeout(typeaheadTimer)
  typeahead += event.key.toLocaleLowerCase()
  typeaheadTimer = setTimeout(clearTypeahead, 500)

  const items = enabledItems()
  if (!items.length) return true
  const current = items.indexOf(focusedElement())
  const ordered = [...items.slice(current + 1), ...items.slice(0, current + 1)]
  let match = ordered.find((item) => normalizedText(item).startsWith(typeahead))

  if (!match && new Set(typeahead).size === 1) {
    typeahead = typeahead.at(-1)
    match = ordered.find((item) => normalizedText(item).startsWith(typeahead))
  }

  if (match) focusItem(match)
  return true
}

function requestOpen(nextOpen) {
  if (!isControlled.value) internalOpen.value = nextOpen
  emit('update:open', nextOpen)
}

function openMenu(edge = 'first') {
  pendingFocus = edge
  if (isOpen.value) focusEdge(edge)
  else requestOpen(true)
}

function closeMenu({ restoreFocus = false } = {}) {
  restoreOnClose ||= restoreFocus
  if (isOpen.value) requestOpen(false)
  else if (restoreOnClose) {
    restoreOnClose = false
    nextTick(restoreInvokerFocus)
  }
}

function handlePopoverOpen(nextOpen) {
  if (!isControlled.value) internalOpen.value = nextOpen
  emit('update:open', nextOpen)
}

function handleInvokerKeydown(event) {
  const invoker = matchingInvoker(event)
  if (!invoker || invoker.matches(':disabled')) return
  activeInvoker.value = invoker

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    openMenu(event.key === 'ArrowUp' ? 'last' : 'first')
  }
}

function itemFromEvent(event) {
  const content = contentElement()
  return eventPath(event).find(
    (element) =>
      element?.nodeType === Node.ELEMENT_NODE &&
      itemRole(element) &&
      element.closest?.('[role="menu"]') === content
  )
}

function handleClick(event) {
  const item = itemFromEvent(event)
  if (!item) return

  if (itemIsDisabled(item)) {
    event.preventDefault()
    event.stopImmediatePropagation()
    return
  }

  closeMenu({ restoreFocus: true })
}

function handleKeydown(event) {
  const items = enabledItems()
  const currentIndex = items.indexOf(focusedElement())
  let nextIndex

  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closeMenu({ restoreFocus: true })
    return
  }

  if (event.key === 'Tab') {
    event.preventDefault()
    clearTypeahead()
    restoreOnClose = false
    tabExitTarget = adjacentTabStop(event.shiftKey)
    tabExitPending = true
    closeMenu()
    return
  }

  if (event.key === 'ArrowDown') {
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
  } else if (handleTypeahead(event)) {
    return
  } else {
    return
  }

  if (!items.length) return
  event.preventDefault()
  focusItem(items[nextIndex])
}

watch(
  isOpen,
  async (nextOpen) => {
    await nextTick()
    syncInvokerSemantics()

    if (nextOpen) {
      focusEdge(pendingFocus)
      pendingFocus = 'first'
      return
    }

    clearTypeahead()
    menuItems()
    if (tabExitPending) completeTabExit()
    else if (restoreOnClose) restoreInvokerFocus()
    restoreOnClose = false
  },
  { flush: 'post' }
)

onMounted(async () => {
  await nextTick()
  const content = contentElement()
  interactionRoot = content?.getRootNode?.() ?? document
  interactionRoot.addEventListener('keydown', handleInvokerKeydown)
  interactionRoot.addEventListener('click', rememberInvoker, true)
  syncInvokerSemantics()
  menuItems()

  if (typeof MutationObserver !== 'undefined' && content) {
    itemObserver = new MutationObserver(menuItems)
    itemObserver.observe(content, { childList: true, subtree: true })
  }

  if (isOpen.value) focusEdge(pendingFocus)
})

onBeforeUnmount(() => {
  clearTypeahead()
  itemObserver?.disconnect()
  interactionRoot?.removeEventListener('keydown', handleInvokerKeydown)
  interactionRoot?.removeEventListener('click', rememberInvoker, true)
})

defineExpose({ close: closeMenu, open: openMenu })
</script>

<template>
  <Popover
    ref="popover"
    v-bind="menuAttrs"
    :id="id"
    :open="isOpen"
    :placement="placement"
    :offset="offset"
    role="menu"
    tabindex="-1"
    data-slot="menu"
    :class="menuClasses"
    @update:open="handlePopoverOpen"
    @click.capture="handleClick"
    @keydown="handleKeydown"
  >
    <slot :open="isOpen" :close="closeMenu" />
  </Popover>
</template>
