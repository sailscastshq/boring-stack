<script setup>
import Key from '@/components/ui/icons/Key.vue'
import InfoCircle from '@/components/ui/icons/InfoCircle.vue'
import Copy from '@/components/ui/icons/Copy.vue'
import Check from '@/components/ui/icons/Check.vue'
import { watch } from 'vue'
import Dialog from '@/components/Modal.vue'
import Button from '@/components/ui/button/Button.vue'
import Message from '@/components/ui/alert/Alert.vue'
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
    title="Backup codes"
    v-if="backupCodes && backupCodes.length"
    :open="visible"
    :closable="false"
    class="max-w-2xl lg:w-5/12"
    @update:open="handleSavedCodes"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div class="text-center">
        <div
          class="bg-success-100 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full dark:bg-success-950/40"
        >
          <Key
            class="h-[1em] w-[1em] shrink-0 text-success-600 text-xl dark:text-success-300"
          />
        </div>
        <h2 class="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          {{
            context === 'setup'
              ? 'Authenticator App Setup Complete!'
              : 'New Backup Codes Generated'
          }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{
            context === 'setup'
              ? 'Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.'
              : 'Your new backup codes are ready. Save them in a secure place - they replace any previous backup codes.'
          }}
        </p>
      </div>

      <!-- Important Notice -->
      <Message
        role="status"
        class="border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 w-full"
      >
        {{
          context === 'setup'
            ? "Please save these codes now—they're shown only once."
            : "Important: These new codes replace all previous backup codes. Save them now—they're shown only once."
        }}
      </Message>

      <!-- Backup Codes -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your backup codes
          </h3>
          <Button
            class="min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950 min-h-8 px-2.5 py-1.5 text-sm"
            :aria-label="copied ? 'Copied!' : 'Copy all codes'"
            :title="copied ? 'Copied!' : 'Copy all codes'"
            :class="
              copied
                ? 'text-success-600 hover:text-success-700 dark:text-success-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            "
            @click="copyToClipboard(backupCodes.join('\n'))"
            ><component :is="copied ? Check : Copy" class="h-4 w-4"
          /></Button>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="(code, index) in backupCodes"
            :key="index"
            class="rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm font-medium text-gray-900 shadow-sm transition-shadow duration-150 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            {{ code }}
          </div>
        </div>
      </div>

      <!-- Storage Hint -->
      <div class="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
        <div class="flex items-center space-x-2">
          <InfoCircle
            class="h-[1em] w-[1em] shrink-0 text-sm text-indigo-600"
          />
          <p class="text-sm text-indigo-800">
            <strong>Pro tip:</strong> Save these in your password manager
            alongside your login credentials
          </p>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex justify-end">
        <Button
          class="min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700 min-h-8 px-2.5 py-1.5 text-sm"
          @click="handleSavedCodes"
          >I've saved my backup codes</Button
        >
      </div>
    </div>
  </Dialog>
</template>
