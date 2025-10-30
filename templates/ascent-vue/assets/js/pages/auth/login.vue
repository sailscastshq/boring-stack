<script setup>
import { Head, Link, useForm } from '@inertiajs/vue3'
import { ref, computed, watch, onMounted } from 'vue'
import Toast from '@/volt/Toast.vue'
import Message from '@/volt/Message.vue'
import { useFlashToast } from '@/composables/flashToast'

const props = defineProps({
  passkeyChallenge: {
    type: Object,
    default: null
  }
})

const form = useForm({
  email: '',
  password: '',
  rememberMe: false
})

const passkeyForm = useForm({
  email: ''
})

const verifyPasskeyForm = useForm({
  assertion: null,
  email: ''
})

const focusedField = ref('')
const showExpandedOptions = ref(false)
const isSendingMagicLink = ref(false)
const isSigningInWithPasskey = ref(false)

const toast = ref(null)
useFlashToast(toast)

onMounted(() => {
  if (props.passkeyChallenge) {
    handleWebAuthnChallenge(props.passkeyChallenge)
  }

  try {
    if (typeof window !== 'undefined' && window.location) {
      const urlParams = new URLSearchParams(window.location.search)
      const mode = urlParams.get('mode')

      if (mode === 'password') {
        showExpandedOptions.value = true
      }
    }
  } catch (error) {
    console.error('Error handling URL parameters:', error)
  }
})

watch(
  () => props.passkeyChallenge,
  (newChallenge) => {
    if (newChallenge) {
      handleWebAuthnChallenge(newChallenge)
    }
  }
)

const toggleToPasswordMode = () => {
  showExpandedOptions.value = true
  try {
    if (typeof window !== 'undefined' && window.location && window.history) {
      const url = new URL(window.location)
      url.searchParams.set('mode', 'password')
      window.history.pushState({}, '', url)
    }
  } catch (error) {
    // Silently handle URL update error - non-critical
  }
}

const toggleToMagicMode = () => {
  showExpandedOptions.value = false
  try {
    if (typeof window !== 'undefined' && window.location && window.history) {
      const url = new URL(window.location)
      url.searchParams.delete('mode')
      window.history.pushState({}, '', url)
    }
  } catch (error) {
    // Silently handle URL update error - non-critical
  }
}

const disableLoginButton = computed(() => {
  if (!form.email) return true
  if (!form.password && showExpandedOptions.value) return true
  if (form.processing) return true
  return false
})

const disableMagicLinkButton = computed(() => {
  if (!form.email) return true
  if (isSendingMagicLink.value) return true
  return false
})

function submit(e) {
  e.preventDefault()
  form.post('/login')
}

function sendMagicLink(e) {
  e.preventDefault()
  if (!form.email) return

  isSendingMagicLink.value = true

  form.post('/magic-link', {
    data: {
      email: form.email,
      fullName: form.fullName || undefined
    },
    onSuccess: () => {
      isSendingMagicLink.value = false
    },
    onError: () => {
      isSendingMagicLink.value = false
    }
  })
}

function handlePasskeySignin(e) {
  e.preventDefault()
  if (!form.email) return

  isSigningInWithPasskey.value = true
  passkeyForm.email = form.email
  passkeyForm.post('/challenge-passkey', {
    onFinish: () => {
      isSigningInWithPasskey.value = false
    }
  })
}

async function handleWebAuthnChallenge(challengeData) {
  try {
    const { startAuthentication } = await import('@simplewebauthn/browser')
    const assertion = await startAuthentication(challengeData.options)
    const email = challengeData.email

    verifyPasskeyForm.assertion = assertion
    verifyPasskeyForm.email = email

    verifyPasskeyForm.post('/verify-passkey')
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // User cancelled the passkey prompt - no action needed
    } else {
      // WebAuthn errors are useful for debugging
      console.error('WebAuthn error:', error)
    }
  }
}
</script>

