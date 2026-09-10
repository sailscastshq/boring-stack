<script setup>
import Input from '@/components/ui/input/Input.vue'

import Spinner from '@/components/ui/spinner/Spinner.vue'
import ChevronLeft from '@/components/ui/icons/ChevronLeft.vue'
import { Link, Head, useForm } from '@inertiajs/vue3'
import { computed } from 'vue'
import Message from '@/components/ui/alert/Alert.vue'

const form = useForm({
  email: ''
})

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

const disableForgotPasswordButton = computed(() => {
  const isEmailValid = emailRegex.test(form.email)
  if (!isEmailValid) return true
  if (form.processing) return true
  return false
})

function submit() {
  form.post('/forgot-password')
}
</script>

<template>
  <Head title="Reset Password | Ascent" />

  <div class="ascent-auth">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="hidden"></div>
      <div class="hidden"></div>
    </div>

    <div class="relative sm:mx-auto sm:w-full sm:max-w-lg">
      <div class="mb-8 flex items-center justify-center">
        <Link href="/" class="group">
          <div class="relative">
            <div class="hidden"></div>
            <span
              class="inline-flex items-center gap-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
              aria-label="Ascent"
              >Ascent<span
                class="text-brand-600 dark:text-brand-300"
                aria-hidden="true"
                >↗</span
              ></span
            >
          </div>
        </Link>
      </div>

      <header class="mb-8 text-center">
        <h1
          class="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
        >
          Forgot your password?
        </h1>
        <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your
          password
        </p>
      </header>
    </div>

    <div class="relative sm:mx-auto sm:w-full sm:max-w-lg">
      <div class="relative">
        <div class="hidden"></div>

        <div class="ascent-auth-panel">
          <div v-if="form.errors.email" class="mb-6" role="alert">
            <Message
              role="alert"
              class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 w-full"
            >
              {{ form.errors.email }}
            </Message>
          </div>

          <form @submit.prevent="submit" class="space-y-5">
            <div>
              <label
                for="email"
                class="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Email Address
              </label>
              <div class="relative">
                <Input
                  id="email"
                  type="email"
                  autocomplete="email"
                  required
                  v-model="form.email"
                  :class="[
                    'w-full rounded-lg border px-4 py-4 text-base font-medium transition-all duration-200',
                    form.errors.email
                      ? 'border-red-300 bg-red-50 ring-2 ring-red-100 dark:bg-red-950/40 dark:border-red-900'
                      : 'focus:border-brand-300 focus:ring-brand-100 border-gray-300 bg-white focus:bg-white focus:ring-4 dark:border-gray-700 dark:bg-gray-800'
                  ]"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                :disabled="disableForgotPasswordButton"
                :class="[
                  'flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-none transition-all duration-200 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                  disableForgotPasswordButton
                    ? 'bg-gray-300'
                    : 'hover:bg-brand-700 focus:ring-brand-500  focus:ring-2 focus:ring-offset-2 focus:outline-none bg-brand-600 dark:bg-brand-600'
                ]"
              >
                <div v-if="form.processing" class="flex items-center space-x-2">
                  <Spinner class="h-5 w-5" />
                  <span>Sending reset link...</span>
                </div>
                <span v-else>Send Reset Link</span>
              </button>
            </div>
          </form>

          <div class="mt-6 text-center">
            <Link
              href="/login?mode=password"
              class="hover:text-brand-600 flex items-center justify-center text-sm font-medium text-gray-600 transition-colors dark:text-gray-400"
            >
              <ChevronLeft class="mr-1 h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
