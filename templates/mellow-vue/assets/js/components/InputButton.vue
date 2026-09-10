<script setup>
import Button from '@/components/ui/button/Button.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'

defineProps({
  disabled: { type: Boolean, default: false },
  processing: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <Button
    :disabled="disabled || processing"
    :aria-busy="processing"
    type="submit"
    class="hover:bg-brand active:bg-brand dark:bg-brand dark:hover:bg-brand dark:active:bg-brand border-brand bg-brand disabled:text-gray relative flex items-center justify-center rounded-full border px-4 py-3 text-base font-medium text-white disabled:cursor-not-allowed disabled:border-gray-200/40 disabled:bg-gray-200/40 disabled:opacity-100 dark:text-white"
  >
    <Spinner v-if="processing" class="absolute h-5 w-5 text-white" />
    <span :class="{ 'text-transparent': processing }"><slot>Submit</slot></span>
  </Button>
</template>
