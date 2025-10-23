<script setup>
import Button from '@/volt/Button.vue'
import { useDarkMode } from '@/composables/darkMode'

const { isDark, toggleDarkMode } = useDarkMode()
</script>

<template>
  <Button
    :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
    rounded
    text
    severity="secondary"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :tooltip="isDark ? 'Light mode' : 'Dark mode'"
    :tooltip-options="{ position: 'bottom' }"
    @click="toggleDarkMode"
  />
</template>
