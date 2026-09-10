<script setup>
import { computed, ref, useAttrs } from 'vue'
import { twMerge } from 'tailwind-merge'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number], default: undefined },
  type: { type: String, default: 'text' }
})
const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const element = ref()
let composing = false

const resolvedValue = computed(() => props.modelValue ?? attrs.value)

const forwardedAttrs = computed(() => {
  const {
    class: _class,
    value: _value,
    'data-slot': _dataSlot,
    ...rest
  } = attrs
  return rest
})

function updateValue(event) {
  if (composing) return
  const value = ['number', 'range'].includes(props.type)
    ? event.target.value === ''
      ? ''
      : event.target.valueAsNumber
    : event.target.value
  emit('update:modelValue', value)
}

function finishComposition(event) {
  composing = false
  updateValue(event)
}

defineExpose({
  element,
  focus: (options) => element.value?.focus(options)
})
</script>

<template>
  <input
    ref="element"
    v-bind="forwardedAttrs"
    :type="type"
    :value="resolvedValue"
    data-slot="input"
    :class="
      twMerge(
        [
          'block min-h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-950 shadow-sm outline-none transition-colors duration-150',
          'placeholder:text-gray-500 hover:border-gray-400',
          'focus-visible:border-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950',
          'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
          'aria-invalid:border-red-600 aria-invalid:focus-visible:outline-red-600',
          'dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-400 dark:hover:border-gray-600 dark:focus-visible:border-white dark:focus-visible:outline-white dark:disabled:bg-gray-900 dark:disabled:text-gray-500 dark:aria-invalid:border-red-500 dark:aria-invalid:focus-visible:outline-red-500',
          'motion-reduce:transition-none'
        ],
        attrs.class
      )
    "
    @compositionstart="composing = true"
    @compositionend="finishComposition"
    @input="updateValue"
  />
</template>
