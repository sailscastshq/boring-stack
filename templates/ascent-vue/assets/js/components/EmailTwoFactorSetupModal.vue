<script setup>
import InfoCircle from '@/components/ui/icons/InfoCircle.vue'
import Envelope from '@/components/ui/icons/Envelope.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { useForm } from '@inertiajs/vue3'
import Dialog from '@/components/Modal.vue'
import Button from '@/components/ui/button/Button.vue'
import InputOtp from '@/components/ui/input/Input.vue'
import Message from '@/components/ui/alert/Alert.vue'
import SecondaryButton from '@/components/ui/button/Button.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  userEmail: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['hide'])

const form = useForm({
  code: ''
})

function handleVerifyCode() {
  form.post('/security/verify-email-2fa-setup', {
    onSuccess: () => {
      form.reset()
      // Allow reset to take effect before closing modal
      setTimeout(() => {
        emit('hide')
      }, 0)
    },
    onError: (errors) => {
      console.error('Email 2FA verification failed:', errors)
    }
  })
}

function handleClose() {
  form.reset()
  emit('hide')
}
</script>

<template>
  <!-- Don't render modal if no user email -->
  <Dialog
    title="Email verification"
    v-if="userEmail"
    :open="visible"
    :closable="!form.processing"
    class="max-w-2xl lg:w-4/12"
    @update:open="handleClose"
  >
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40"
        >
          <Envelope
            class="h-[1em] w-[1em] shrink-0 text-2xl text-blue-600 dark:text-blue-300"
          />
        </div>
        <h2 class="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Verify Your Email
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          We've sent a 6-digit verification code to
          <strong>{{ userEmail }}</strong
          >. Enter it below to enable email two-factor authentication.
        </p>
      </div>

      <!-- Error Message -->
      <Message
        role="alert"
        class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        v-if="form.errors.code"
      >
        {{
          typeof form.errors.code === 'string'
            ? form.errors.code
            : 'Invalid verification code'
        }}
      </Message>

      <!-- Verification Form -->
      <form @submit.prevent="handleVerifyCode" class="space-y-6">
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
              v-model="form.code"
            />
          </div>
        </div>

        <!-- Help Text -->
        <div
          class="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950"
        >
          <div class="flex">
            <div class="shrink-0">
              <InfoCircle class="h-[1em] w-[1em] shrink-0 text-gray-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                The verification code expires in 10 minutes. If you don't see
                the email, check your spam folder.
              </p>
            </div>
          </div>
        </div>

        <div
          class="flex flex-col justify-end space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3"
        >
          <SecondaryButton
            type="button"
            class="bg-transparent text-brand dark:bg-transparent dark:text-brand-400 min-h-10 border border-gray-300 bg-white px-3 py-2 text-base text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 min-h-8 px-2.5 py-1.5 text-sm w-full sm:w-auto"
            :disabled="form.processing"
            @click="handleClose"
            >Cancel</SecondaryButton
          >
          <Button
            :disabled="!form.code || form.code.length !== 6 || form.processing"
            :aria-busy="form.processing"
            type="submit"
            class="min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700 min-h-8 px-2.5 py-1.5 text-sm w-full sm:w-auto"
            ><Spinner v-if="form.processing" class="h-4 w-4" />Verify & Enable
            Email 2FA</Button
          >
        </div>
      </form>
    </div>
  </Dialog>
</template>
