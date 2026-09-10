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
      d="M10.25 5H6.5c-1.24 0-2.25 1.01-2.25 2.25v9.5C4.25 17.99 5.26 19 6.5 19h3.75"
    />
    <path d="M9 12h10.5m-4-4 4 4-4 4" />
  </svg>
</template>
