<script setup>
const props = defineProps({
  processing: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button
    type="submit"
    class="relative flex items-center justify-center rounded-md border border-brand bg-brand px-4 py-3 text-white disabled:cursor-not-allowed disabled:border-gray-200/40 disabled:bg-gray-200/40 disabled:text-gray"
  >
    <svg
      v-if="processing"
      class="absolute h-5 w-5 animate-spin text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span :class="{ invisible: processing }"><slot>Submit</slot></span>
  </button>
</template>
