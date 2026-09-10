<script setup>
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
import Popover from '../popover/Popover.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  /** Framework-native controlled value. Omit for uncontrolled use. */
  modelValue: { default: undefined },
  /** Initial value when `modelValue` is not controlled. */
  defaultValue: { default: undefined },
  /** Fixed choices in the form `{ value, label, disabled?, group? }`. */
  options: { type: Array, default: () => [] },
  /** Text shown when no option is selected. */
  placeholder: { type: String, default: 'Select an option' },
  /** Native form field name. */
  name: { type: String, default: undefined },
  /** Native and accessible required state. */
  required: { type: Boolean, default: false },
  /** Prevents opening and selection. */
  disabled: { type: Boolean, default: false },
  /** Stable control ID. */
  id: { type: String, default: undefined },
  /** Framework-native controlled popup state. */
  open: { type: Boolean, default: undefined },
  /** Initial popup state when `open` is not controlled. */
  defaultOpen: { type: Boolean, default: false },
  /** Preferred logical placement. Collision handling may flip it. */
  placement: { type: String, default: 'bottom-start' },
  /** Space in pixels between the trigger and popup. */
  offset: { type: Number, default: 4 }
})

const emit = defineEmits(['update:modelValue', 'update:open', 'change', 'blur'])
const attrs = useAttrs()
const generatedId = useId()
const root = ref()
const trigger = ref()
const popover = ref()
const internalValue = ref(props.defaultValue)
const internalOpen = ref(props.defaultOpen)
const highlightedIndex = ref(-1)
const triggerWidth = ref(0)

const isValueControlled = computed(() => props.modelValue !== undefined)
const value = computed(() =>
  isValueControlled.value ? props.modelValue : internalValue.value
)
const isOpenControlled = computed(() => props.open !== undefined)
const isOpen = computed(() =>
  isOpenControlled.value ? props.open : internalOpen.value
)
const controlId = computed(
  () => props.id ?? `klean-select-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`
)
const contentId = computed(() => `${controlId.value}-content`)
const listboxId = computed(() => `${controlId.value}-listbox`)
const triggerClasses = computed(() =>
  twMerge(
    'flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-base text-gray-950 shadow-sm outline-none transition-colors duration-150 hover:border-gray-400 focus-visible:border-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 aria-invalid:border-red-600 aria-invalid:focus-visible:outline-red-600 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:hover:border-gray-600 dark:focus-visible:border-white dark:focus-visible:outline-white dark:disabled:bg-gray-900 dark:disabled:text-gray-500 dark:aria-invalid:border-red-500 dark:aria-invalid:focus-visible:outline-red-500 motion-reduce:transition-none',
    attrs.class
  )
)
const forwardedTriggerAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    id: _id,
    role: _role,
    type: _type,
    disabled: _disabled,
    name: _name,
    required: _required,
    value: _value,
    'data-slot': _dataSlot,
    ...rest
  } = attrs
  return rest
})
const selectedIndex = computed(() =>
  props.options.findIndex((option) => Object.is(option.value, value.value))
)
const selectedOption = computed(() => props.options[selectedIndex.value])
const serializedValue = computed(() => {
  const current = value.value
  return ['string', 'number', 'boolean'].includes(typeof current)
    ? String(current)
    : ''
})
const groupedOptions = computed(() => {
  const groups = new Map()

  props.options.forEach((option, index) => {
    const label = option.group ?? null
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label).push({ option, index })
  })

  return [...groups].map(([label, entries]) => ({ label, entries }))
})
const activeDescendant = computed(() =>
  isOpen.value && highlightedIndex.value >= 0
    ? optionId(highlightedIndex.value)
    : undefined
)

let form
let resizeObserver
let typeahead = ''
let typeaheadTimer
let pendingEdge = 'selected'

function optionId(index) {
  return `${controlId.value}-option-${index}`
}

function optionIsDisabled(index) {
  return Boolean(props.options[index]?.disabled)
}

function enabledIndexes() {
  return props.options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.disabled)
    .map(({ index }) => index)
}

function initialHighlight(edge = 'selected') {
  const enabled = enabledIndexes()
  if (!enabled.length) return -1

  if (
    edge === 'selected' &&
    selectedIndex.value >= 0 &&
    !optionIsDisabled(selectedIndex.value)
  ) {
    return selectedIndex.value
  }

  return edge === 'last' ? enabled.at(-1) : enabled[0]
}

function syncTriggerWidth() {
  triggerWidth.value = trigger.value?.getBoundingClientRect().width ?? 0
}

async function revealHighlighted() {
  await nextTick()
  if (highlightedIndex.value < 0) return

  const content = popover.value?.content?.value ?? popover.value?.content
  content
    ?.querySelector?.(`[data-option-index="${highlightedIndex.value}"]`)
    ?.scrollIntoView?.({ block: 'nearest' })
}

