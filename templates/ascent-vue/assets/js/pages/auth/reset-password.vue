<script setup>
import { Link, Head, useForm } from '@inertiajs/vue3'
import { computed } from 'vue'
import Toast from '@/volt/Toast.vue'
import Message from '@/volt/Message.vue'
import { useFlashToast } from '@/composables/flashToast'

const props = defineProps({
  token: String
})

const form = useForm({
  token: props.token,
  password: '',
  confirmPassword: ''
})

useFlashToast()

const specialCharsRegex = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/

const containsSpecialChars = computed(() =>
  specialCharsRegex.test(form.password)
)
const passwordIsValid = computed(() => form.password?.length >= 8)
const passwordsMatch = computed(() => form.password === form.confirmPassword)
const disableResetPasswordButton = computed(() => {
  if (!passwordIsValid.value) return true
  if (!containsSpecialChars.value) return true
  if (!passwordsMatch.value) return true
  if (form.processing) return true
  return false
})

function submit() {
  form.post('/reset-password')
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
          Create new password
        </h1>
        <p class="mt-2 text-base text-gray-600">
          Please create a strong password for your account
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
          <div v-if="form.errors.password" class="mb-6" role="alert">
            <Message severity="error" class="w-full">
              {{ form.errors.password }}
            </Message>
          </div>

          <form @submit.prevent="submit" class="space-y-5">
            <div>
              <label
                for="password"
                class="mb-2 block text-sm font-semibold text-gray-900"
              >
                New Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  type="password"
                  autocomplete="new-password"
                  required
                  v-model="form.password"
                  :class="[
                    'w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200',
                    form.errors.password
                      ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                      : 'border-gray-300 bg-gray-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                  ]"
                  placeholder="Enter your new password"
                />
              </div>
            </div>

            <div>
              <label
                for="confirmPassword"
                class="mb-2 block text-sm font-semibold text-gray-900"
              >
                Confirm Password
              </label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  required
                  v-model="form.confirmPassword"
                  :class="[
                    'w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200',
                    form.confirmPassword && !passwordsMatch
                      ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                      : 'border-gray-300 bg-gray-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                  ]"
                  placeholder="Confirm your new password"
                />
              </div>
              <p
                v-if="form.confirmPassword && !passwordsMatch"
                class="mt-1 text-sm text-red-600"
              >
                Passwords do not match
              </p>
            </div>

            <div class="space-y-2">
              <p class="text-sm font-medium text-gray-700">
                Password requirements:
              </p>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div
                  :class="[
                    'flex items-center space-x-2 text-sm',
                    passwordIsValid ? 'text-green-600' : 'text-gray-500'
                  ]"
                >
                  <svg
                    :class="[
                      'h-4 w-4 shrink-0',
                      passwordIsValid ? 'text-green-500' : 'text-gray-400'
                    ]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>At least 8 characters</span>
                </div>
                <div
                  :class="[
                    'flex items-center space-x-2 text-sm',
                    containsSpecialChars ? 'text-green-600' : 'text-gray-500'
                  ]"
                >
                  <svg
                    :class="[
                      'h-4 w-4 shrink-0'
                      containsSpecialChars ? 'text-green-500' : 'text-gray-400'
                    ]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>One special character</span>
                </div>
              </div>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                :disabled="disableResetPasswordButton"
                :class="[
                  'flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                  disableResetPasswordButton
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
                  <span>Resetting password...</span>
                </div>
                <span v-else>Reset Password</span>
              </button>
            </div>
          </form>

          <div class="mt-6 text-center">
            <Link
              href="/login"
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
