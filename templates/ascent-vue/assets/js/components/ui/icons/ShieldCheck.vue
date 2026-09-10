<script setup>
defineOptions({ inheritAttrs: false })
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    data-slot="icon"
    v-bind="$attrs"
  >
    <path
      d="M12 3.5c2.25 1.55 4.8 2.25 7.25 2.25v5.75c0 4.3-2.4 7.25-7.25 9-4.85-1.75-7.25-4.7-7.25-9V5.75c2.45 0 5-.7 7.25-2.25"
    />
    <path d="m8.5 12 2.25 2.25 4.75-5" />
  </svg>
</template>
