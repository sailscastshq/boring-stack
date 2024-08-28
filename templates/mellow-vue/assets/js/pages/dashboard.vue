<script setup>
import { usePage } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({
  layout: AppLayout
})
const page = usePage()
const loggedInUser = page.props.user
</script>
<template>
  <section class="mx-auto max-w-4xl px-4 py-12">
    <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
      Welcome to your dashboard,
      <span class="text-brand">{{ loggedInUser.fullName }}</span>
    </h1>
  </section>
</template>
