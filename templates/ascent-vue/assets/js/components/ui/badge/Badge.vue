<script setup>
import { computed, ref, useAttrs } from 'vue'
import { twMerge } from 'tailwind-merge'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const element = ref()

const forwardedAttrs = computed(() => {
  const { class: _class, 'data-slot': _dataSlot, ...rest } = attrs
  return rest
})

defineExpose({ element })
</script>

<template>
  <span
    ref="element"
    v-bind="forwardedAttrs"
    data-slot="badge"
    :class="
      twMerge(
        'inline-flex items-center gap-1.5 rounded-full border border-transparent bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 text-nowrap forced-colors:border-current dark:bg-gray-800 dark:text-gray-300',
        attrs.class
      )
    "
  >
    <slot />
  </span>
</template>
