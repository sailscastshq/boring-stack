<script setup>
import { computed, ref, useAttrs } from 'vue'
import { twMerge } from 'tailwind-merge'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  orientation: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  }
})

const attrs = useAttrs()
const element = ref()
const isVertical = computed(() => props.orientation === 'vertical')
const baseClasses = computed(() =>
  isVertical.value ? 'w-px self-stretch' : 'h-px w-full'
)

const forwardedAttrs = computed(() => {
  const {
    class: _class,
    role: _role,
    'aria-orientation': _ariaOrientation,
    'data-orientation': _dataOrientation,
    'data-slot': _dataSlot,
    ...rest
  } = attrs
  return rest
})

defineExpose({ element })
</script>

<template>
  <component
    :is="isVertical ? 'div' : 'hr'"
    ref="element"
    v-bind="forwardedAttrs"
    data-slot="separator"
    :data-orientation="isVertical ? 'vertical' : 'horizontal'"
    :role="isVertical ? 'separator' : undefined"
    :aria-orientation="isVertical ? 'vertical' : undefined"
    :class="
      twMerge(
        'shrink-0 border-0 bg-gray-200 forced-colors:bg-current dark:bg-gray-800',
        baseClasses,
        attrs.class
      )
    "
  />
</template>
