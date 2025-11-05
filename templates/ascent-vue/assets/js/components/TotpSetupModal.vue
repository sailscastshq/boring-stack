<script setup>
import { useForm } from '@inertiajs/vue3'
import Dialog from '@/volt/Dialog.vue'
import Button from '@/volt/Button.vue'
import InputOtp from '@/volt/InputOtp.vue'
import Message from '@/volt/Message.vue'
import { useCopyToClipboard } from '@/composables/copyToClipboard'
import SecondaryButton from '@/volt/SecondaryButton.vue'

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
    v-if="setupData"
    :visible="visible"
    :modal="true"
    :closable="!form.processing"
    class="mx-4 w-full max-w-2xl sm:mx-0"
    :content-style="{ paddingRight: '2rem', paddingLeft: '2rem' }"
    @update:visible="handleClose"
  >
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="mb-2 text-xl font-semibold text-gray-900">
          Set up Authenticator App
        </h2>
        <p class="text-sm text-gray-600">
          Each time you log in, in addition to your password, you'll use an
          authenticator app to generate a one-time code.
        </p>
      </div>

      <!-- Error Message -->
      <Message v-if="form.errors.twoFactorSetup" severity="error">
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
          <h3 class="text-base font-semibold text-gray-900">Scan QR code</h3>
        </div>
        <p class="text-sm text-gray-600">
          Scan the QR code below or manually enter the secret key into your
          authenticator app.
        </p>

        <div
          class="flex flex-col space-y-6 py-4 sm:flex-row sm:items-start sm:space-x-8 sm:space-y-0"
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
              <h4 class="mb-2 text-sm font-medium text-gray-900">
                Can't scan QR code?
              </h4>
              <p class="mb-3 text-sm text-gray-600">
                Enter this secret instead:
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <div
                class="min-w-0 flex-1 break-all rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900"
              >
                {{ setupData.manualEntryKey }}
              </div>
              <Button
                :icon="copied ? 'pi pi-check' : 'pi pi-copy'"
                text
                :tooltip="copied ? 'Copied!' : 'Copy code'"
                :class="
                  copied
                    ? 'text-success-600 hover:text-success-700'
                    : 'text-gray-500 hover:text-gray-700'
                "
                @click="copyToClipboard(setupData.manualEntryKey)"
              />
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
          <h3 class="text-base font-semibold text-gray-900">
            Get verification code
          </h3>
        </div>
        <p class="text-sm text-gray-600">
          Enter the 6-digit code you see in your authenticator app.
        </p>

        <form @submit.prevent="handleVerifyTOTP" class="space-y-6">
          <div>
            <label class="mb-3 block text-sm font-medium text-gray-700">
              Enter verification code
            </label>
            <div class="flex justify-start">
              <InputOtp v-model="form.token" :length="6" integer-only mask />
            </div>
            <Message v-if="form.errors.token" severity="error" class="mt-3">
              {{ form.errors.token }}
            </Message>
          </div>

          <div
            class="flex flex-col justify-end space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0"
          >
            <SecondaryButton
              type="button"
              label="Cancel"
              size="small"
              :disabled="form.processing"
              class="w-full sm:w-auto"
              @click="handleClose"
            />
            <Button
              type="submit"
              label="Verify & Enable"
              size="small"
              :loading="form.processing"
              :disabled="!form.token || form.token.length !== 6"
              class="w-full sm:w-auto"
            />
          </div>
        </form>
      </div>
    </div>
  </Dialog>
</template>
