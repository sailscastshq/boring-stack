import Envelope from '@/components/ui/icons/Envelope.jsx'
import Fingerprint from '@/components/ui/icons/Fingerprint.jsx'
import Spinner from '@/components/ui/spinner/Spinner.jsx'
import Key from '@/components/ui/icons/Key.jsx'
import Settings from '@/components/ui/icons/Settings.jsx'
import Edit from '@/components/ui/icons/Edit.jsx'
import ShieldCheck from '@/components/ui/icons/ShieldCheck.jsx'
import Lock from '@/components/ui/icons/Lock.jsx'
import { useState, useEffect } from 'react'
import { Head, useForm, usePage, router } from '@inertiajs/react'
import Button from '@/components/ui/button/Button.jsx'
import Password from '@/components/PasswordField.jsx'
import InputText from '@/components/ui/input/Input.jsx'
import InputSwitch from '@/components/ui/switch/Switch.jsx'
import { useConfirmation } from '@/hooks/useConfirmation'
import ConfirmationDialog from '@/components/ConfirmationDialog.jsx'
import Message from '@/components/ui/alert/Alert.jsx'

import DashboardLayout from '@/layouts/DashboardLayout'

import TotpSetupModal from '@/components/TotpSetupModal.jsx'
import BackupCodesModal from '@/components/BackupCodesModal.jsx'
import EmailTwoFactorSetupModal from '@/components/EmailTwoFactorSetupModal.jsx'
import ManagePasskeysModal from '@/components/ManagePasskeysModal.jsx'

SecuritySettings.layout = [
  DashboardLayout,
  { title: 'Security', maxWidth: 'narrow' }
]

