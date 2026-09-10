<script setup>
import Envelope from '@/components/ui/icons/Envelope.vue'
import ChevronLeft from '@/components/ui/icons/ChevronLeft.vue'
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

      <div class="relative">
        <div class="hidden"></div>

        <div class="ascent-auth-panel">
          <div class="mb-6 flex justify-center">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-950"
            >
              <Envelope class="text-brand-600 h-8 w-8 dark:text-brand-300" />
            </div>
          </div>

          <h1
            class="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
          >
            {{ pageTitle }}
          </h1>

          <p class="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
            {{ subtitle }}
          </p>

          <p
            class="mx-auto mb-8 max-w-md text-base text-gray-600 dark:text-gray-400"
          >
            {{ emailText }}
          </p>

          <button
            type="button"
            @click="handleOpenEmailApp"
            class="hover:bg-brand-700 focus:ring-brand-500 mb-6 w-full rounded-xl px-8 py-4 text-lg font-bold text-white shadow-none transition-all duration-200 hover:brightness-95 focus:ring-2 focus:ring-offset-2 focus:outline-none bg-brand-600"
          >
            Open email app
          </button>

          <p
            v-if="type !== 'password-reset'"
            class="text-base text-gray-600 dark:text-gray-400"
          >
            Didn't receive the email?
            <Link
              href="/resend-link"
              class="text-brand-600 hover:text-brand-500 font-semibold transition-colors dark:text-brand-300"
            >
              Resend link
            </Link>
          </p>

          <p
            v-if="type === 'password-reset'"
            class="text-base text-gray-600 dark:text-gray-400"
          >
            Try a different email?
            <Link
              href="/forgot-password"
              class="text-brand-600 hover:text-brand-500 font-semibold transition-colors dark:text-brand-300"
            >
              Back to forgot password
            </Link>
          </p>
        </div>
      </div>

      <div class="mt-8 text-center">
        <Link
          :href="backUrl"
          class="hover:text-brand-600 inline-flex items-center text-base text-gray-600 transition-colors dark:text-gray-400"
        >
          <ChevronLeft class="mr-2 h-4 w-4" />
          {{ backText }}
        </Link>
      </div>
    </div>
  </div>
</template>
