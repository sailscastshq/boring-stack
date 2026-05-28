<script setup>
import { Head, Link } from '@inertiajs/vue3'

const props = defineProps({
  status: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
})

const homeHref = props.status === 404 ? '/' : '/dashboard'
</script>

<template>
  <Head :title="`${status} ${title} | Mellow`" />

  <main
    class="from-brand-50/10 flex min-h-screen items-center bg-gradient-to-b to-[#F9FAFB] px-6 py-16 text-black"
  >
    <section class="mx-auto w-full max-w-3xl">
      <p class="text-brand mb-4 text-sm font-semibold">Status {{ status }}</p>
      <h1 class="max-w-2xl text-4xl font-semibold text-black sm:text-5xl">
        {{ title }}
      </h1>
      <p class="mt-5 max-w-xl text-lg leading-8 text-gray-600">
        {{ message }}
      </p>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <Link
          :href="homeHref"
          class="min-h-11 bg-brand hover:bg-brand-600 focus:ring-brand-100 inline-flex items-center justify-center rounded-md px-5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2"
        >
          Go home
        </Link>
        <button
          type="button"
          class="min-h-11 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-5 text-sm font-semibold text-black shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
          @click="history.back()"
        >
          Go back
        </button>
      </div>
    </section>
  </main>
</template>
