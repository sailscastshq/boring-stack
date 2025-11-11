<script setup>
import { Head, usePage } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { computed } from 'vue'

defineOptions({
  layout: DashboardLayout
})

const page = usePage()
const loggedInUser = computed(() => page.props.loggedInUser)
</script>

<template>
  <Head title="Dashboard | Ascent" />

  <header class="mb-8">
    <div
      class="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-600 via-brand-700 to-accent-700 p-8 text-white shadow-2xl"
    >
      <div
        class="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-white/10"
      ></div>
      <div
        class="absolute bottom-0 left-0 h-24 w-24 -translate-x-4 translate-y-4 rounded-full bg-white/5"
      ></div>
      <div class="relative">
        <h1 class="mb-2 text-2xl font-bold">
          Welcome back, {{ loggedInUser.fullName.split(' ')[0] }}! 👋
        </h1>
        <p class="text-brand-100">
          Here's what's happening with your account today.
        </p>
      </div>
    </div>
  </header>

  <div
    class="flex min-h-[400px] items-center justify-center rounded-xl bg-white p-12 shadow-sm ring-1 ring-gray-100"
  >
    <div class="max-w-2xl text-center">
      <div class="mb-6 text-6xl">🎨</div>
      <h2 class="mb-4 text-3xl font-bold text-gray-900">
        This is your blank canvas
      </h2>
      <p class="text-lg text-gray-600">
        Go ahead, build something cool. Or don't. I am not your mom. (But
        seriously, you got this! 💪)
      </p>
    </div>
  </div>
</template>
