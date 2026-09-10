<script setup>
import Input from '@/components/ui/input/Input.vue'

import Spinner from '@/components/ui/spinner/Spinner.vue'
import Fingerprint from '@/components/ui/icons/Fingerprint.vue'
import Envelope from '@/components/ui/icons/Envelope.vue'
import ChevronLeft from '@/components/ui/icons/ChevronLeft.vue'
import { Head, Link, useForm } from '@inertiajs/vue3'
import { ref, computed, watch, onMounted } from 'vue'
import Message from '@/components/ui/alert/Alert.vue'

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
    class="from-brand-50/30 to-accent-50/20 flex min-h-screen flex-col justify-center bg-linear-to-br via-white py-12 sm:px-6 lg:px-8"
  >
    <!-- Background Elements -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="bg-brand-200/20 absolute top-20 left-1/4 h-96 w-96 rounded-full blur-3xl"
      />
      <div
        class="bg-accent-200/20 absolute right-1/4 bottom-20 h-72 w-72 rounded-full blur-3xl"
      />
    </div>

    <div class="relative sm:mx-auto sm:w-full sm:max-w-lg">
      <!-- Logo -->
      <div class="mb-8 flex items-center justify-center">
        <Link href="/" class="group">
          <div class="relative">
            <div
              class="bg-brand-200/30 absolute inset-0 scale-110 rounded-2xl opacity-0 blur-xl transition-opacity group-hover:opacity-100"
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
            class="text-brand-600 hover:text-brand-500 font-semibold transition-colors"
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
          class="from-brand-600/10 to-accent-600/10 absolute inset-0 scale-105 rounded-2xl bg-linear-to-r blur-xl"
        />

        <!-- Main card -->
        <div
          class="relative rounded-2xl border border-gray-300 bg-white px-8 py-10 shadow-2xl"
        >
          <Message
            role="alert"
            v-if="
              form.errors.login ||
              form.errors.magicLink ||
              verifyPasskeyForm.errors.passkey
            "
            class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mb-3 w-full"
          >
            {{
              form.errors.login ||
              form.errors.magicLink ||
              verifyPasskeyForm.errors.passkey
            }}
          </Message>

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
                <Input
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
                      : 'focus:border-brand-300 focus:ring-brand-100 border-gray-300 bg-gray-200 focus:bg-white focus:ring-4'
                  ]"
                  placeholder="Enter your email address"
                />
              </div>
              <Message
                role="alert"
                class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                v-if="form.errors.email"
              >
                {{ form.errors.email }}
              </Message>
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
                    : 'from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:ring-brand-500 bg-linear-to-r focus:ring-2 focus:ring-offset-2 focus:outline-none'
                ]"
              >
                <div
                  v-if="isSendingMagicLink"
                  class="flex items-center space-x-2"
                >
                  <Spinner class="h-5 w-5" />
                  <span>Sending link...</span>
                </div>
                <div v-else class="flex items-center justify-center">
                  <Envelope class="mr-2 h-5 w-5" />
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
                class="text-brand-600 hover:text-brand-500 inline-flex items-center text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <template v-if="isSigningInWithPasskey">
                  Signing in...
                </template>
                <template v-else>
                  <Fingerprint class="mr-1 h-4 w-4" />
                  Use passkey
                </template>
              </button>
              <button
                type="button"
                @click="toggleToPasswordMode"
                class="hover:text-brand-600 text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors"
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
                class="hover:text-brand-600 flex items-center text-sm font-medium text-gray-600 transition-colors"
              >
                <ChevronLeft class="mr-1 h-4 w-4" />
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
                  <Input
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
                        : 'focus:border-brand-300 focus:ring-brand-100 border-gray-300 bg-gray-200 focus:bg-white focus:ring-4'
                    ]"
                    placeholder="Enter your email address"
                  />
                </div>
                <Message
                  role="alert"
                  class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                  v-if="form.errors.email"
                >
                  {{ form.errors.email }}
                </Message>
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
                  <Input
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
                        : 'focus:border-brand-300 focus:ring-brand-100 border-gray-300 bg-gray-200 focus:bg-white focus:ring-4'
                    ]"
                    placeholder="Enter your password"
                  />
                </div>
                <Message
                  role="alert"
                  class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                  v-if="form.errors.password"
                >
                  {{ form.errors.password }}
                </Message>
              </div>

              <!-- Remember me and Forgot password -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <input
                    id="rememberMe"
                    v-model="form.rememberMe"
                    type="checkbox"
                    class="text-brand-600 focus:ring-brand-500 h-4 w-4 rounded border-gray-300"
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
                    class="text-brand-600 hover:text-brand-500 text-sm font-medium transition-colors"
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
                      : 'from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:ring-brand-500 bg-linear-to-r focus:ring-2 focus:ring-offset-2 focus:outline-none'
                  ]"
                >
                  <div
                    v-if="form.processing"
                    class="flex items-center space-x-2"
                  >
                    <Spinner class="h-5 w-5" />
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
              class="focus:ring-brand-500 flex items-center justify-center rounded-xl border border-gray-300 bg-gray-200 px-4 py-4 text-base font-medium text-gray-700 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-gray-300 hover:bg-gray-100 hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
              class="focus:ring-brand-500 flex items-center justify-center rounded-xl border border-gray-300 bg-gray-200 px-4 py-4 text-base font-medium text-gray-700 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-gray-300 hover:bg-gray-100 hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
</template>
