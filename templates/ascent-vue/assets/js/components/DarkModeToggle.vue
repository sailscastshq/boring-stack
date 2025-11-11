<script setup>
import { useDarkMode } from '@/composables/darkMode'
import SecondaryButton from '@/volt/SecondaryButton.vue'

const { isDark, toggleDarkMode } = useDarkMode()
</script>

<template>
  <SecondaryButton
    :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
    rounded
    text
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :tooltip="isDark ? 'Light mode' : 'Dark mode'"
    :tooltip-options="{ position: 'bottom' }"
    @click="toggleDarkMode"
  />
</template>
