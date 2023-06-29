<script setup>
import { Link } from '@inertiajs/inertia-vue3'
import Counter from '@/components/Counter.vue'

const { name } = defineProps({
  name: String
})
</script>

<template>
  <div
    class="flex h-screen flex-col items-center justify-center space-y-8 text-center text-gray-700"
  >
    <a href="/auth/redirect">Signup with Google</a>
  </div>
</template>