function requestOpen(nextOpen) {
  if (!isOpenControlled.value) internalOpen.value = nextOpen
  emit('update:open', nextOpen)
}

function handlePopoverOpen(nextOpen) {
  requestOpen(nextOpen)
}

function openSelect(edge = 'selected') {
  if (props.disabled) return
  pendingEdge = edge
  syncTriggerWidth()

  if (isOpen.value) {
    highlightedIndex.value = initialHighlight(edge)
    revealHighlighted()
  } else {
    popover.value?.open(trigger.value)
  }
}

function closeSelect({ restoreFocus = false } = {}) {
  popover.value?.close({ restoreFocus })
}

function clearTypeahead() {
  typeahead = ''
  clearTimeout(typeaheadTimer)
  typeaheadTimer = undefined
}

function normalizedLabel(option) {
  return String(option?.label ?? '')
    .trim()
    .toLocaleLowerCase()
}

function findTypeaheadMatch(text) {
  const enabled = enabledIndexes()
  if (!enabled.length) return -1

  const current = isOpen.value
    ? enabled.indexOf(highlightedIndex.value)
    : enabled.indexOf(selectedIndex.value)
  const ordered = [
    ...enabled.slice(current + 1),
    ...enabled.slice(0, current + 1)
  ]

  return (
    ordered.find((index) =>
      normalizedLabel(props.options[index]).startsWith(text)
    ) ?? -1
  )
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

  let match = findTypeaheadMatch(typeahead)
  if (match < 0 && new Set(typeahead).size === 1) {
    typeahead = typeahead.at(-1)
    match = findTypeaheadMatch(typeahead)
  }

  if (match < 0) return true
  if (isOpen.value) {
    highlightedIndex.value = match
    revealHighlighted()
  } else {
    choose(match, { close: false })
  }
  return true
}

function moveHighlight(step) {
  const enabled = enabledIndexes()
  if (!enabled.length) return
  const current = enabled.indexOf(highlightedIndex.value)
  const next =
    current < 0
      ? step > 0
        ? 0
        : enabled.length - 1
      : (current + step + enabled.length) % enabled.length
  highlightedIndex.value = enabled[next]
  revealHighlighted()
}

function choose(index, { close = true } = {}) {
  const option = props.options[index]
  if (!option || option.disabled || props.disabled) return

  if (!isValueControlled.value) internalValue.value = option.value
  emit('update:modelValue', option.value)
  emit('change', option.value, option)
  highlightedIndex.value = index
  clearTypeahead()

  if (close) closeSelect({ restoreFocus: true })
}

