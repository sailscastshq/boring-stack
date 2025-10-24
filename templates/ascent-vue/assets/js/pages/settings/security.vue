<script setup>
import { ref, computed, watch } from 'vue'
import { Head, useForm, usePage, router } from '@inertiajs/vue3'
import { useConfirm } from 'primevue/useconfirm'
import Button from '@/volt/Button.vue'
import InputText from '@/volt/InputText.vue'
import ToggleSwitch from '@/volt/ToggleSwitch.vue'
import ConfirmDialog from '@/volt/ConfirmDialog.vue'
import Message from '@/volt/Message.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

defineOptions({
  layout: DashboardLayout
})

import TotpSetupModal from '@/components/TotpSetupModal.vue'
import BackupCodesModal from '@/components/BackupCodesModal.vue'
import EmailTwoFactorSetupModal from '@/components/EmailTwoFactorSetupModal.vue'
import ManagePasskeysModal from '@/components/ManagePasskeysModal.vue'

const props = defineProps({
  loggedInUser: {
    type: Object,
    required: true
  },
  totpSetupData: {
    type: Object,
    default: null
  },
  backupCodes: {
    type: Array,
    default: () => []
  },
  hasPassword: {
    type: Boolean,
    required: true
  },
  passwordLastUpdated: {
    type: String,
    default: ''
  },
  passwordStrength: {
    type: Object,
    required: true
  },
  passkeyEnabled: {
    type: Boolean,
    default: false
  },
  passkeyCount: {
    type: Number,
    default: 0
  },
  passkeys: {
    type: Array,
    default: () => []
  },
  passkeyRegistration: {
    type: Object,
    default: null
  }
})

const page = usePage()
const confirm = useConfirm()

const showPasswordForm = ref(false)
const showInitialPasswordForm = ref(false)
const showSetupFlow = ref(false)
const showTotpModal = ref(false)
const showBackupCodesModal = ref(false)
const showEmailTwoFactorModal = ref(false)
const showPasskeyManageModal = ref(false)

const twoFactorEnabled = computed(() => props.loggedInUser?.twoFactorEnabled)
const totpEnabled = computed(() => props.loggedInUser?.totpEnabled)
const emailTwoFactorEnabled = computed(
  () => props.loggedInUser?.emailTwoFactorEnabled
)

// Auto-open TOTP modal if setup data is present
watch(
  () => props.totpSetupData,
  (newValue) => {
    if (newValue) {
      showTotpModal.value = true
    }
  }
)

// Auto-open backup codes modal if backup codes are available
watch(
  () => props.backupCodes,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      showBackupCodesModal.value = true
    }
  }
)

// Auto-start passkey registration if registration data is present
watch(
  () => props.passkeyRegistration,
  (newValue) => {
    if (newValue) {
      handlePasskeyRegistration(newValue)
    }
  }
)

// Determine backup codes context based on whether TOTP setup data is present
const backupCodesContext = computed(() =>
  props.totpSetupData ? 'setup' : 'regenerate'
)

const form = useForm({
  currentPassword: '',
  password: '',
  confirmPassword: ''
})

const generateBackupCodesForm = useForm({})

const initialPasswordForm = useForm({
  password: '',
  confirmPassword: ''
})

const setupTotpForm = useForm({})
const setupEmailForm = useForm({})
const disableTwoFactorForm = useForm({})
const setupPasskeyForm = useForm({})
const disablePasskeysForm = useForm({})

function updatePassword(e) {
  e.preventDefault()
  form.patch('/security/update-password', {
    preserveScroll: true,
    preserveState: true,
    onSuccess: () => {
      form.reset()
      showPasswordForm.value = false
    },
    onError: (errors) => {
      console.error('Password update failed:', errors)
    }
  })
}

