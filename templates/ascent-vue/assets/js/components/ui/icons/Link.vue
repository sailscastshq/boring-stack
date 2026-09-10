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
    <path d="m9.75 14.25-1.5 1.5a3.54 3.54 0 0 1-5-5l3-3a3.54 3.54 0 0 1 5 0" />
    <path
      d="m14.25 9.75 1.5-1.5a3.54 3.54 0 0 1 5 5l-3 3a3.54 3.54 0 0 1-5 0"
    />
    <path d="m8.75 15.25 6.5-6.5" />
  </svg>
</template>
