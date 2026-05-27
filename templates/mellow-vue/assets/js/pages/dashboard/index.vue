<script setup>
import { usePage, Link, Head } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({
  layout: AppLayout
})
const page = usePage()
const loggedInUser = page.props.loggedInUser
</script>
<template>
  <Head title="Dashboard | Mellow"></Head>
  <section class="mx-auto max-w-4xl px-4">
    <section
      class="from-brand-50/10 rounded-lg bg-gradient-to-b to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
    >
      <h3 class="text-brand mb-2 text-xl font-semibold">
        Welcome, {{ loggedInUser.fullName }}
      </h3>
      <p class="mb-4 text-gray-600">
        You are logged in as {{ loggedInUser.email }}
      </p>
      <Link
        href="/profile"
        class="border-brand text-brand hover:bg-brand mt-2 rounded-lg border px-4 py-2 transition-colors duration-300 hover:text-white"
      >
        Edit Profile
      </Link>
    </section>
  </section>
</template>
