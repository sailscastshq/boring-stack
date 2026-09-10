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
    <circle cx="12" cy="12" r="3" />
    <path
      d="M12 3.75v2M12 18.25v2M3.75 12h2M18.25 12h2M6.17 6.17l1.42 1.42M16.41 16.41l1.42 1.42M17.83 6.17l-1.42 1.42M7.59 16.41l-1.42 1.42"
    />
    <circle cx="12" cy="12" r="6.25" />
  </svg>
</template>
