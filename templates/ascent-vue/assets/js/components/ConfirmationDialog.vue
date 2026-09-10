<script setup>
import Modal from '@/components/Modal.vue'
import Button from '@/components/ui/button/Button.vue'
defineProps({ state: { type: Object, required: true } })
</script>
<template>
  <Modal
    :open="Boolean(state.pending)"
    :title="state.pending?.header || 'Confirm action'"
    @close="state.cancel"
  >
    <p class="text-gray-600 dark:text-gray-300">{{ state.pending?.message }}</p>
    <template #footer>
      <Button
        class="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
        autofocus
        @click="state.cancel"
        >{{ state.pending?.rejectLabel || 'Cancel' }}</Button
      >
      <Button
        :class="
          state.pending?.acceptClass ||
          'bg-brand text-white hover:bg-brand-600 dark:bg-brand dark:text-white dark:hover:bg-brand-600'
        "
        @click="state.accept"
        >{{ state.pending?.acceptLabel || 'Confirm' }}</Button
      >
    </template>
  </Modal>
</template>
