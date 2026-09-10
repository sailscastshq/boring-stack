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
    <rect x="5.25" y="10" width="13.5" height="10.25" rx="2.25" />
    <path d="M8.25 10V7.75a3.75 3.75 0 0 1 7.5 0V10M12 14.25v2" />
  </svg>
</template>
