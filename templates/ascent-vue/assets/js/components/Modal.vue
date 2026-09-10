<script setup>
import X from '@/components/ui/icons/X.vue'
import { useId } from 'vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import Button from '@/components/ui/button/Button.vue'
defineProps({
  open: Boolean,
  title: String,
  closable: { type: Boolean, default: true }
})
const emit = defineEmits(['close', 'update:open'])
const titleId = useId()
function close() {
  emit('update:open', false)
  emit('close')
}
</script>
<template>
  <Dialog
    :open="open"
    :dismissible="closable"
    :aria-labelledby="titleId"
    class="max-h-[90dvh] overflow-y-auto"
    @update:open="
      (value) => {
        emit('update:open', value)
        if (!value) emit('close')
      }
    "
  >
    <header class="mb-6 flex items-center justify-between gap-4">
      <h2 :id="titleId" class="text-xl font-semibold">{{ title }}</h2>
      <Button
        v-if="closable"
        class="min-h-8 bg-transparent px-2 py-1 text-gray-500 hover:bg-gray-100 dark:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Close dialog"
        @click="close"
        ><X class="h-4 w-4"
      /></Button>
    </header>
    <slot />
    <footer v-if="$slots.footer" class="mt-6 flex justify-end gap-2">
      <slot name="footer" />
    </footer>
  </Dialog>
</template>
