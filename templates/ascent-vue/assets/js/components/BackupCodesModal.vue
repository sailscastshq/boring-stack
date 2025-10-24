<script setup>
import { watch } from 'vue'
import Dialog from '@/volt/Dialog.vue'
import Button from '@/volt/Button.vue'
import Message from '@/volt/Message.vue'
import { useCopyToClipboard } from '@/composables/copyToClipboard'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  backupCodes: {
    type: Array,
    default: () => []
  },
  context: {
    type: String,
    default: 'setup',
    validator: (value) => ['setup', 'regenerate'].includes(value)
  }
})

const emit = defineEmits(['hide'])

const { copied, copyToClipboard, reset } = useCopyToClipboard()

// Reset copied state when modal opens/closes
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      reset()
    }
  }
)

function handleSavedCodes() {
  emit('hide')
}
</script>

<template>
  <!-- Don't render modal if no backup codes -->
  <Dialog
    v-if="backupCodes && backupCodes.length"
    :visible="visible"
    :modal="true"
    :closable="false"
    class="mx-4 w-full max-w-xl sm:mx-0"
    :content-style="{ paddingRight: '2rem', paddingLeft: '2rem' }"
    @update:visible="handleSavedCodes"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-100"
        >
          <i class="pi pi-key text-xl text-success-600" />
        </div>
        <h2 class="mb-2 text-xl font-semibold text-gray-900">
          {{
            context === 'setup'
              ? 'Authenticator App Setup Complete!'
              : 'New Backup Codes Generated'
          }}
        </h2>
        <p class="text-sm text-gray-600">
          {{
            context === 'setup'
              ? 'Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.'
              : 'Your new backup codes are ready. Save them in a secure place - they replace any previous backup codes.'
          }}
        </p>
      </div>

      <!-- Important Notice -->
      <Message severity="warn" class="w-full">
        {{
          context === 'setup'
            ? "Please save these codes now—they're shown only once."
            : "Important: These new codes replace all previous backup codes. Save them now—they're shown only once."
        }}
      </Message>

      <!-- Backup Codes -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Your backup codes</h3>
          <Button
            :icon="copied ? 'pi pi-check' : 'pi pi-copy'"
            text
            size="small"
            :tooltip="copied ? 'Copied!' : 'Copy all codes'"
            tooltip-options="{ position: 'left' }"
            :class="
              copied
                ? 'text-success-600 hover:text-success-700'
                : 'text-gray-500 hover:text-gray-700'
            "
            @click="copyToClipboard(backupCodes.join('\n'))"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="(code, index) in backupCodes"
            :key="index"
            class="rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm font-medium text-gray-900 shadow-sm transition-shadow duration-150"
          >
            {{ code }}
          </div>
        </div>
      </div>

      <!-- Storage Hint -->
      <div class="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
        <div class="flex items-center space-x-2">
          <i class="pi pi-info-circle text-sm text-indigo-600" />
          <p class="text-sm text-indigo-800">
            <strong>Pro tip:</strong> Save these in your password manager
            alongside your login credentials
          </p>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex justify-end">
        <Button
          label="I've saved my backup codes"
          size="small"
          @click="handleSavedCodes"
        />
      </div>
    </div>
  </Dialog>
</template>
