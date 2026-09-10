<script setup>
import { computed, ref, useAttrs } from 'vue'
import { twMerge } from 'tailwind-merge'
import Dialog from '../dialog/Dialog.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  /** The native id targeted by a button's `commandfor` attribute. */
  id: { type: String, default: undefined },
  /** Framework-native controlled state. Omit for native uncontrolled use. */
  open: { type: Boolean, default: undefined },
  /** Initial state when `open` is not controlled. */
  defaultOpen: { type: Boolean, default: false },
  /** Whether Escape, platform dismissal, and backdrop clicks may close it. */
  dismissible: { type: Boolean, default: true }
})

const emit = defineEmits(['update:open'])
const attrs = useAttrs()
const sheet = ref()

const BASE_CLASSES = [
  'fixed inset-y-0 right-0 left-auto m-0 ml-auto h-dvh max-h-none w-[min(26rem,calc(100vw-1rem))] max-w-none translate-x-full overflow-hidden rounded-none border-y-0 border-r-0 border-l border-gray-200 bg-white p-0 text-gray-950 opacity-0 shadow-2xl outline-none',
  'open:translate-x-0 open:opacity-100',
  'transition-[display,overlay,opacity,transform] transition-discrete duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
  'starting:open:translate-x-full starting:open:opacity-0 motion-reduce:transition-none',
  'backdrop:bg-black/50 starting:open:backdrop:bg-black/0',
  'dark:border-gray-700 dark:bg-gray-950 dark:text-white'
]

const sheetAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const sheetClasses = computed(() => twMerge(BASE_CLASSES, attrs.class))

function showModal(source) {
  sheet.value?.showModal(source)
}

function close(returnValue) {
  sheet.value?.close(returnValue)
}

function requestClose(returnValue) {
  sheet.value?.requestClose(returnValue)
}

defineExpose({ sheet, showModal, close, requestClose })
</script>

<template>
  <Dialog
    ref="sheet"
    v-bind="sheetAttrs"
    :id="props.id"
    :open="props.open"
    :default-open="props.defaultOpen"
    :dismissible="props.dismissible"
    data-klean-sheet=""
    :class="sheetClasses"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </Dialog>
</template>
