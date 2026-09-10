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
    <circle cx="12" cy="12" r="8.25" />
    <path
      d="M3.75 12h16.5M12 3.75c2.25 2.25 3.25 5 3.25 8.25S14.25 18 12 20.25C9.75 18 8.75 15.25 8.75 12S9.75 6 12 3.75"
    />
  </svg>
</template>
