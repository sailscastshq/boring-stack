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
  <Head :title="`${status} ${title} | Ascent`" />

  <main
    class="flex min-h-screen items-center bg-white px-6 py-16 text-gray-950 dark:bg-gray-950 dark:text-white"
  >
    <section class="mx-auto w-full max-w-3xl">
      <p class="mb-4 text-sm font-semibold text-brand-600 dark:text-brand-300">
        Status {{ status }}
      </p>
      <h1
        class="max-w-2xl text-4xl font-bold text-gray-950 sm:text-5xl dark:text-white"
      >
        {{ title }}
      </h1>
      <p
        class="mt-5 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300"
      >
        {{ message }}
      </p>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <Link
          :href="homeHref"
          class="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
        >
          Go home
        </Link>
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          @click="history.back()"
        >
          Go back
        </button>
      </div>
    </section>
  </main>
</template>
