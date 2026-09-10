<script setup>
import { computed, useAttrs } from 'vue'
import { twMerge } from 'tailwind-merge'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /**
   * The rendered element. Pass an Inertia Link component directly when the
   * destination should retain navigation semantics.
   */
  as: {
    type: [String, Object, Function],
    default: 'button',
    validator: (value) =>
      typeof value !== 'string' || ['button', 'a'].includes(value)
  },
  /** Native button type. Ignored when `as` does not render a button. */
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  /**
   * Uses the native disabled attribute for buttons and accessible disabled
   * link semantics for anchors or component links.
   */
  disabled: {
    type: Boolean,
    default: false
  }
})

const attrs = useAttrs()

const baseClasses = [
  'inline-flex min-h-11 min-w-11 cursor-pointer select-none items-center justify-center gap-2 rounded-md no-underline',
  'bg-gray-950 px-4 py-2 text-sm font-medium text-nowrap text-white',
  'transition-colors duration-150 ease-out',
  'hover:bg-gray-800 active:bg-gray-700',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 dark:focus-visible:outline-gray-400',
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  'aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
  'dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 dark:active:bg-gray-200',
  'motion-reduce:transition-none'
]

const isNativeButton = computed(() => props.as === 'button')

const forwardedAttrs = computed(() => {
  const {
    class: _class,
    tabindex: _tabindex,
    'aria-disabled': _ariaDisabled,
    'data-slot': _dataSlot,
    ...rest
  } = attrs

  return rest
})

const buttonClasses = computed(() => twMerge(baseClasses, attrs.class))

const managedAriaDisabled = computed(() => {
  if (isNativeButton.value) return undefined
  if (props.disabled) return 'true'
  return attrs['aria-disabled']
})

const managedTabindex = computed(() => {
  if (!isNativeButton.value && props.disabled) return -1
  return attrs.tabindex
})

function guardDisabledClick(event) {
  if (!props.disabled || isNativeButton.value) return

  event.preventDefault()
  event.stopImmediatePropagation()
}

function guardDisabledKeydown(event) {
  if (!['Enter', ' '].includes(event.key)) return

  guardDisabledClick(event)
}
</script>

<template>
  <component
    :is="as"
    v-bind="forwardedAttrs"
    :type="isNativeButton ? type : undefined"
    :disabled="isNativeButton ? disabled : undefined"
    :aria-disabled="managedAriaDisabled"
    :tabindex="managedTabindex"
    :data-disabled="disabled ? '' : undefined"
    data-slot="button"
    :class="buttonClasses"
    @click.capture="guardDisabledClick"
    @keydown.capture="guardDisabledKeydown"
  >
    <slot />
  </component>
</template>
