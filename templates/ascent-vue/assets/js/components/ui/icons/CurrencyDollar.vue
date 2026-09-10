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
      d="M15 8.5c-.65-.75-1.65-1.1-3-1.1-1.75 0-3 .9-3 2.25 0 3.6 6 1.25 6 4.7 0 1.35-1.25 2.25-3 2.25-1.35 0-2.35-.35-3-1.1M12 5.75v12.5"
    />
  </svg>
</template>
