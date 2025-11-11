<script setup>
import { Link, Head, useForm } from '@inertiajs/vue3'
import { computed } from 'vue'
import Toast from '@/volt/Toast.vue'
import Message from '@/volt/Message.vue'
import { useFlashToast } from '@/composables/flashToast'

const form = useForm({
  email: ''
})

useFlashToast()

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

  <div
    class="flex min-h-screen flex-col justify-center bg-linear-to-br from-brand-50/30 via-white to-accent-50/20 py-12 sm:px-6 lg:px-8"
  >
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-brand-200/20 blur-3xl"
      ></div>
      <div
        class="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl"
      ></div>
    </div>

    <div class="relative sm:mx-auto sm:w-full sm:max-w-lg">
      <div class="mb-8 flex items-center justify-center">
        <Link href="/" class="group">
          <div class="relative">
            <div
              class="absolute inset-0 scale-110 rounded-2xl bg-brand-200/30 opacity-0 blur-xl transition-opacity group-hover:opacity-100"
            ></div>
            <img
              src="/images/logo.svg"
              alt="Ascent Logo"
              class="relative h-12 w-auto"
            />
          </div>
        </Link>
      </div>

      <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          Forgot your password?
        </h1>
        <p class="mt-2 text-base text-gray-600">
          Enter your email address and we'll send you a link to reset your
          password
        </p>
      </header>
    </div>

    <div class="relative sm:mx-auto sm:w-full sm:max-w-lg">
      <div class="relative">
        <div
          class="absolute inset-0 scale-105 rounded-2xl bg-linear-to-r from-brand-600/10 to-accent-600/10 blur-xl"
        ></div>

        <div
          class="relative rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-2xl"
        >
          <div v-if="form.errors.email" class="mb-6" role="alert">
            <Message severity="error" class="w-full">
              {{ form.errors.email }}
            </Message>
          </div>

          <form @submit.prevent="submit" class="space-y-5">
            <div>
              <label
                for="email"
                class="mb-2 block text-sm font-semibold text-gray-900"
              >
                Email Address
              </label>
              <div class="relative">
                <input
                  id="email"
                  type="email"
                  autocomplete="email"
                  required
                  v-model="form.email"
                  :class="[
                    'w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200',
                    form.errors.email
                      ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                      : 'border-gray-300 bg-gray-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
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
                  'flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                  disableForgotPasswordButton
                    ? 'bg-gray-300'
                    : 'bg-linear-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
                ]"
              >
                <div v-if="form.processing" class="flex items-center space-x-2">
                  <svg
                    class="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Sending reset link...</span>
                </div>
                <span v-else>Send Reset Link</span>
              </button>
            </div>
          </form>

          <div class="mt-6 text-center">
            <Link
              href="/login?mode=password"
              class="flex items-center justify-center text-sm font-medium text-gray-600 transition-colors hover:text-brand-600"
            >
              <svg
                class="mr-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Toast />
</template>
