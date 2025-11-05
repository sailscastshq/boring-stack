<script setup>
import { useForm } from '@inertiajs/vue3'
import Dialog from '@/volt/Dialog.vue'
import Button from '@/volt/Button.vue'
import InputOtp from '@/volt/InputOtp.vue'
import Message from '@/volt/Message.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'

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
    v-if="userEmail"
    :visible="visible"
    :modal="true"
    :closable="!form.processing"
    class="mx-4 w-full max-w-lg sm:mx-0"
    :content-style="{ paddingRight: '2rem', paddingLeft: '2rem' }"
    @update:visible="handleClose"
  >
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50"
        >
          <i class="pi pi-envelope text-2xl text-blue-600" />
        </div>
        <h2 class="mb-2 text-xl font-semibold text-gray-900">
          Verify Your Email
        </h2>
        <p class="text-sm text-gray-600">
          We've sent a 6-digit verification code to
          <strong>{{ userEmail }}</strong
          >. Enter it below to enable email two-factor authentication.
        </p>
      </div>

      <!-- Error Message -->
      <Message v-if="form.errors.code" severity="error">
        {{
          typeof form.errors.code === 'string'
            ? form.errors.code
            : 'Invalid verification code'
        }}
      </Message>

      <!-- Verification Form -->
      <form @submit.prevent="handleVerifyCode" class="space-y-6">
        <div>
          <label class="mb-3 block text-sm font-medium text-gray-700">
            Enter verification code
          </label>
          <div class="flex justify-start">
            <InputOtp v-model="form.code" :length="6" integer-only mask />
          </div>
        </div>

        <!-- Help Text -->
        <div class="rounded-lg border border-gray-300 bg-gray-50 p-4">
          <div class="flex">
            <div class="shrink-0">
              <i class="pi pi-info-circle text-gray-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600">
                The verification code expires in 10 minutes. If you don't see
                the email, check your spam folder.
              </p>
            </div>
          </div>
        </div>

        <div
          class="flex flex-col justify-end space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0"
        >
          <SecondaryButton
            type="button"
            label="Cancel"
            variant="outlined"
            size="small"
            :disabled="form.processing"
            class="w-full sm:w-auto"
            @click="handleClose"
          />
          <Button
            type="submit"
            label="Verify & Enable Email 2FA"
            size="small"
            :loading="form.processing"
            :disabled="!form.code || form.code.length !== 6"
            class="w-full sm:w-auto"
          />
        </div>
      </form>
    </div>
  </Dialog>
</template>
