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
      d="M10.25 5.25H6.5c-1.24 0-2.25 1.01-2.25 2.25v10c0 1.24 1.01 2.25 2.25 2.25h10c1.24 0 2.25-1.01 2.25-2.25v-3.75"
    />
    <path d="M13 4.25h6.75V11M19.5 4.5l-8.75 8.75" />
  </svg>
</template>
