<template>
  <button
    @click="count++"
    class="rounded-lg border border-purple-500 px-4 py-2 text-sm text-gray-600 hover:border-purple-600"
  >
    Clicked {{ count }} times
  </button>
</template>
<script setup>
import { ref } from "vue";
const count = ref(0);
</script>