function handleTwoFactorToggle() {
  if (!twoFactorEnabled.value) {
    // Check if user has password before allowing 2FA setup
    if (!props.hasPassword) return // Should be disabled anyway
    // User wants to enable 2FA - show setup flow with individual method cards
    showSetupFlow.value = true
  } else {
    // User wants to disable all 2FA methods
    disableTwoFactorForm.post('/security/disable-2fa', {
      preserveScroll: true,
      onSuccess: () => {
        showSetupFlow.value = false
      },
      onError: (errors) => {
        console.error('2FA disable failed:', errors)
      }
    })
  }
}

function handleTotpToggle() {
  if (!totpEnabled.value) {
    setupTOTP()
  } else {
    // Disable TOTP
    router.post(
      '/security/disable-2fa',
      { method: 'totp' },
      { preserveScroll: true }
    )
  }
}

function handleEmailTwoFactorToggle() {
  if (!emailTwoFactorEnabled.value) {
    setupEmail2FA()
  } else {
    // Disable Email 2FA
    router.post(
      '/security/disable-2fa',
      { method: 'email' },
      { preserveScroll: true }
    )
  }
}

function setupTOTP() {
  if (!props.hasPassword) return // Should be disabled anyway, but extra safety

  setupTotpForm.post('/security/setup-totp', {
    preserveScroll: true
  })
}

function setupEmail2FA() {
  if (!props.hasPassword) return // Should be disabled anyway, but extra safety

  setupEmailForm.post('/security/setup-email-2fa', {
    preserveScroll: true,
    onSuccess: () => {
      showEmailTwoFactorModal.value = true
    }
  })
}

function handleGenerateBackupCodes() {
  generateBackupCodesForm.post('/security/generate-backup-codes', {
    preserveScroll: true
  })
}

function setupPasskey() {
  if (!props.hasPassword) return

  setupPasskeyForm.post('/security/setup-passkey', {
    preserveScroll: true
  })
}

async function handlePasskeyRegistration(registrationData) {
  try {
    const { startRegistration } = await import('@simplewebauthn/browser')
    const credential = await startRegistration(registrationData.options)

    // Send credential to backend for verification and storage
    router.post(
      '/security/verify-passkey-setup',
      {
        credential,
        userId: registrationData.userId
      },
      {
        preserveScroll: true
      }
    )
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // User cancelled passkey registration
    } else if (error.name === 'AbortError') {
      // Passkey registration was aborted
    } else if (error.name === 'NotSupportedError') {
      console.error('WebAuthn not supported in this browser')
    } else {
      console.error('WebAuthn registration error:', error)
    }
  }
}

function handleDisablePasskeys() {
  confirm.require({
    message: `Are you sure you want to disable all passkeys? This will remove all ${
      props.passkeyCount
    } registered ${
      props.passkeyCount === 1 ? 'passkey' : 'passkeys'
    } and disable passkey authentication for your account.`,
    header: 'Disable All Passkeys',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
    accept: () => {
      disablePasskeysForm.post('/security/disable-passkeys', {
        preserveScroll: true
      })
    }
  })
}

function handleManagePasskeys() {
  showPasskeyManageModal.value = true
}

function handleSetupPassword() {
  showInitialPasswordForm.value = true
}

function submitInitialPassword(e) {
  e.preventDefault()
  initialPasswordForm.post('/security/setup-initial-password', {
    preserveScroll: true,
    preserveState: true,
    onSuccess: () => {
      initialPasswordForm.reset()
      showInitialPasswordForm.value = false
    }
  })
}
</script>

