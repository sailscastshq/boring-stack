<script setup>
import ArrowLeft from '@/components/ui/icons/ArrowLeft.vue'
import Key from '@/components/ui/icons/Key.vue'

import { Link, Head, useForm } from '@inertiajs/vue3'
import { computed } from 'vue'
import InputEmail from '@/components/InputEmail.vue'
import InputButton from '@/components/InputButton.vue'
const form = useForm({
  email: null
}).withPrecognition('post', '/forgot-password')
const disableForgetPasswordButton = computed(() => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  const isEmailValid = emailRegex.test(form.email)
  if (!isEmailValid) return true
  if (form.processing) return true
  return false
})
</script>

<template>
  <Head title="Forgot password | Mellow"></Head>
  <section class="mellow-auth">
    <main class="mellow-auth-main">
      <section
        class="mb-6 flex flex-col items-center justify-center space-y-2 text-center"
      >
        <span
          class="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#F4ECFF] text-[#6C25C1]"
          ><Key class="h-[18px] w-[18px]"
        /></span>

        <h1 class="text-2xl">Forgot password?</h1>
        <p class="text-sm text-gray-600">
          We'll send reset instructions to your email
        </p>
      </section>
      <form
        @submit.prevent="form.post('/forgot-password')"
        class="mb-4 flex flex-col space-y-6"
      >
        <InputEmail
          v-model="form.email"
          :error="form.errors.email"
          @blur="form.validate('email')"
        />
        <InputButton
          :processing="form.processing"
          :disabled="disableForgetPasswordButton"
          >Forgot password</InputButton
        >
      </form>
    </main>
    <footer class="my-8 text-center text-black">
      <Link href="/login" class="flex items-center justify-center">
        <ArrowLeft class="h-4 w-4" />
        <span class="pl-2">Back to login</span>
      </Link>
    </footer>
  </section>
</template>