function handleKeydown(event) {
  if (props.disabled) return

  if (!isOpen.value) {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault()
      openSelect(event.key === 'ArrowUp' ? 'last' : 'selected')
      return
    }

    handleTypeahead(event)
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closeSelect({ restoreFocus: true })
  } else if (event.key === 'Tab') {
    clearTypeahead()
    closeSelect()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveHighlight(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveHighlight(-1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    highlightedIndex.value = initialHighlight('first')
    revealHighlighted()
  } else if (event.key === 'End') {
    event.preventDefault()
    highlightedIndex.value = initialHighlight('last')
    revealHighlighted()
  } else if (['Enter', ' '].includes(event.key)) {
    event.preventDefault()
    if (highlightedIndex.value >= 0) choose(highlightedIndex.value)
  } else {
    handleTypeahead(event)
  }
}

function handleTriggerClick() {
  if (!isOpen.value) pendingEdge = 'selected'
  syncTriggerWidth()
}

function handleFormReset() {
  if (!isValueControlled.value) internalValue.value = props.defaultValue
  if (isOpen.value) closeSelect()
}

watch(
  isOpen,
  async (nextOpen) => {
    clearTypeahead()
    if (!nextOpen) {
      highlightedIndex.value = -1
      return
    }

    highlightedIndex.value = initialHighlight(pendingEdge)
    pendingEdge = 'selected'
    syncTriggerWidth()
    await revealHighlighted()
  },
  { flush: 'post' }
)

watch(
  () => props.options,
  () => {
    if (!isOpen.value) return
    highlightedIndex.value = initialHighlight('selected')
    revealHighlighted()
  },
  { deep: true }
)

onMounted(() => {
  form = root.value?.closest?.('form')
  form?.addEventListener('reset', handleFormReset)

  if (typeof ResizeObserver !== 'undefined' && trigger.value) {
    resizeObserver = new ResizeObserver(syncTriggerWidth)
    resizeObserver.observe(trigger.value)
  }

  syncTriggerWidth()
})

onBeforeUnmount(() => {
  clearTypeahead()
  resizeObserver?.disconnect()
  form?.removeEventListener('reset', handleFormReset)
})

defineExpose({
  close: closeSelect,
  focus: (options) => trigger.value?.focus(options),
  open: openSelect,
  trigger
})
</script>

<template>
  <span
    ref="root"
    data-slot="select"
    :data-state="isOpen ? 'open' : 'closed'"
    :data-placeholder="selectedOption ? undefined : ''"
    :data-disabled="disabled ? '' : undefined"
    :data-invalid="
      attrs['aria-invalid'] === true || attrs['aria-invalid'] === 'true'
        ? ''
        : undefined
    "
    class="relative grid w-full"
  >
    <button
      ref="trigger"
      v-bind="forwardedTriggerAttrs"
      :id="controlId"
      type="button"
      role="combobox"
      :disabled="disabled"
      :popovertarget="contentId"
      popovertargetaction="toggle"
      :aria-expanded="String(isOpen)"
      :aria-controls="listboxId"
      aria-haspopup="listbox"
      :aria-activedescendant="activeDescendant"
      :aria-required="required || undefined"
      data-slot="select-trigger"
      :data-state="isOpen ? 'open' : 'closed'"
      :data-placeholder="selectedOption ? undefined : ''"
      :class="triggerClasses"
      :style="attrs.style"
      @click="handleTriggerClick"
      @keydown="handleKeydown"
      @blur="emit('blur', $event)"
    >
      <span
        data-slot="select-value"
        :class="
          selectedOption
            ? 'truncate'
            : 'truncate text-gray-500 dark:text-gray-400'
        "
      >
        <slot v-if="selectedOption" name="value" :option="selectedOption">
          {{ selectedOption.label }}
        </slot>
        <template v-else>{{ placeholder }}</template>
      </span>

      <span
        data-slot="select-icon"
        class="shrink-0 text-gray-500 dark:text-gray-400"
      >
        <slot name="icon" :open="isOpen">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="size-4"
          >
            <path
              d="m6 8 4 4 4-4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </slot>
      </span>
    </button>

    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="serializedValue"
      :disabled="disabled"
      :form="attrs.form"
    />

    <Popover
      ref="popover"
      :id="contentId"
      :open="isOpen"
      :placement="placement"
      :offset="offset"
      data-slot="select-content"
      class="max-h-72 overflow-hidden p-1"
      :style="triggerWidth ? { minWidth: `${triggerWidth}px` } : undefined"
      @update:open="handlePopoverOpen"
    >
      <div
        :id="listboxId"
        role="listbox"
        :aria-labelledby="
          attrs['aria-label']
            ? undefined
            : (attrs['aria-labelledby'] ?? controlId)
        "
        :aria-label="
          attrs['aria-label'] ? `${attrs['aria-label']} options` : undefined
        "
        data-slot="select-listbox"
        class="max-h-68 overflow-y-auto overscroll-contain outline-none"
      >
        <template v-if="options.length">
          <div
            v-for="(group, groupIndex) in groupedOptions"
            :key="group.label ?? `ungrouped-${groupIndex}`"
            :role="group.label ? 'group' : undefined"
            :aria-label="group.label || undefined"
            data-slot="select-group"
          >
            <p
              v-if="group.label"
              data-slot="select-group-label"
              class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              {{ group.label }}
            </p>

            <div
              v-for="{ option, index } in group.entries"
              :id="optionId(index)"
              :key="index"
              role="option"
              :aria-label="String(option.label)"
              :aria-selected="String(index === selectedIndex)"
              :aria-disabled="option.disabled || undefined"
              data-slot="select-option"
              :data-option-index="index"
              :data-highlighted="index === highlightedIndex ? '' : undefined"
              :data-selected="index === selectedIndex ? '' : undefined"
              :data-disabled="option.disabled ? '' : undefined"
              class="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded px-3 py-2 text-sm text-gray-700 outline-none data-highlighted:bg-gray-100 data-highlighted:text-gray-950 data-disabled:cursor-not-allowed data-disabled:opacity-40 dark:text-gray-200 dark:data-highlighted:bg-white/10 dark:data-highlighted:text-white"
              @pointermove="!option.disabled && (highlightedIndex = index)"
              @pointerdown.prevent
              @click="choose(index)"
            >
              <span class="min-w-0 flex-1 truncate">
                <slot
                  name="option"
                  :option="option"
                  :selected="index === selectedIndex"
                  :highlighted="index === highlightedIndex"
                >
                  {{ option.label }}
                </slot>
              </span>

              <span
                data-slot="select-indicator"
                class="grid size-5 shrink-0 place-items-center"
                aria-hidden="true"
              >
                <svg
                  v-if="index === selectedIndex"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="size-4"
                >
                  <path
                    d="m5 10 3 3 7-7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </template>

        <div
          v-else
          data-slot="select-empty"
          class="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <slot name="empty">No options available.</slot>
        </div>
      </div>
    </Popover>
  </span>
</template>
