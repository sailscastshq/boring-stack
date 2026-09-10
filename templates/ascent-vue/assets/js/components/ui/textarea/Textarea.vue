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
  modelValue: { type: [String, Number], default: undefined }
})
const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const element = ref()
let composing = false
let resizeObserver

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
  resizeToContent()
  emit('update:modelValue', event.target.value)
}

function finishComposition(event) {
  composing = false
  updateValue(event)
}

function resizeToContent() {
  if (!element.value) return

  element.value.style.removeProperty('--klean-textarea-height')
  element.value.style.setProperty(
    '--klean-textarea-height',
    `${element.value.scrollHeight}px`
  )
}

onMounted(() => {
  resizeToContent()

  if (typeof ResizeObserver === 'undefined') return
  let width = element.value.offsetWidth
  resizeObserver = new ResizeObserver(([entry]) => {
    if (entry.contentRect.width === width) return
    width = entry.contentRect.width
    resizeToContent()
  })
  resizeObserver.observe(element.value)
})
onBeforeUnmount(() => resizeObserver?.disconnect())

watch(resolvedValue, async () => {
  await nextTick()
  resizeToContent()
})

defineExpose({
  element,
  focus: (options) => element.value?.focus(options),
  resize: resizeToContent
})
</script>

<template>
  <textarea
    ref="element"
    v-bind="forwardedAttrs"
    :value="resolvedValue"
    data-slot="textarea"
    :class="
      twMerge(
        [
          'block h-(--klean-textarea-height) min-h-28 w-full resize-none overflow-y-hidden rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-950 shadow-sm outline-none transition-colors duration-150',
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
