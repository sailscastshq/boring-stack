<script setup>
import { ref, watch } from 'vue'
import { useForm, router } from '@inertiajs/vue3'
import Dialog from '@/volt/Dialog.vue'
import Button from '@/volt/Button.vue'
import InputText from '@/volt/InputText.vue'
import Message from '@/volt/Message.vue'
import { useConfirm } from 'primevue/useconfirm'
import Divider from '@/volt/Divider.vue'
import DangerButton from '@/volt/DangerButton.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'

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

const confirm = useConfirm()
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
  confirm.require({
    message: `Are you sure you want to remove "${
      passkey.name || 'this passkey'
    }"? This action cannot be undone and you won't be able to use this passkey to sign in.`,
    header: 'Remove Passkey',
    icon: 'pi pi-exclamation-triangle',
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
  if (!transports || transports.length === 0) return 'pi pi-mobile'

  if (transports.includes('usb')) return 'pi pi-usb'
  if (transports.includes('nfc')) return 'pi pi-wifi'
  if (transports.includes('ble')) return 'pi pi-bluetooth'
  if (transports.includes('internal')) return 'pi pi-mobile'
  if (transports.includes('hybrid')) return 'pi pi-mobile'

  return 'pi pi-key'
}
</script>

<template>
  <Dialog
    :visible="visible"
    header="Manage Passkeys"
    :modal="true"
    class="mx-4 max-w-2xl sm:mx-0 lg:w-5/12"
    @update:visible="emit('hide')"
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
          <i class="pi pi-key text-xl text-gray-400" />
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
                  class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50"
                >
                  <i
                    :class="[
                      getDeviceIcon(passkey.transports),
                      'text-brand-600'
                    ]"
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
                      class="flex-1"
                      placeholder="Enter passkey name"
                      autofocus
                    />
                    <Button
                      type="submit"
                      icon="pi pi-check"
                      severity="success"
                      text
                      rounded
                      :loading="renameForm.processing"
                      :disabled="
                        !renameForm.name.trim() || renameForm.processing
                      "
                      tooltip="Save"
                    />
                    <SecondaryButton
                      type="button"
                      icon="pi pi-times"
                      text
                      rounded
                      :disabled="renameForm.processing"
                      tooltip="Cancel"
                      @click="handleCancelEdit"
                    />
                  </form>
                  <Message
                    v-if="renameForm.errors.name"
                    severity="error"
                    class="mt-1"
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
                icon="pi pi-pencil"
                text
                rounded
                size="small"
                tooltip="Rename"
                class="text-gray-400 hover:text-gray-600"
                @click="handleEditClick(passkey)"
              />
              <DangerButton
                icon="pi pi-trash"
                text
                rounded
                size="small"
                tooltip="Delete"
                @click="confirmDeletePasskey(passkey)"
              />
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
          label="New Passkey"
          icon="pi pi-plus"
          :loading="setupForm.processing"
          :disabled="setupForm.processing"
          variant="outlined"
          size="small"
          @click="handleAddNewPasskey"
        />
        <Button
          label="Done"
          class="bg-brand-600 hover:bg-brand-700"
          size="small"
          @click="emit('hide')"
        />
      </div>
    </template>
  </Dialog>
</template>
