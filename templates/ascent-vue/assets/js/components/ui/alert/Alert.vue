<script setup>
import { computed, ref, useAttrs } from 'vue'
import { twMerge } from 'tailwind-merge'

defineOptions({ inheritAttrs: false })

defineProps({
  as: { type: [String, Object, Function], default: 'div' }
})

const attrs = useAttrs()
const element = ref()

const forwardedAttrs = computed(() => {
  const { class: _class, 'data-slot': _dataSlot, ...rest } = attrs
  return rest
})

defineExpose({ element })
</script>

<template>
  <component
    :is="as"
    ref="element"
    v-bind="forwardedAttrs"
    data-slot="alert"
    :class="
      twMerge(
        'relative w-full rounded-md bg-gray-100 p-4 text-sm text-gray-950 dark:bg-gray-900 dark:text-white',
        attrs.class
      )
    "
  >
    <slot />
  </component>
</template>