export default function SecuritySettings({
  loggedInUser,
  totpSetupData,
  backupCodes,
  hasPassword,
  passwordLastUpdated,
  passwordStrength,
  passkeyEnabled,
  passkeyCount,
  passkeys,
  passkeyRegistration
}) {
  const confirmation = useConfirmation()

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showInitialPasswordForm, setShowInitialPasswordForm] = useState(false)
  const [showSetupFlow, setShowSetupFlow] = useState(false)
  const [showTotpModal, setShowTotpModal] = useState(false)
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false)
  const [showEmailTwoFactorModal, setShowEmailTwoFactorModal] = useState(false)
  const [showPasskeySetupModal, setShowPasskeySetupModal] = useState(false)
  const [showPasskeyManageModal, setShowPasskeyManageModal] = useState(false)

  const twoFactorEnabled = loggedInUser?.twoFactorEnabled
  const totpEnabled = loggedInUser?.totpEnabled
  const emailTwoFactorEnabled = loggedInUser?.emailTwoFactorEnabled

  // Auto-open TOTP modal if setup data is present
  useEffect(() => {
    if (totpSetupData) {
      setShowTotpModal(true)
    }
  }, [totpSetupData])

  // Auto-open backup codes modal if backup codes are available
  useEffect(() => {
    if (backupCodes && backupCodes.length > 0) {
      setShowBackupCodesModal(true)
    }
  }, [backupCodes])

  // Auto-start passkey registration if registration data is present
  useEffect(() => {
    if (passkeyRegistration) {
      handlePasskeyRegistration(passkeyRegistration)
    }
  }, [passkeyRegistration])

  // Determine backup codes context based on whether TOTP setup data is present
  const backupCodesContext = totpSetupData ? 'setup' : 'regenerate'

  const { data, setData, ...form } = useForm({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  })

  const { post: generateBackupCodes, processing: generatingBackupCodes } =
    useForm({})
  const {
    data: initialPasswordData,
    setData: setInitialPasswordData,
    post: setupInitialPassword,
    processing: settingUpPassword,
    errors: initialPasswordErrors
  } = useForm({
    password: '',
    confirmPassword: ''
  })
  const { post: setupTotpForm, processing: settingUpTotp } = useForm({})
  const { post: setupEmailForm, processing: settingUpEmail } = useForm({})
  const { post: disableTwoFactorForm, processing: disablingTwoFactor } =
    useForm({})
  const { post: setupPasskeyForm, processing: settingUpPasskey } = useForm({})
  const { post: disablePasskeysForm, processing: disablingPasskeys } = useForm(
    {}
  )

  function updatePassword(e) {
    e.preventDefault()
    form.patch('/security/update-password', {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setData({
          currentPassword: '',
          password: '',
          confirmPassword: ''
        })
        setShowPasswordForm(false)
      },
      onError: (errors) => {
        console.error('Password update failed:', errors)
      }
    })
  }

  function handleTwoFactorToggle() {
    if (!twoFactorEnabled) {
      // Check if user has password before allowing 2FA setup
      if (!hasPassword) return // Should be disabled anyway
      // User wants to enable 2FA - show setup flow with individual method cards
      setShowSetupFlow(true)
    } else {
      // User wants to disable all 2FA methods
      disableTwoFactorForm(
        '/security/disable-2fa',
        {},
        {
          preserveScroll: true,
          onSuccess: () => {
            setShowSetupFlow(false)
          },
          onError: (errors) => {
            console.error('2FA disable failed:', errors)
          }
        }
      )
    }
  }

  function handleTotpToggle() {
    if (!totpEnabled) {
      setupTOTP()
    } else {
      // Disable TOTP
      router.post(
        '/security/disable-2fa',
        { method: 'totp' },
        {
          preserveScroll: true
        }
      )
    }
  }

  function handleEmailTwoFactorToggle() {
    if (!emailTwoFactorEnabled) {
      setupEmail2FA()
    } else {
      // Disable Email 2FA
      router.post(
        '/security/disable-2fa',
        { method: 'email' },
        {
          preserveScroll: true
        }
      )
    }
  }

  function setupTOTP() {
    if (!hasPassword) return // Should be disabled anyway, but extra safety

    setupTotpForm('/security/setup-totp', {
      preserveScroll: true
    })
  }

  function setupEmail2FA() {
    if (!hasPassword) return // Should be disabled anyway, but extra safety

    setupEmailForm('/security/setup-email-2fa', {
      preserveScroll: true,
      onSuccess: () => {
        setShowEmailTwoFactorModal(true)
      }
    })
  }

  function handleGenerateBackupCodes() {
    generateBackupCodes('/security/generate-backup-codes', {
      preserveScroll: true
    })
  }

  function setupPasskey() {
    if (!hasPassword) return

    setupPasskeyForm('/security/setup-passkey', {
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
    confirmation.request({
      message: `Are you sure you want to disable all passkeys? This will remove all ${passkeyCount} registered ${
        passkeyCount === 1 ? 'passkey' : 'passkeys'
      } and disable passkey authentication for your account.`,
      header: 'Disable All Passkeys',
      acceptClassName: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
      accept: () => {
        disablePasskeysForm('/security/disable-passkeys', {
          preserveScroll: true
        })
      }
    })
  }

  function handleManagePasskeys() {
    setShowPasskeyManageModal(true)
  }

  function handleSetupPassword() {
    setShowInitialPasswordForm(true)
  }

  function submitInitialPassword(e) {
    e.preventDefault()
    setupInitialPassword('/security/setup-initial-password', {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setInitialPasswordData({
          password: '',
          confirmPassword: ''
        })
        setShowInitialPasswordForm(false)
      }
    })
  }

  return (
    <>
      <>
        <Head title="Security Settings | Ascent React"></Head>

        <div className="max-w-4xl space-y-8">
          {/* Password Section */}
          <section className="space-y-6">
            <header>
              <h3 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                Password
              </h3>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                {hasPassword
                  ? 'Set a strong password to protect your account.'
                  : 'Set up a password to enable two-factor authentication and enhance your account security.'}
              </p>
            </header>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
              {!hasPassword ? (
                !showInitialPasswordForm ? (
                  // No Password State - Show Setup Option
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/40">
                        <Lock
                          className={'h-[1em] w-[1em] shrink-0 text-orange-600'}
                        ></Lock>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          You don't have a password set
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Set one up to enable two-factor authentication
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end sm:ml-4">
                      <Button
                        onClick={handleSetupPassword}
                        className={
                          'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                        }
                      >
                        {'Set up'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Initial Password Setup Form
                  <form onSubmit={submitInitialPassword} className="space-y-6">
                    <div className="mb-4 flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
                        <Lock
                          className={'h-[1em] w-[1em] shrink-0 text-brand-600'}
                        ></Lock>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Set up your password
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Create a secure password for your account
                        </p>
                      </div>
                    </div>

                    {initialPasswordErrors.setupInitialPassword && (
                      <Message
                        role={'alert'}
                        className={[
                          'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                          'mb-4'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {initialPasswordErrors.setupInitialPassword}
                      </Message>
                    )}

                    <div className="grid gap-4">
                      <div>
                        <label
                          htmlFor="initialPassword"
                          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Password
                        </label>
                        <InputText
                          id="initialPassword"
                          type="password"
                          value={initialPasswordData.password}
                          onChange={(e) =>
                            setInitialPasswordData('password', e.target.value)
                          }
                          placeholder="Enter your password"
                          className={[
                            'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                            'w-full'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                        {initialPasswordErrors.password && (
                          <Message
                            role={'alert'}
                            className={[
                              'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                              'mt-2'
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {initialPasswordErrors.password}
                          </Message>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="confirmInitialPassword"
                          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Confirm password
                        </label>
                        <InputText
                          id="confirmInitialPassword"
                          type="password"
                          value={initialPasswordData.confirmPassword}
                          onChange={(e) =>
                            setInitialPasswordData(
                              'confirmPassword',
                              e.target.value
                            )
                          }
                          placeholder="Confirm your password"
                          className={[
                            'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                            'w-full'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                        {initialPasswordErrors.confirmPassword && (
                          <Message
                            role={'alert'}
                            className={[
                              'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                              'mt-2'
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {initialPasswordErrors.confirmPassword}
                          </Message>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 pt-4 sm:flex-row sm:items-center sm:justify-end sm:space-x-3 sm:space-y-0">
                      <Button
                        type="button"
                        onClick={() => {
                          setShowInitialPasswordForm(false)
                          setInitialPasswordData({
                            password: '',
                            confirmPassword: ''
                          })
                        }}
                        className={[
                          'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                          'w-full px-4 py-2 text-sm sm:w-auto'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {'Cancel'}
                      </Button>
                      <Button
                        type="submit"
                        disabled={settingUpPassword || settingUpPassword}
                        aria-busy={settingUpPassword}
                        className={[
                          'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                          'w-full px-4 py-2 text-sm sm:w-auto'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {settingUpPassword && <Spinner className="h-4 w-4" />}
                        {'Set up password'}
                      </Button>
                    </div>
                  </form>
                )
              ) : !showPasswordForm ? (
                // Password Display View
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
                      <Lock
                        className={'h-[1em] w-[1em] shrink-0 text-brand-600'}
                      ></Lock>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                        <span className="font-mono text-sm text-gray-400">
                          ••••••••••••••
                        </span>
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            passwordStrength.color === 'success'
                              ? 'bg-success-100 text-success-800 dark:bg-success-950/40 dark:text-success-300'
                              : passwordStrength.color === 'warning'
                              ? 'bg-warning-100 text-warning-800'
                              : passwordStrength.color === 'danger'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}
                        >
                          <ShieldCheck
                            className={'mr-1 h-[1em] w-[1em] shrink-0'}
                          ></ShieldCheck>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Last updated {passwordLastUpdated}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end sm:ml-4">
                    <Button
                      onClick={() => setShowPasswordForm(true)}
                      className={
                        'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                      }
                    >
                      <Edit className="h-4 w-4" />
                      {'Edit'}
                    </Button>
                  </div>
                </div>
              ) : (
                // Password Edit Form
                <form onSubmit={updatePassword} className="space-y-6">
                  <div className="mb-4 flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
                      <Lock
                        className={'h-[1em] w-[1em] shrink-0 text-brand-600'}
                      ></Lock>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Change your password
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter your current password and choose a new one
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Current password
                      </label>
                      <InputText
                        id="currentPassword"
                        type="password"
                        value={data.currentPassword}
                        onChange={(e) =>
                          setData('currentPassword', e.target.value)
                        }
                        placeholder="Enter your current password"
                        className={[
                          'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                          'w-full'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                      {form.errors.currentPassword && (
                        <Message
                          role={'alert'}
                          className={[
                            'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                            'mt-2'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {form.errors.currentPassword}
                        </Message>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="newPassword"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        New password
                      </label>
                      <InputText
                        id="newPassword"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Enter new password"
                        className={[
                          'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                          'w-full'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                      {form.errors.password && (
                        <Message
                          role={'alert'}
                          className={[
                            'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                            'mt-2'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {form.errors.password}
                        </Message>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Confirm new password
                      </label>
                      <InputText
                        id="confirmPassword"
                        type="password"
                        value={data.confirmPassword}
                        onChange={(e) =>
                          setData('confirmPassword', e.target.value)
                        }
                        placeholder="Confirm new password"
                        className={[
                          'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                          'w-full'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                      {form.errors.confirmPassword && (
                        <Message
                          role={'alert'}
                          className={[
                            'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                            'mt-2'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {form.errors.confirmPassword}
                        </Message>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    {form.recentlySuccessful && (
                      <span className="text-sm text-success-600 dark:text-success-300">
                        Password updated successfully
                      </span>
                    )}
                    <div className="flex flex-col space-y-2 sm:ml-auto sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                      <Button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false)
                          setData({
                            currentPassword: '',
                            password: '',
                            confirmPassword: ''
                          })
                        }}
                        className={[
                          'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                          'w-full px-4 py-2 text-sm sm:w-auto'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {'Cancel'}
                      </Button>
                      <Button
                        type="submit"
                        disabled={false || form.processing}
                        aria-busy={form.processing}
                        className={[
                          'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                          'w-full px-4 py-2 text-sm sm:w-auto'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {form.processing && <Spinner className="h-4 w-4" />}
                        {'Save new password'}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* Passkeys */}
          <section className="space-y-6">
            <header>
              <h3 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                Passkeys
              </h3>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Use your device's biometric authentication (Face ID, Touch ID,
                Windows Hello) for secure, passwordless sign-in.
              </p>
            </header>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      passkeyEnabled ? 'bg-success-50' : 'bg-gray-50'
                    }`}
                  >
                    <Fingerprint
                      className={`h-5 w-5 ${
                        passkeyEnabled ? 'text-success-600' : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Passkeys
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {passkeyEnabled
                        ? `${passkeyCount} ${
                            passkeyCount === 1 ? 'passkey' : 'passkeys'
                          } registered - sign in with biometric authentication`
                        : 'Set up passkeys for secure, passwordless authentication'}
                    </p>
                  </div>
                </div>
                <InputSwitch
                  aria-label="Passkeys"
                  checked={passkeyEnabled}
                  onChange={
                    passkeyEnabled ? handleDisablePasskeys : setupPasskey
                  }
                  disabled={
                    (!hasPassword && !passkeyEnabled) ||
                    settingUpPasskey ||
                    disablingPasskeys
                  }
                  title={
                    !hasPassword && !passkeyEnabled
                      ? 'Set up a password first'
                      : undefined
                  }
                  className={'checked:bg-brand dark:checked:bg-brand'}
                />
              </div>
            </div>

            {/* Passkey Management - Show when passkeys are enabled */}
            {passkeyEnabled && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
                      <Settings
                        className={'h-[1em] w-[1em] shrink-0 text-brand-600'}
                      ></Settings>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Manage Passkeys
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        View, rename, or remove your registered passkeys
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleManagePasskeys}
                      className={
                        'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                      }
                    >
                      <Settings className="h-4 w-4" />
                      {'Manage'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Two-Factor Authentication */}
          <section className="space-y-6">
            <header>
              <h3 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                Two-step verification
              </h3>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                We recommend requiring a verification code in addition to your
                password.
              </p>
            </header>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      twoFactorEnabled ? 'bg-success-50' : 'bg-gray-50'
                    }`}
                  >
                    <ShieldCheck
                      className={`h-5 w-5 ${
                        twoFactorEnabled ? 'text-success-600' : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Two-step verification
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {twoFactorEnabled
                        ? 'Your account is protected with two-step verification'
                        : 'Add an extra layer of security to your account'}
                    </p>
                  </div>
                </div>
                <InputSwitch
                  aria-label="Two-step verification"
                  checked={twoFactorEnabled}
                  onChange={handleTwoFactorToggle}
                  disabled={
                    (!hasPassword && !twoFactorEnabled) || disablingTwoFactor
                  }
                  title={
                    !hasPassword && !twoFactorEnabled
                      ? 'Set up a password first'
                      : undefined
                  }
                  className={'checked:bg-brand dark:checked:bg-brand'}
                />
              </div>
            </div>

            {/* 2FA Methods - Show when 2FA is enabled OR setup flow is active */}
            {(twoFactorEnabled || showSetupFlow) && (
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {twoFactorEnabled
                      ? 'Two-factor authentication methods'
                      : 'Choose your verification methods'}
                  </h4>
                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    {twoFactorEnabled
                      ? 'Manage your two-step verification methods.'
                      : 'Select one or both methods to secure your account. You can add more methods later.'}
                  </p>
                </div>

                {/* TOTP Card */}
                <div
                  className={`rounded-lg border p-4 shadow-sm ${
                    totpEnabled
                      ? 'border-success-200 bg-success-50 dark:border-success-900 dark:bg-success-950/40'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          totpEnabled ? 'bg-success-100' : 'bg-brand-50'
                        }`}
                      >
                        <Key
                          className={`h-5 w-5 ${
                            totpEnabled ? 'text-success-600' : 'text-brand-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Authenticator App (TOTP)
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Use Passwords, 1Password, Google Authenticator, or
                          similar apps
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {totpEnabled && (
                        <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800 dark:bg-success-950/40 dark:text-success-300">
                          Active
                        </span>
                      )}
                      {!totpEnabled ? (
                        <Button
                          onClick={setupTOTP}
                          disabled={
                            !hasPassword || settingUpTotp || settingUpTotp
                          }
                          aria-busy={settingUpTotp}
                          title={
                            !hasPassword ? 'Set up a password first' : undefined
                          }
                          className={
                            'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                          }
                        >
                          {settingUpTotp && <Spinner className="h-4 w-4" />}
                          {settingUpTotp ? 'Setting up...' : 'Set up'}
                        </Button>
                      ) : (
                        <InputSwitch
                          aria-label="Authenticator app"
                          checked={totpEnabled}
                          onChange={handleTotpToggle}
                          className={'checked:bg-brand dark:checked:bg-brand'}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Card */}
                <div
                  className={`rounded-lg border p-4 shadow-sm ${
                    emailTwoFactorEnabled
                      ? 'border-success-200 bg-success-50 dark:border-success-900 dark:bg-success-950/40'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          emailTwoFactorEnabled
                            ? 'bg-success-100'
                            : 'bg-brand-50'
                        }`}
                      >
                        <Envelope
                          className={`h-5 w-5 ${
                            emailTwoFactorEnabled
                              ? 'text-success-600'
                              : 'text-brand-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Email Verification
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive verification codes via email
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {emailTwoFactorEnabled && (
                        <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800 dark:bg-success-950/40 dark:text-success-300">
                          Active
                        </span>
                      )}
                      {!emailTwoFactorEnabled ? (
                        <Button
                          onClick={setupEmail2FA}
                          disabled={
                            !hasPassword || settingUpEmail || settingUpEmail
                          }
                          aria-busy={settingUpEmail}
                          title={
                            !hasPassword ? 'Set up a password first' : undefined
                          }
                          className={
                            'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                          }
                        >
                          {settingUpEmail && <Spinner className="h-4 w-4" />}
                          {settingUpEmail ? 'Setting up...' : 'Set up'}
                        </Button>
                      ) : (
                        <InputSwitch
                          aria-label="Email verification"
                          checked={emailTwoFactorEnabled}
                          onChange={handleEmailTwoFactorToggle}
                          className={'checked:bg-brand dark:checked:bg-brand'}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Backup Codes Section - only show when 2FA is enabled */}
                {twoFactorEnabled && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/40">
                          <Key
                            className={
                              'h-[1em] w-[1em] shrink-0 text-orange-600'
                            }
                          ></Key>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Backup Recovery Codes
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Generate backup codes to access your account if you
                            lose your 2FA device
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={handleGenerateBackupCodes}
                          disabled={
                            generatingBackupCodes || generatingBackupCodes
                          }
                          aria-busy={generatingBackupCodes}
                          className={
                            'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                          }
                        >
                          {generatingBackupCodes && (
                            <Spinner className="h-4 w-4" />
                          )}
                          {generatingBackupCodes
                            ? 'Generating...'
                            : 'Generate codes'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancel button - only show during setup flow when no 2FA is enabled */}
                {!twoFactorEnabled && showSetupFlow && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setShowSetupFlow(false)}
                      className={[
                        'min-h-10 min-h-8 border border-transparent bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                        'px-4 py-2 text-sm'
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {'Cancel'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* TOTP Setup Modal */}
        <TotpSetupModal
          visible={showTotpModal}
          onHide={() => setShowTotpModal(false)}
          setupData={totpSetupData}
        />

        {/* Backup Codes Modal */}
        <BackupCodesModal
          visible={showBackupCodesModal}
          onHide={() => setShowBackupCodesModal(false)}
          backupCodes={backupCodes}
          context={backupCodesContext}
        />

        {/* Email Two-Factor Setup Modal */}
        <EmailTwoFactorSetupModal
          visible={showEmailTwoFactorModal}
          onHide={() => setShowEmailTwoFactorModal(false)}
          userEmail={loggedInUser?.email}
        />

        {/* Passkey Manage Modal */}
        <ManagePasskeysModal
          visible={showPasskeyManageModal}
          onHide={() => setShowPasskeyManageModal(false)}
          passkeys={passkeys}
        />
      </>
      <ConfirmationDialog state={confirmation} />
    </>
  )
}
