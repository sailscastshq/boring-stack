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
    <path d="M5 5h14v14.5H5c-1.1 0-2-.9-2-2V8h2" />
    <path d="M8 8h8v3H8zM8 14h3M8 17h3M13.5 14H16M13.5 17H16" />
  </svg>
</template>
