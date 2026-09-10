<script setup>
import WarningTriangle from '@/components/ui/icons/WarningTriangle.vue'
import Key from '@/components/ui/icons/Key.vue'
import Check from '@/components/ui/icons/Check.vue'
import Edit from '@/components/ui/icons/Edit.vue'
import Plus from '@/components/ui/icons/Plus.vue'
import Trash from '@/components/ui/icons/Trash.vue'
import X from '@/components/ui/icons/X.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import { ref, watch } from 'vue'
import { useForm, router } from '@inertiajs/vue3'
import Dialog from '@/components/Modal.vue'
import Button from '@/components/ui/button/Button.vue'
import InputText from '@/components/ui/input/Input.vue'
import Message from '@/components/ui/alert/Alert.vue'
import { useConfirmation } from '@/composables/confirmation'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import Divider from '@/components/ui/separator/Separator.vue'
import DangerButton from '@/components/ui/button/Button.vue'
import SecondaryButton from '@/components/ui/button/Button.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  passkeys: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['hide'])

const confirmation = useConfirmation()
const editingPasskeyId = ref(null)

const renameForm = useForm({
  name: ''
})

const setupForm = useForm({})

// Reset editing state when modal closes or opens
watch(
  () => props.visible,
  (newValue) => {
    if (!newValue) {
      editingPasskeyId.value = null
      renameForm.reset()
    }
  }
)

function handleEditClick(passkey) {
  editingPasskeyId.value = passkey.credentialID
  renameForm.name = passkey.name || ''
}

function handleCancelEdit() {
  editingPasskeyId.value = null
  renameForm.reset()
}

function handleRename() {
  const passkey = props.passkeys.find(
    (p) => p.credentialID === editingPasskeyId.value
  )
  if (!passkey) return

  renameForm.patch(`/security/rename-passkey/${passkey.credentialID}`, {
    preserveScroll: true,
    onSuccess: () => {
      editingPasskeyId.value = null
      renameForm.reset()
    },
    onError: (errors) => {
      console.error('Passkey rename failed:', errors)
    }
  })
}

function confirmDeletePasskey(passkey) {
  confirmation.request({
    message: `Are you sure you want to remove "${
      passkey.name || 'this passkey'
    }"? This action cannot be undone and you won't be able to use this passkey to sign in.`,
    header: 'Remove Passkey',
    icon: WarningTriangle,
    acceptClass: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
    acceptLabel: 'Remove',
    rejectLabel: 'Cancel',
    accept: () => {
      router.delete(`/security/delete-passkey/${passkey.credentialID}`, {
        preserveScroll: true,
        onError: (errors) => {
          console.error('Passkey deletion failed:', errors)
        }
      })
    }
  })
}

