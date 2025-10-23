<script setup>
import { Link, Head } from '@inertiajs/vue3'
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Check your email'
  },
  message: {
    type: String,
    default:
      'We sent a link to your email address. Please check your inbox and follow the instructions.'
  },
  type: {
    type: String,
    default: 'verification'
  },
  email: String,
  backUrl: {
    type: String,
    default: '/login'
  },
  backText: {
    type: String,
    default: 'Back to login'
  }
})

const handleOpenEmailApp = () => {
  if (typeof window !== 'undefined') {
    window.location.href = 'mailto:'
  }
}

const subtitle = computed(() => {
  if (props.type === 'magic-link') {
    return 'We sent you a secure sign-in link'
  } else if (props.type === 'password-reset') {
    return 'Password reset instructions sent'
  }
  return 'Please verify your email address'
})

const emailText = computed(() => {
  if (props.email) {
    let linkType = 'a verification link'
    if (props.type === 'magic-link') {
      linkType = 'a magic link'
    } else if (props.type === 'password-reset') {
      linkType = 'password reset instructions'
    }
    return `We sent ${linkType} to ${props.email}`
  }
  return props.message
})

const pageTitle = computed(() => {
  if (props.type === 'password-reset') {
    return 'Check your email'
  }
  return props.title
})
</script>

<template>
  <Head :title="`${title} | Ascent`" />

  <div
    class="flex min-h-screen flex-col justify-center bg-gradient-to-br from-brand-50/30 via-white to-accent-50/20 py-12 sm:px-6 lg:px-8"
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

      <div class="relative">
        <div
          class="absolute inset-0 scale-105 rounded-2xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 blur-xl"
        ></div>

        <div
          class="relative rounded-2xl border border-gray-100 bg-white px-8 py-10 text-center shadow-2xl"
        >
          <div class="mb-6 flex justify-center">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-accent-100"
            >
              <svg
                class="h-8 w-8 text-brand-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <h1 class="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            {{ pageTitle }}
          </h1>

          <p class="mb-2 text-lg font-medium text-gray-600">
            {{ subtitle }}
          </p>

          <p class="mx-auto mb-8 max-w-md text-base text-gray-600">
            {{ emailText }}
          </p>

          <button
            type="button"
            @click="handleOpenEmailApp"
            class="mb-6 w-full rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-brand-700 hover:to-accent-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Open email app
          </button>

          <p v-if="type !== 'password-reset'" class="text-base text-gray-600">
            Didn't receive the email?{' '}
            <Link
              href="/resend-link"
              class="font-semibold text-brand-600 transition-colors hover:text-brand-500"
            >
              Resend link
            </Link>
          </p>

          <p v-if="type === 'password-reset'" class="text-base text-gray-600">
            Try a different email?{' '}
            <Link
              href="/forgot-password"
              class="font-semibold text-brand-600 transition-colors hover:text-brand-500"
            >
              Back to forgot password
            </Link>
          </p>
        </div>
      </div>

      <div class="mt-8 text-center">
        <Link
          :href="backUrl"
          class="inline-flex items-center text-base text-gray-600 transition-colors hover:text-brand-600"
        >
          <svg
            class="mr-2 h-4 w-4"
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
          {{ backText }}
        </Link>
      </div>
    </div>
  </div>
</template>