<template>
  <Head title="Sign In | Ascent" />

  <div
    class="bg-linear-to-br flex min-h-screen flex-col justify-center from-brand-50/30 via-white to-accent-50/20 py-12 sm:px-6 lg:px-8"
  >
    <!-- Background Elements -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-brand-200/20 blur-3xl"
      />
      <div
        class="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl"
      />
    </div>

    <div class="relative sm:mx-auto sm:w-full sm:max-w-lg">
      <!-- Logo -->
      <div class="mb-8 flex items-center justify-center">
        <Link href="/" class="group">
          <div class="relative">
            <div
              class="absolute inset-0 scale-110 rounded-2xl bg-brand-200/30 opacity-0 blur-xl transition-opacity group-hover:opacity-100"
            />
            <img
              src="/images/logo.svg"
              alt="Ascent Logo"
              class="relative h-12 w-auto"
            />
          </div>
        </Link>
      </div>

      <!-- Header -->
      <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h1>
        <p class="mt-2 text-base text-gray-600">
          Sign in to your Ascent account
        </p>
        <p class="mt-2 text-base text-gray-600">
          Or
          <Link
            href="/signup"
            class="font-semibold text-brand-600 transition-colors hover:text-brand-500"
          >
            create a new account
          </Link>
        </p>
      </header>
    </div>

    <div class="relative sm:mx-auto sm:w-full sm:max-w-lg">
      <div class="relative">
        <!-- Background blur effect -->
        <div
          class="bg-linear-to-r absolute inset-0 scale-105 rounded-2xl from-brand-600/10 to-accent-600/10 blur-xl"
        />

        <!-- Main card -->
        <div
          class="relative rounded-2xl border border-gray-300 bg-white px-8 py-10 shadow-2xl"
        >
          <!-- Global error -->
          <div
            v-if="
              form.errors.login ||
              form.errors.magicLink ||
              verifyPasskeyForm.errors.passkey
            "
            class="mb-6"
            role="alert"
          >
            <Message
              severity="error"
              :text="
                form.errors.login ||
                form.errors.magicLink ||
                verifyPasskeyForm.errors.passkey
              "
              class="w-full"
            />
          </div>

          <!-- Magic Link Primary View -->
          <form
            v-if="!showExpandedOptions"
            @submit="sendMagicLink"
            class="space-y-5"
          >
            <!-- Email -->
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
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  required
                  @focus="focusedField = 'email'"
                  @blur="focusedField = ''"
                  :class="[
                    'w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200',
                    form.errors.email
                      ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                      : 'border-gray-300 bg-gray-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                  ]"
                  placeholder="Enter your email address"
                />
              </div>
              <Message
                v-if="form.errors.email"
                severity="error"
                :text="form.errors.email"
              />
            </div>

            <!-- Magic Link Button -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="disableMagicLinkButton"
                :class="[
                  'flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                  disableMagicLinkButton
                    ? 'bg-gray-300'
                    : 'bg-linear-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
                ]"
              >
                <div
                  v-if="isSendingMagicLink"
                  class="flex items-center space-x-2"
                >
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
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Sending link...</span>
                </div>
                <div v-else class="flex items-center justify-center">
                  <svg
                    class="mr-2 h-5 w-5"
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
                  <span>Send Magic Link</span>
                </div>
              </button>
            </div>

            <!-- Other Sign-in Options -->
            <div class="flex flex-col items-center space-y-2 text-center">
              <!-- Passkey Sign-in - appears below magic link button -->
              <button
                v-if="form.email"
                type="button"
                @click="handlePasskeySignin"
                :disabled="isSigningInWithPasskey"
                class="inline-flex items-center text-sm font-medium text-brand-600 transition-colors hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <template v-if="isSigningInWithPasskey">
                  Signing in...
                </template>
                <template v-else>
                  <svg
                    class="mr-1 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-2.04-1.34-3.27 0-1.23.47-2.4 1.34-3.27.87-.87 2.04-1.34 3.27-1.34 1.23 0 2.4.47 3.27 1.34.87.87 1.34 2.04 1.34 3.27 0 1.23-.47 2.4-1.34 3.27-.09.1-.22.15-.35.15s-.26-.05-.35-.15c-.87-.87-1.34-2.04-1.34-3.27s.47-2.4 1.34-3.27c.87-.87 2.04-1.34 3.27-1.34s2.4.47 3.27 1.34c.87.87 1.34 2.04 1.34 3.27s-.47 2.4-1.34 3.27c-.09.1-.22.15-.35.15z"
                    />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                  Use passkey
                </template>
              </button>
              <button
                type="button"
                @click="toggleToPasswordMode"
                class="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600"
              >
                Other sign-in options
              </button>
            </div>
          </form>

          <!-- Expanded Traditional Login View -->
          <div v-else class="space-y-5">
            <!-- Back to Magic Link -->
            <div class="mb-4 flex items-center justify-between">
              <button
                type="button"
                @click="toggleToMagicMode"
                class="flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-brand-600"
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
                Back to magic link
              </button>
            </div>

            <form @submit="submit" class="space-y-5">
              <!-- Email -->
              <div>
                <label
                  for="email-expanded"
                  class="mb-2 block text-sm font-semibold text-gray-900"
                >
                  Email Address
                </label>
                <div class="relative">
                  <input
                    id="email-expanded"
                    v-model="form.email"
                    type="email"
                    autocomplete="email"
                    required
                    @focus="focusedField = 'email'"
                    @blur="focusedField = ''"
                    :class="[
                      'w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200',
                      form.errors.email
                        ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                        : 'border-gray-300 bg-gray-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                    ]"
                    placeholder="Enter your email address"
                  />
                </div>
                <Message
                  v-if="form.errors.email"
                  severity="error"
                  :text="form.errors.email"
                />
              </div>

              <!-- Password -->
              <div>
                <label
                  for="password"
                  class="mb-2 block text-sm font-semibold text-gray-900"
                >
                  Password
                </label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    autocomplete="current-password"
                    required
                    @focus="focusedField = 'password'"
                    @blur="focusedField = ''"
                    :class="[
                      'w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200',
                      form.errors.password
                        ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                        : 'border-gray-300 bg-gray-200 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                    ]"
                    placeholder="Enter your password"
                  />
                </div>
                <Message
                  v-if="form.errors.password"
                  severity="error"
                  :text="form.errors.password"
                />
              </div>

              <!-- Remember me and Forgot password -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <input
                    id="rememberMe"
                    v-model="form.rememberMe"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label
                    for="rememberMe"
                    class="text-sm font-medium text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <div>
                  <Link
                    href="/forgot-password"
                    class="text-sm font-medium text-brand-600 transition-colors hover:text-brand-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="disableLoginButton"
                  :class="[
                    'flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                    disableLoginButton
                      ? 'bg-gray-300'
                      : 'bg-linear-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
                  ]"
                >
                  <div
                    v-if="form.processing"
                    class="flex items-center space-x-2"
                  >
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
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Signing in...</span>
                  </div>
                  <span v-else>Sign In</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Divider - Only show when expanded options is active -->
          <div v-if="showExpandedOptions" class="my-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="bg-white px-4 font-medium text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          <!-- OAuth Buttons - Only show when expanded options is active -->
          <div v-if="showExpandedOptions" class="grid grid-cols-2 gap-3">
            <!-- Google Button - Half width -->
            <a
              href="/auth/google/redirect"
              class="flex items-center justify-center rounded-xl border border-gray-300 bg-gray-200 px-4 py-4 text-base font-medium text-gray-700 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-gray-300 hover:bg-gray-100 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <svg class="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </a>

            <!-- GitHub Button - Half width -->
            <a
              href="/auth/github/redirect"
              class="flex items-center justify-center rounded-xl border border-gray-300 bg-gray-200 px-4 py-4 text-base font-medium text-gray-700 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-gray-300 hover:bg-gray-100 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Toast ref="toast" />
</template>
