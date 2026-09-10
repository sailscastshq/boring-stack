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
      d="M10.25 4.75a2 2 0 0 1 3.5 0l7 12.5a2 2 0 0 1-1.75 3H5a2 2 0 0 1-1.75-3z"
    />
    <path d="M12 9v4.75M12 17h.01" stroke-width="2" />
  </svg>
</template>