<template>
  <Head title="Security Settings | Ascent Vue" />
  <ConfirmDialog :style="{ width: '32rem' }" />

  <div class="max-w-4xl space-y-8">
    <!-- Password Section -->
    <section class="space-y-6">
      <header>
        <h3 class="mb-4 text-sm font-medium text-gray-900">Password</h3>
        <p class="mb-6 text-sm text-gray-500">
          {{
            hasPassword
              ? 'Set a strong password to protect your account.'
              : 'Set up a password to enable two-factor authentication and enhance your account security.'
          }}
        </p>
      </header>

      <div
        class="rounded-lg border border-gray-300 bg-white p-4 shadow-sm sm:p-6"
      >
        <!-- No Password State - Show Setup Option -->
        <div
          v-if="!hasPassword && !showInitialPasswordForm"
          class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
        >
          <div class="flex items-center space-x-3 sm:space-x-4">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50"
            >
              <i class="pi pi-lock text-orange-600" />
            </div>
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900">
                You don't have a password set
              </h4>
              <p class="mt-1 text-sm text-gray-500">
                Set one up to enable two-factor authentication
              </p>
            </div>
          </div>
          <div class="flex justify-end sm:ml-4">
            <Button
              label="Set up"
              size="small"
              outlined
              @click="handleSetupPassword"
            />
          </div>
        </div>

        <!-- Initial Password Setup Form -->
        <form
          v-else-if="!hasPassword && showInitialPasswordForm"
          @submit="submitInitialPassword"
          class="space-y-6"
        >
          <div class="mb-4 flex items-center space-x-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50"
            >
              <i class="pi pi-lock text-brand-600" />
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900">
                Set up your password
              </h4>
              <p class="text-sm text-gray-500">
                Create a secure password for your account
              </p>
            </div>
          </div>

          <Message
            v-if="initialPasswordForm.errors.setupInitialPassword"
            severity="error"
            :text="initialPasswordForm.errors.setupInitialPassword"
            class="mb-4"
          />

          <div class="grid gap-4">
            <div>
              <label
                for="initialPassword"
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <InputText
                id="initialPassword"
                v-model="initialPasswordForm.password"
                type="password"
                placeholder="Enter your password"
                class="w-full"
              />
              <Message
                v-if="initialPasswordForm.errors.password"
                severity="error"
                :text="initialPasswordForm.errors.password"
                class="mt-2"
              />
            </div>

            <div>
              <label
                for="confirmInitialPassword"
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm password
              </label>
              <InputText
                id="confirmInitialPassword"
                v-model="initialPasswordForm.confirmPassword"
                type="password"
                placeholder="Confirm your password"
                class="w-full"
              />
              <Message
                v-if="initialPasswordForm.errors.confirmPassword"
                severity="error"
                :text="initialPasswordForm.errors.confirmPassword"
                class="mt-2"
              />
            </div>
          </div>

          <div
            class="flex flex-col space-y-3 pt-4 sm:flex-row sm:items-center sm:justify-end sm:space-x-3 sm:space-y-0"
          >
            <Button
              type="button"
              label="Cancel"
              size="small"
              class="w-full px-4 py-2 text-sm sm:w-auto"
              outlined
              text
              severity="secondary"
              @click="
                () => {
                  showInitialPasswordForm = false
                  initialPasswordForm.reset()
                }
              "
            />
            <Button
              type="submit"
              label="Set up password"
              size="small"
              outlined
              class="w-full px-4 py-2 text-sm sm:w-auto"
              :disabled="initialPasswordForm.processing"
              :loading="initialPasswordForm.processing"
            />
          </div>
        </form>

        <!-- Password Display View -->
        <div
          v-else-if="hasPassword && !showPasswordForm"
          class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
        >
          <div class="flex items-center space-x-3 sm:space-x-4">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50"
            >
              <i class="pi pi-lock text-brand-600" />
            </div>
            <div class="min-w-0 flex-1">
              <div
                class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0"
              >
                <span class="font-mono text-sm text-gray-400">
                  ••••••••••••••
                </span>
                <span
                  :class="[
                    'inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    passwordStrength.color === 'success'
                      ? 'bg-success-100 text-success-800'
                      : passwordStrength.color === 'warning'
                      ? 'bg-warning-100 text-warning-800'
                      : passwordStrength.color === 'danger'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  <i class="pi pi-shield mr-1" />
                  {{ passwordStrength.label }}
                </span>
              </div>
              <p class="mt-1 text-sm text-gray-500">
                Last updated {{ passwordLastUpdated }}
              </p>
            </div>
          </div>
          <div class="flex justify-end sm:ml-4">
            <Button
              label="Edit"
              size="small"
              outlined
              icon="pi pi-pencil"
              @click="showPasswordForm = true"
            />
          </div>
        </div>

        <!-- Password Edit Form -->
        <form
          v-else-if="hasPassword && showPasswordForm"
          @submit="updatePassword"
          class="space-y-6"
        >
          <div class="mb-4 flex items-center space-x-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50"
            >
              <i class="pi pi-lock text-brand-600" />
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900">
                Change your password
              </h4>
              <p class="text-sm text-gray-500">
                Enter your current password and choose a new one
              </p>
            </div>
          </div>

          <div class="grid gap-4">
            <div>
              <label
                for="currentPassword"
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                Current password
              </label>
              <InputText
                id="currentPassword"
                v-model="form.currentPassword"
                type="password"
                placeholder="Enter your current password"
                class="w-full"
              />
              <Message
                v-if="form.errors.currentPassword"
                severity="error"
                :text="form.errors.currentPassword"
                class="mt-2"
              />
            </div>

            <div>
              <label
                for="newPassword"
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                New password
              </label>
              <InputText
                id="newPassword"
                v-model="form.password"
                type="password"
                placeholder="Enter new password"
                class="w-full"
              />
              <Message
                v-if="form.errors.password"
                severity="error"
                :text="form.errors.password"
                class="mt-2"
              />
            </div>

            <div>
              <label
                for="confirmPassword"
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm new password
              </label>
              <InputText
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                placeholder="Confirm new password"
                class="w-full"
              />
              <Message
                v-if="form.errors.confirmPassword"
                severity="error"
                :text="form.errors.confirmPassword"
                class="mt-2"
              />
            </div>
          </div>

          <div
            class="flex flex-col space-y-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
          >
            <span
              v-if="form.recentlySuccessful"
              class="text-sm text-success-600"
            >
              Password updated successfully
            </span>
            <div
              class="flex flex-col space-y-2 sm:ml-auto sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0"
            >
              <Button
                type="button"
                label="Cancel"
                size="small"
                class="w-full px-4 py-2 text-sm sm:w-auto"
                outlined
                text
                severity="secondary"
                @click="
                  () => {
                    showPasswordForm = false
                    form.reset()
                  }
                "
              />
              <Button
                type="submit"
                label="Save new password"
                size="small"
                outlined
                class="w-full px-4 py-2 text-sm sm:w-auto"
                :loading="form.processing"
              />
            </div>
          </div>
        </form>
      </div>
    </section>

    <!-- Passkeys -->
    <section class="space-y-6">
      <header>
        <h3 class="mb-4 text-sm font-medium text-gray-900">Passkeys</h3>
        <p class="mb-6 text-sm text-gray-500">
          Use your device's biometric authentication (Face ID, Touch ID, Windows
          Hello) for secure, passwordless sign-in.
        </p>
      </header>

      <div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-lg',
                passkeyEnabled ? 'bg-success-50' : 'bg-gray-50'
              ]"
            >
              <svg
                :class="[
                  'h-5 w-5',
                  passkeyEnabled ? 'text-success-600' : 'text-gray-400'
                ]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-2.04-1.34-3.27 0-1.23.47-2.4 1.34-3.27.87-.87 2.04-1.34 3.27-1.34 1.23 0 2.4.47 3.27 1.34.87.87 1.34 2.04 1.34 3.27 0 1.23-.47 2.4-1.34 3.27-.09.1-.22.15-.35.15s-.26-.05-.35-.15c-.87-.87-1.34-2.04-1.34-3.27s.47-2.4 1.34-3.27c.87-.87 2.04-1.34 3.27-1.34s2.4.47 3.27 1.34c.87.87 1.34 2.04 1.34 3.27s-.47 2.4-1.34 3.27c-.09.1-.22.15-.35.15z"
                />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900">Passkeys</h4>
              <p class="mt-1 text-sm text-gray-500">
                {{
                  passkeyEnabled
                    ? `${passkeyCount} ${
                        passkeyCount === 1 ? 'passkey' : 'passkeys'
                      } registered - sign in with biometric authentication`
                    : 'Set up passkeys for secure, passwordless authentication'
                }}
              </p>
            </div>
          </div>
          <ToggleSwitch
            :model-value="passkeyEnabled"
            @update:model-value="
              passkeyEnabled ? handleDisablePasskeys() : setupPasskey()
            "
            :disabled="
              (!hasPassword && !passkeyEnabled) ||
              setupPasskeyForm.processing ||
              disablePasskeysForm.processing
            "
            :title="
              !hasPassword && !passkeyEnabled
                ? 'Set up a password first'
                : undefined
            "
          />
        </div>
      </div>

      <!-- Passkey Management - Show when passkeys are enabled -->
      <div
        v-if="passkeyEnabled"
        class="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50"
            >
              <i class="pi pi-cog text-brand-600" />
            </div>
            <div class="flex-1">
              <h5 class="text-sm font-medium text-gray-900">Manage Passkeys</h5>
              <p class="text-sm text-gray-500">
                View, rename, or remove your registered passkeys
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <Button
              label="Manage"
              size="small"
              outlined
              icon="pi pi-cog"
              @click="handleManagePasskeys"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Two-Factor Authentication -->
    <section class="space-y-6">
      <header>
        <h3 class="mb-4 text-sm font-medium text-gray-900">
          Two-step verification
        </h3>
        <p class="mb-6 text-sm text-gray-500">
          We recommend requiring a verification code in addition to your
          password.
        </p>
      </header>
      <div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-lg',
                twoFactorEnabled ? 'bg-success-50' : 'bg-gray-50'
              ]"
            >
              <i
                :class="[
                  'pi pi-shield',
                  twoFactorEnabled ? 'text-success-600' : 'text-gray-400'
                ]"
              />
            </div>
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900">
                Two-step verification
              </h4>
              <p class="mt-1 text-sm text-gray-500">
                {{
                  twoFactorEnabled
                    ? 'Your account is protected with two-step verification'
                    : 'Add an extra layer of security to your account'
                }}
              </p>
            </div>
          </div>
          <ToggleSwitch
            :model-value="twoFactorEnabled"
            @update:model-value="handleTwoFactorToggle"
            :disabled="
              (!hasPassword && !twoFactorEnabled) ||
              disableTwoFactorForm.processing
            "
            :title="
              !hasPassword && !twoFactorEnabled
                ? 'Set up a password first'
                : undefined
            "
          />
        </div>
      </div>

      <!-- 2FA Methods - Show when 2FA is enabled OR setup flow is active -->
      <div v-if="twoFactorEnabled || showSetupFlow" class="mt-6 space-y-4">
        <div>
          <h4 class="mb-2 text-sm font-medium text-gray-900">
            {{
              twoFactorEnabled
                ? 'Two-factor authentication methods'
                : 'Choose your verification methods'
            }}
          </h4>
          <p class="mb-4 text-sm text-gray-500">
            {{
              twoFactorEnabled
                ? 'Manage your two-step verification methods.'
                : 'Select one or both methods to secure your account. You can add more methods later.'
            }}
          </p>
        </div>

        <!-- TOTP Card -->
        <div
          :class="[
            'rounded-lg border p-4 shadow-sm',
            totpEnabled
              ? 'border-success-200 bg-success-50'
              : 'border-gray-300 bg-white'
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                :class="[
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  totpEnabled ? 'bg-success-100' : 'bg-brand-50'
                ]"
              >
                <i
                  :class="[
                    'pi pi-mobile',
                    totpEnabled ? 'text-success-600' : 'text-brand-600'
                  ]"
                />
              </div>
              <div class="flex-1">
                <h5 class="text-sm font-medium text-gray-900">
                  Authenticator App (TOTP)
                </h5>
                <p class="text-sm text-gray-500">
                  Use Passwords, 1Password, Google Authenticator, or similar
                  apps
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span
                v-if="totpEnabled"
                class="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800"
              >
                Active
              </span>
              <Button
                v-if="!totpEnabled"
                :label="setupTotpForm.processing ? 'Setting up...' : 'Set up'"
                size="small"
                outlined
                :loading="setupTotpForm.processing"
                :disabled="!hasPassword || setupTotpForm.processing"
                @click="setupTOTP"
                :tooltip="!hasPassword ? 'Set up a password first' : undefined"
              />
              <ToggleSwitch
                v-else
                :model-value="totpEnabled"
                @update:model-value="handleTotpToggle"
              />
            </div>
          </div>
        </div>

        <!-- Email Card -->
        <div
          :class="[
            'rounded-lg border p-4 shadow-sm',
            emailTwoFactorEnabled
              ? 'border-success-200 bg-success-50'
              : 'border-gray-300 bg-white'
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                :class="[
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  emailTwoFactorEnabled ? 'bg-success-100' : 'bg-brand-50'
                ]"
              >
                <i
                  :class="[
                    'pi pi-envelope',
                    emailTwoFactorEnabled
                      ? 'text-success-600'
                      : 'text-brand-600'
                  ]"
                />
              </div>
              <div class="flex-1">
                <h5 class="text-sm font-medium text-gray-900">
                  Email Verification
                </h5>
                <p class="text-sm text-gray-500">
                  Receive verification codes via email
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span
                v-if="emailTwoFactorEnabled"
                class="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800"
              >
                Active
              </span>
              <Button
                v-if="!emailTwoFactorEnabled"
                :label="setupEmailForm.processing ? 'Setting up...' : 'Set up'"
                size="small"
                outlined
                :loading="setupEmailForm.processing"
                :disabled="!hasPassword || setupEmailForm.processing"
                @click="setupEmail2FA"
                :tooltip="!hasPassword ? 'Set up a password first' : undefined"
              />
              <InputSwitch
                v-else
                :model-value="emailTwoFactorEnabled"
                @update:model-value="handleEmailTwoFactorToggle"
              />
            </div>
          </div>
        </div>

        <!-- Backup Codes Section - only show when 2FA is enabled -->
        <div
          v-if="twoFactorEnabled"
          class="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50"
              >
                <i class="pi pi-key text-orange-600" />
              </div>
              <div class="flex-1">
                <h5 class="text-sm font-medium text-gray-900">
                  Backup Recovery Codes
                </h5>
                <p class="text-sm text-gray-500">
                  Generate backup codes to access your account if you lose your
                  2FA device
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <Button
                :label="
                  generateBackupCodesForm.processing
                    ? 'Generating...'
                    : 'Generate codes'
                "
                size="small"
                outlined
                :loading="generateBackupCodesForm.processing"
                :disabled="generateBackupCodesForm.processing"
                @click="handleGenerateBackupCodes"
              />
            </div>
          </div>
        </div>

        <!-- Cancel button - only show during setup flow when no 2FA is enabled -->
        <div v-if="!twoFactorEnabled && showSetupFlow" class="flex justify-end">
          <Button
            label="Cancel"
            size="small"
            text
            severity="secondary"
            class="p-button-outlined px-4 py-2 text-sm"
            @click="showSetupFlow = false"
          />
        </div>
      </div>
    </section>
  </div>

  <!-- TOTP Setup Modal -->
  <TotpSetupModal
    :visible="showTotpModal"
    :setup-data="totpSetupData"
    @hide="showTotpModal = false"
  />

  <!-- Backup Codes Modal -->
  <BackupCodesModal
    :visible="showBackupCodesModal"
    :backup-codes="backupCodes"
    :context="backupCodesContext"
    @hide="showBackupCodesModal = false"
  />

  <!-- Email Two-Factor Setup Modal -->
  <EmailTwoFactorSetupModal
    :visible="showEmailTwoFactorModal"
    :user-email="loggedInUser?.email"
    @hide="showEmailTwoFactorModal = false"
  />

  <!-- Passkey Manage Modal -->
  <ManagePasskeysModal
    :visible="showPasskeyManageModal"
    :passkeys="passkeys"
    @hide="showPasskeyManageModal = false"
  />
</template>
