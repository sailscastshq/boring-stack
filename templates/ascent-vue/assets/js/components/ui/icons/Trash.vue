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
    <path d="M4.5 7.25h15" />
    <path d="M9 7.25v-1.5c0-.83.67-1.5 1.5-1.5h3c.83 0 1.5.67 1.5 1.5v1.5" />
    <path d="m6.5 7.25.75 12.5h9.5l.75-12.5" />
    <path d="M10 11v5.25M14 11v5.25" />
  </svg>
</template>
