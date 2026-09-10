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

  <div
    class="from-brand-50/30 to-accent-50/20 flex min-h-screen flex-col justify-center bg-linear-to-br via-white py-12 sm:px-6 lg:px-8"
  >
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="bg-brand-200/20 absolute top-20 left-1/4 h-96 w-96 rounded-full blur-3xl"
      ></div>
      <div
        class="bg-accent-200/20 absolute right-1/4 bottom-20 h-72 w-72 rounded-full blur-3xl"
      ></div>
    </div>

    <div class="relative sm:mx-auto sm:w-full sm:max-w-lg">
      <div class="mb-8 flex items-center justify-center">
        <Link href="/" class="group">
          <div class="relative">
            <div
              class="bg-brand-200/30 absolute inset-0 scale-110 rounded-2xl opacity-0 blur-xl transition-opacity group-hover:opacity-100"
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
          class="from-brand-600/10 to-accent-600/10 absolute inset-0 scale-105 rounded-2xl bg-linear-to-r blur-xl"
        ></div>

        <div
          class="relative rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-2xl"
        >
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
                class="mb-2 block text-sm font-semibold text-gray-900"
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
                    'w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200',
                    form.errors.email
                      ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                      : 'focus:border-brand-300 focus:ring-brand-100 border-gray-300 bg-gray-200 focus:bg-white focus:ring-4'
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
                    : 'from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:ring-brand-500 bg-linear-to-r focus:ring-2 focus:ring-offset-2 focus:outline-none'
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
              class="hover:text-brand-600 flex items-center justify-center text-sm font-medium text-gray-600 transition-colors"
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
