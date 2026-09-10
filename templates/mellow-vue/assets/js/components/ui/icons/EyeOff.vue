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
      d="M8.25 7.15A9.8 9.8 0 0 1 12 6.5c5.5 0 8.5 5.5 8.5 5.5a13 13 0 0 1-2.35 3.1M14.5 17.15a9.8 9.8 0 0 1-2.5.35C6.5 17.5 3.5 12 3.5 12a13 13 0 0 1 2.1-2.85"
    />
    <path d="M9.85 9.85a3 3 0 0 0 4.3 4.3M4.5 4.5l15 15" />
  </svg>
</template>
