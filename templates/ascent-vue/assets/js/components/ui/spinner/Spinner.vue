<script setup>
import { computed, useAttrs, useSlots } from 'vue'
import { twMerge } from 'tailwind-merge'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const slots = useSlots()
const hasCustomMark = computed(() => Boolean(slots.default))

const forwardedAttrs = computed(() => {
  const {
    class: _class,
    'aria-hidden': _ariaHidden,
    role: _role,
    focusable: _focusable,
    tabindex: _tabindex,
    'data-slot': _dataSlot,
    ...rest
  } = attrs
  return rest
})
</script>

<template>
  <span
    v-bind="forwardedAttrs"
    data-slot="spinner"
    aria-hidden="true"
    :class="
      twMerge(
        [
          'inline-flex size-4 shrink-0 items-center justify-center motion-reduce:animate-none! motion-reduce:**:animate-none! *:size-full',
          hasCustomMark ? '' : 'animate-spin'
        ],
        attrs.class
      )
    "
  >
    <slot>
      <svg
        data-slot="spinner-mark"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          stroke-width="2"
          opacity="0.2"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </slot>
  </span>
</template>
