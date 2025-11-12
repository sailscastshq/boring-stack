<script setup>
import { ref, computed } from 'vue'
import { Head, useForm, router, Link } from '@inertiajs/vue3'
import InputOtp from '@/volt/InputOtp.vue'
import Message from '@/volt/Message.vue'
import Toast from '@/volt/Toast.vue'
import { useFlashToast } from '@/composables/flashToast'

const props = defineProps({
  twoFactorMethods: {
    type: Object,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  }
})

const activeMethod = ref(props.twoFactorMethods.defaultMethod)
const emailSent = ref(false)

const form = useForm({
  code: '',
  method: activeMethod.value
})

useFlashToast()

const isDisabled = computed(() => {
  if (form.processing) return true
  if (!form.code) return true
  if (activeMethod.value === 'backup') {
    return String(form.code).length !== 8
  }
  return String(form.code).length !== 6
})

function handleVerifyCode() {
  form.post('/verify-2fa', {
    onSuccess: () => {
      form.reset()
    },
    onError: (errors) => {
      console.error('2FA verification failed:', errors)
    }
  })
}

function handleSendEmail() {
  router.post(
    '/verify-2fa/send-email',
    {},
    {
      preserveScroll: true,
      onSuccess: () => {
        emailSent.value = true
        activeMethod.value = 'email'
        form.method = 'email'
      },
      onError: (errors) => {
        console.error('Failed to send email:', errors)
      }
    }
  )
}

function handleSwitchMethod(method) {
  activeMethod.value = method
  form.method = method
  form.code = ''

  // Auto-send email when switching to email method
  if (method === 'email') {
    handleSendEmail()
  }
}
</script>

<template>
  <Head title="Two-Factor Authentication | Ascent" />

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
          Two-Factor Authentication
        </h1>
        <p class="mt-2 text-base text-gray-600">
          Please verify your identity to complete login
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
          class="relative rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-2xl"
        >
          <!-- Global errors -->
          <div
            v-if="form.errors.method || form.errors.code"
            class="mb-6"
            role="alert"
          >
            <Message
              v-if="form.errors.method"
              severity="error"
              class="mb-3 w-full"
            >
              {{ form.errors.method }}
            </Message>
            <Message v-if="form.errors.code" severity="error" class="w-full">
              {{ form.errors.code }}
            </Message>
          </div>

          <form @submit="handleVerifyCode" class="space-y-5">
            <div v-if="activeMethod === 'totp'">
              <label
                class="mb-4 block text-center text-sm font-medium text-gray-700"
              >
                Enter code from your authenticator app
              </label>
              <div class="flex justify-center">
                <InputOtp v-model="form.code" :length="6" integerOnly mask />
              </div>
            </div>

            <div v-if="activeMethod === 'email'">
              <label
                class="mb-4 block text-center text-sm font-medium text-gray-700"
              >
                Enter code sent to {{ userEmail }}
              </label>
              <div class="flex justify-center">
                <InputOtp v-model="form.code" :length="6" integerOnly mask />
              </div>
            </div>

            <div v-if="activeMethod === 'backup'">
              <label
                class="mb-4 block text-center text-sm font-medium text-gray-700"
              >
                Enter a backup recovery code
              </label>
              <div class="flex justify-center">
                <InputOtp
                  v-model="form.code"
                  :length="8"
                  mask
                  @update:modelValue="form.code = $event.toUpperCase()"
                />
              </div>
              <p class="mt-3 text-center text-xs text-gray-500">
                Each backup code can only be used once
              </p>
            </div>

            <!-- Submit button - always visible like login page -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="isDisabled"
                :class="[
                  'flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                  isDisabled
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
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Verifying...</span>
                </div>
                <span v-else>Verify & Continue</span>
              </button>
            </div>

            <!-- Method switching -->
            <div class="space-y-3 text-center">
              <!-- Primary method alternatives -->
              <template v-if="activeMethod !== 'backup'">
                <div
                  v-if="
                    (activeMethod === 'totp' && twoFactorMethods.email) ||
                    (activeMethod === 'email' && twoFactorMethods.totp)
                  "
                >
                  <button
                    v-if="activeMethod === 'totp' && twoFactorMethods.email"
                    type="button"
                    @click="handleSwitchMethod('email')"
                    class="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600"
                  >
                    Get the code via email instead
                  </button>

                  <button
                    v-if="activeMethod === 'email' && twoFactorMethods.totp"
                    type="button"
                    @click="handleSwitchMethod('totp')"
                    class="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600"
                  >
                    Use authenticator app instead
                  </button>
                </div>

                <!-- Backup code option - always available -->
                <div>
                  <button
                    type="button"
                    @click="handleSwitchMethod('backup')"
                    class="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600"
                  >
                    Use backup code
                  </button>
                </div>
              </template>

              <!-- Back from backup code -->
              <button
                v-if="activeMethod === 'backup'"
                type="button"
                @click="handleSwitchMethod(twoFactorMethods.defaultMethod)"
                class="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600"
              >
                Use
                {{
                  twoFactorMethods.defaultMethod === 'totp'
                    ? 'authenticator app'
                    : 'email code'
                }}
                instead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <Toast />
</template>