function handleAddNewPasskey() {
  setupForm.post('/security/setup-passkey', {
    onError: (errors) => {
      console.error('New passkey setup failed:', errors)
    }
  })
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getDeviceIcon(transports) {
  if (!transports || transports.length === 0) return Key

  if (transports.includes('usb')) return Key
  if (transports.includes('nfc')) return Key
  if (transports.includes('ble')) return Key
  if (transports.includes('internal')) return Key
  if (transports.includes('hybrid')) return Key

  return Key
}
</script>

<template>
  <ConfirmationDialog :state="confirmation" />
  <Dialog
    :open="visible"
    title="Manage Passkeys"
    class="max-w-2xl lg:w-5/12"
    @update:open="emit('hide')"
  >
    <div class="space-y-4">
      <!-- Supporting text -->
      <p class="text-sm text-gray-500">
        Rename, remove, or add new passkeys for your account
      </p>

      <!-- Passkeys List -->
      <div v-if="passkeys.length === 0" class="py-12 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"
        >
          <Key class="h-[1em] w-[1em] shrink-0 text-xl text-gray-400" />
        </div>
        <h3 class="mb-2 text-base font-medium text-gray-900">
          No passkeys yet
        </h3>
        <p class="mx-auto max-w-sm text-sm text-gray-500">
          Add your first passkey to enable secure, passwordless authentication.
        </p>
      </div>
      <div v-else class="space-y-3">
        <div v-for="(passkey, index) in passkeys" :key="passkey.credentialID">
          <div class="group flex items-center justify-between px-3 py-4">
            <div class="flex min-w-0 flex-1 items-center space-x-4">
              <div class="shrink-0">
                <div
                  class="bg-brand-50 flex h-10 w-10 items-center justify-center rounded-lg"
                >
                  <component
                    :is="getDeviceIcon(passkey.transports)"
                    class="h-5 w-5 text-brand-600"
                  />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <div
                  v-if="editingPasskeyId === passkey.credentialID"
                  class="space-y-2"
                >
                  <form
                    @submit.prevent="handleRename"
                    class="flex items-center space-x-2"
                  >
                    <InputText
                      v-model="renameForm.name"
                      class="min-h-10 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand flex-1"
                      placeholder="Enter passkey name"
                      autofocus
                    />
                    <Button
                      class="min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950 rounded-full"
                      aria-label="Save"
                      :disabled="
                        !renameForm.name.trim() ||
                        renameForm.processing ||
                        renameForm.processing
                      "
                      :aria-busy="renameForm.processing"
                      type="submit"
                      title="Save"
                      ><Spinner
                        v-if="renameForm.processing"
                        class="h-4 w-4" /><Check
                        v-if="!renameForm.processing"
                        class="h-4 w-4"
                    /></Button>
                    <SecondaryButton
                      class="min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950 rounded-full"
                      aria-label="Cancel"
                      type="button"
                      :disabled="renameForm.processing"
                      title="Cancel"
                      @click="handleCancelEdit"
                      ><X class="h-4 w-4"
                    /></SecondaryButton>
                  </form>
                  <Message
                    role="alert"
                    v-if="renameForm.errors.name"
                    class="border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mt-1"
                  >
                    {{ renameForm.errors.name }}
                  </Message>
                </div>
                <div v-else>
                  <p class="truncate text-sm font-medium text-gray-900">
                    {{ passkey.name || `Passkey ${index + 1}` }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Added {{ formatDate(passkey.createdAt) }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="editingPasskeyId !== passkey.credentialID"
              class="flex items-center space-x-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
            >
              <SecondaryButton
                aria-label="Rename"
                title="Rename"
                class="min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950 min-h-8 px-2.5 py-1.5 text-sm rounded-full text-gray-400 hover:text-gray-600"
                @click="handleEditClick(passkey)"
                ><Edit class="h-4 w-4"
              /></SecondaryButton>
              <DangerButton
                class="min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950 min-h-8 px-2.5 py-1.5 text-sm rounded-full"
                aria-label="Delete"
                title="Delete"
                @click="confirmDeletePasskey(passkey)"
                ><Trash class="h-4 w-4"
              /></DangerButton>
            </div>
          </div>
          <Divider
            v-if="index < passkeys.length - 1"
            :key="`divider-${passkey.credentialID}`"
            class="my-0"
          />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          class="min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700 min-h-8 px-2.5 py-1.5 text-sm bg-transparent text-brand dark:bg-transparent dark:text-brand-400"
          :disabled="setupForm.processing || setupForm.processing"
          :aria-busy="setupForm.processing"
          @click="handleAddNewPasskey"
          ><Spinner v-if="setupForm.processing" class="h-4 w-4" /><Plus
            v-if="!setupForm.processing"
            class="h-4 w-4"
          />New Passkey</Button
        >
        <Button
          class="min-h-10 border border-brand bg-brand px-3 py-2 text-base text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700 min-h-8 px-2.5 py-1.5 text-sm bg-brand-600 hover:bg-brand-700"
          @click="emit('hide')"
          >Done</Button
        >
      </div>
    </template>
  </Dialog>
</template>
