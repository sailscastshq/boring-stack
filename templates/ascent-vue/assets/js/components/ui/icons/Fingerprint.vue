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
      d="M5 11.5a7 7 0 0 1 14 0c0 2.75-.4 5.2-1.25 7.25M7.5 11.5a4.5 4.5 0 0 1 9 0c0 3.9-.85 6.65-2.5 8.25M10 11.5a2 2 0 0 1 4 0c0 3.25-.65 5.5-2 7.25M5.25 15.25c.2 1.65.7 3.15 1.5 4.5M8 16.5c.3 1.4.75 2.55 1.4 3.5"
    />
  </svg>
</template>
