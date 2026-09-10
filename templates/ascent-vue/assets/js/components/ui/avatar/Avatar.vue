<script setup>
import { computed, ref, useAttrs, watch } from 'vue'
import { twMerge } from 'tailwind-merge'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, required: true }
})

const attrs = useAttrs()
const element = ref()
const failed = ref(false)

const BASE_CLASSES =
  'inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 object-cover text-sm font-medium text-gray-700 select-none dark:bg-gray-800 dark:text-gray-300'

const forwardedAttrs = computed(() => {
  const {
    class: _class,
    onError: _onError,
    'data-slot': _dataSlot,
    'data-state': _dataState,
    ...rest
  } = attrs
  return rest
})

const fallbackAttrs = computed(() => {
  const {
    loading: _loading,
    decoding: _decoding,
    crossorigin: _crossorigin,
    referrerpolicy: _referrerpolicy,
    fetchpriority: _fetchpriority,
    sizes: _sizes,
    srcset: _srcset,
    usemap: _usemap,
    ismap: _ismap,
    onLoad: _onLoad,
    ...rest
  } = forwardedAttrs.value
  return rest
})

const hasCallerFallbackSemantics = computed(() =>
  ['role', 'aria-label', 'aria-hidden'].some((name) => name in attrs)
)

const fallbackSemantics = computed(() => {
  if (hasCallerFallbackSemantics.value) return {}
  if (props.alt) return { role: 'img', 'aria-label': props.alt }
  return { 'aria-hidden': 'true' }
})

const finalFallbackAttrs = computed(() => ({
  ...fallbackAttrs.value,
  ...fallbackSemantics.value
}))

watch(
  () => props.src,
  () => {
    failed.value = false
  },
  { flush: 'sync' }
)

function handleError(event) {
  failed.value = true

  const listener = attrs.onError
  if (Array.isArray(listener)) {
    for (const callback of listener) callback(event)
  } else if (typeof listener === 'function') {
    listener(event)
  }
}

defineExpose({ element })
</script>

<template>
  <img
    v-if="props.src && !failed"
    ref="element"
    v-bind="forwardedAttrs"
    data-slot="avatar"
    data-state="image"
    :src="props.src"
    :alt="props.alt"
    :class="twMerge(BASE_CLASSES, attrs.class)"
    @error="handleError"
  />
  <span
    v-else
    ref="element"
    v-bind="finalFallbackAttrs"
    data-slot="avatar"
    data-state="fallback"
    :class="twMerge(BASE_CLASSES, attrs.class)"
  >
    <slot />
  </span>
</template>
