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
      class="rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg"
    >
      <h3 class="mb-2 text-xl font-semibold text-brand">
        Welcome, {{ loggedInUser.fullName }}
      </h3>
      <p class="mb-4 text-gray-600">
        You are logged in as {{ loggedInUser.email }}
      </p>
      <Link
        href="/profile"
        class="mt-2 rounded-lg border border-brand px-4 py-2 text-brand transition-colors duration-300 hover:bg-brand hover:text-white"
      >
        Edit Profile
      </Link>
    </section>
  </section>
</template>
