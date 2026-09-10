<script setup>
import ArrowLeft from '@/components/ui/icons/ArrowLeft.vue'
import Envelope from '@/components/ui/icons/Envelope.vue'

import { Link, Head } from '@inertiajs/vue3'
</script>
<template>
  <Head title="Verification expired | Mellow"></Head>
  <section class="mellow-auth">
    <main class="mellow-auth-main">
      <section
        class="mb-6 flex flex-col items-center justify-center space-y-4 text-center"
      >
        <span
          class="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#FFECEC] text-[#FF3A3A]"
          ><Envelope class="h-[18px] w-[18px]"
        /></span>

        <h1 class="text-2xl">Token expired</h1>
        <p class="text-sm text-gray-600">
          The token sent to your email has expired or been used.
        </p>
        <a
          href="/resend-link"
          class="border-brand bg-brand disabled:text-gray w-full rounded-md border px-4 py-3 text-white disabled:bg-gray-200/40"
        >
          Resend link
        </a>
      </section>
    </main>
    <footer class="my-8 text-center text-black">
      <Link href="/signup" class="flex items-center justify-center">
        <ArrowLeft class="h-4 w-4" />
        <span class="pl-2">Back to sign up</span>
      </Link>
    </footer>
  </section>
</template>
