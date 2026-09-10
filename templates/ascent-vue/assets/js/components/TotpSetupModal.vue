<script setup>
import Copy from '@/components/ui/icons/Copy.vue'
import Check from '@/components/ui/icons/Check.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { useForm } from '@inertiajs/vue3'
import Dialog from '@/components/Modal.vue'
import Button from '@/components/ui/button/Button.vue'
import InputOtp from '@/components/ui/input/Input.vue'
import Message from '@/components/ui/alert/Alert.vue'
import { useCopyToClipboard } from '@/composables/copyToClipboard'
import SecondaryButton from '@/components/ui/button/Button.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  setupData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['hide'])

const form = useForm({
  token: ''
})

const { copied, copyToClipboard } = useCopyToClipboard()

function handleVerifyTOTP() {
  form.post('/security/verify-totp-setup', {
    onSuccess: () => {
      form.reset()
      // Don't call emit('hide') - let the redirect happen naturally
      // The backup codes modal will show after page reload
    },
    onError: (errors) => {
      console.error('TOTP verification failed:', errors)
    }
  })
}

function handleClose() {
  form.reset()
  emit('hide')
}
</script>

<template>
  <!-- Don't render modal if no setup data -->
  <Dialog
    title="Authenticator setup"
    v-if="setupData"
    :open="visible"
    :closable="!form.processing"
    class="max-w-2xl lg:w-5/12"
    @update:open="handleClose"
  >
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Set up Authenticator App
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Each time you log in, in addition to your password, you'll use an
          authenticator app to generate a one-time code.
        </p>
      </div>

      <!-- Error Message -->
      <Message
        role="alert"
        class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        v-if="form.errors.twoFactorSetup"
      >
        {{ form.errors.twoFactorSetup }}
      </Message>

      <!-- Step 1: Scan QR Code -->
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <div
            class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white"
          >
            1
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
            Scan QR code
          </h3>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Scan the QR code below or manually enter the secret key into your
          authenticator app.
        </p>

        <div
          class="flex flex-col space-y-6 py-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-8"
        >
          <!-- QR Code -->
          <div class="flex justify-center sm:justify-start">
            <img
              :src="setupData.qrCode"
              alt="TOTP QR Code"
              class="h-32 w-32 rounded-lg border-2 border-white shadow-sm"
            />
          </div>

          <!-- Manual Entry -->
          <div class="flex-1 space-y-3 sm:min-w-0">
            <div>
              <h4
                class="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Can't scan QR code?
              </h4>
              <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
                Enter this secret instead:
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <div
                class="min-w-0 flex-1 rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm break-all text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                {{ setupData.manualEntryKey }}
              </div>
              <Button
                class="min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950"
                :aria-label="copied ? 'Copied!' : 'Copy code'"
                :title="copied ? 'Copied!' : 'Copy code'"
                :class="
                  copied
                    ? 'text-success-600 hover:text-success-700 dark:text-success-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                "
                @click="copyToClipboard(setupData.manualEntryKey)"
                ><component :is="copied ? Check : Copy" class="h-4 w-4"
              /></Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Enter Verification Code -->
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <div
            class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white"
          >
            2
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
            Get verification code
          </h3>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Enter the 6-digit code you see in your authenticator app.
        </p>

        <form @submit.prevent="handleVerifyTOTP" class="space-y-6">
          <div>
            <label
              class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Enter verification code
            </label>
            <div class="flex justify-start">
              <InputOtp
                class="mx-auto max-w-64 text-center text-2xl tracking-[0.5em]"
                autocomplete="one-time-code"
                inputmode="numeric"
                aria-label="Verification code"
                :maxlength="6"
                v-model="form.token"
              />
            </div>
            <Message
              role="alert"
              v-if="form.errors.token"
              class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-3"
            >
              {{ form.errors.token }}
            </Message>
          </div>

          <div
            class="flex flex-col justify-end space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3"
          >
            <SecondaryButton
              type="button"
              :disabled="form.processing"
              class="min-h-10 border border-gray-300 bg-white px-3 py-2 text-base text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 min-h-8 px-2.5 py-1.5 text-sm w-full sm:w-auto"
              @click="handleClose"
              >Cancel</SecondaryButton
            >
            <Button
              :disabled="
                !form.token || form.token.length !== 6 || form.processing
              "
              :aria-busy="form.processing"
              type="submit"
              class="min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700 min-h-8 px-2.5 py-1.5 text-sm w-full sm:w-auto"
              ><Spinner v-if="form.processing" class="h-4 w-4" />Verify &
              Enable</Button
            >
          </div>
        </form>
      </div>
    </div>
  </Dialog>
</template>
