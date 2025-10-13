import { useState, useEffect } from 'react'
import { Head, useForm, usePage, router } from '@inertiajs/react'
import { Button } from 'primereact/button'
import { Password } from 'primereact/password'
import { InputText } from 'primereact/inputtext'
import { InputSwitch } from 'primereact/inputswitch'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { confirmDialog } from 'primereact/confirmdialog'
import { Message } from 'primereact/message'

import DashboardLayout from '@/layouts/DashboardLayout'
import SettingsLayout from '@/layouts/SettingsLayout.jsx'

import TotpSetupModal from '@/components/TotpSetupModal.jsx'
import BackupCodesModal from '@/components/BackupCodesModal.jsx'
import EmailTwoFactorSetupModal from '@/components/EmailTwoFactorSetupModal.jsx'
import PasskeyManageModal from '@/components/PasskeyManageModal.jsx'

SecuritySettings.layout = (page) => (
  <DashboardLayout title="Security" maxWidth="narrow">
    {page}
  </DashboardLayout>
)

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
          preserveScroll: true,
          onError: (errors) => {
            console.error('TOTP disable failed:', errors)
          }
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
          preserveScroll: true,
          onError: (errors) => {
            console.error('Email 2FA disable failed:', errors)
          }
        }
      )
    }
  }

  function setupTOTP() {
    if (!hasPassword) return // Should be disabled anyway, but extra safety

    setupTotpForm('/security/setup-totp', {
      preserveScroll: true,
      onError: (errors) => {
        console.error('TOTP setup failed:', errors)
      }
    })
  }

  function setupEmail2FA() {
    if (!hasPassword) return // Should be disabled anyway, but extra safety

    setupEmailForm('/security/setup-email-2fa', {
      preserveScroll: true,
      onSuccess: () => {
        setShowEmailTwoFactorModal(true)
      },
      onError: (errors) => {
        console.error('Email 2FA setup failed:', errors)
      }
    })
  }

  function handleGenerateBackupCodes() {
    generateBackupCodes('/security/generate-backup-codes', {
      preserveScroll: true,
      onError: (errors) => {
        console.error('Backup codes generation failed:', errors)
      }
    })
  }

  function setupPasskey() {
    if (!hasPassword) return

    setupPasskeyForm('/security/setup-passkey', {
      preserveScroll: true,
      onError: (errors) => {
        console.error('Passkey setup failed:', errors)
      }
    })
  }

  async function handlePasskeyRegistration(registrationData) {
    console.log('Starting passkey registration with options:', registrationData)

    try {
      const { startRegistration } = await import('@simplewebauthn/browser')

      console.log('Starting WebAuthn registration...')
      const credential = await startRegistration(registrationData.options)
      console.log('WebAuthn registration successful, credential:', credential)

      // Send credential to backend for verification and storage
      console.log('Sending credential to backend for verification...')
      router.post(
        '/security/verify-passkey-setup',
        {
          credential,
          userId: registrationData.userId
        },
        {
          preserveScroll: true,
          onSuccess: (page) => {
            console.log('Passkey setup successful!', page)
            // The page should automatically refresh with updated data
          },
          onError: (errors) => {
            console.error('Backend passkey registration failed:', errors)
          }
        }
      )
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        console.log('User cancelled passkey registration')
      } else if (error.name === 'AbortError') {
        console.log('Passkey registration was aborted')
      } else if (error.name === 'NotSupportedError') {
        console.error('WebAuthn not supported in this browser')
      } else {
        console.error('WebAuthn registration error:', error)
      }
    }
  }

  function handleDisablePasskeys() {
    confirmDialog({
      message: `Are you sure you want to disable all passkeys? This will remove all ${passkeyCount} registered ${
        passkeyCount === 1 ? 'passkey' : 'passkeys'
      } and disable passkey authentication for your account.`,
      header: 'Disable All Passkeys',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
      accept: () => {
        disablePasskeysForm('/security/disable-passkeys', {
          preserveScroll: true,
          onError: (errors) => {
            console.error('Disable passkeys failed:', errors)
          }
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
      },
      onError: (errors) => {
        console.error('Initial password setup failed:', errors)
      }
    })
  }

  return (
    <>
      <Head title="Security Settings | Ascent React"></Head>
      <ConfirmDialog />

      <div className="max-w-4xl space-y-8">
        {/* Password Section */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-900">Password</h3>
            <p className="mb-6 text-sm text-gray-500">
              {hasPassword
                ? 'Set a strong password to protect your account.'
                : 'Set up a password to enable two-factor authentication and enhance your account security.'}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            {!hasPassword ? (
              !showInitialPasswordForm ? (
                // No Password State - Show Setup Option
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50">
                      <i className="pi pi-lock text-orange-600"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        You don't have a password set
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Set one up to enable two-factor authentication
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end sm:ml-4">
                    <Button
                      label="Set up"
                      size="small"
                      outlined
                      onClick={handleSetupPassword}
                    />
                  </div>
                </div>
              ) : (
                // Initial Password Setup Form
                <form onSubmit={submitInitialPassword} className="space-y-6">
                  <div className="mb-4 flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                      <i className="pi pi-lock text-brand-600"></i>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Set up your password
                      </h4>
                      <p className="text-sm text-gray-500">
                        Create a secure password for your account
                      </p>
                    </div>
                  </div>

                  {initialPasswordErrors.setupInitialPassword && (
                    <Message
                      severity="error"
                      text={initialPasswordErrors.setupInitialPassword}
                      className="mb-4"
                    />
                  )}

                  <div className="grid gap-4">
                    <div>
                      <label
                        htmlFor="initialPassword"
                        className="mb-2 block text-sm font-medium text-gray-700"
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
                        className="w-full"
                      />
                      {initialPasswordErrors.password && (
                        <Message
                          severity="error"
                          text={initialPasswordErrors.password}
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmInitialPassword"
                        className="mb-2 block text-sm font-medium text-gray-700"
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
                        className="w-full"
                      />
                      {initialPasswordErrors.confirmPassword && (
                        <Message
                          severity="error"
                          text={initialPasswordErrors.confirmPassword}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 pt-4 sm:flex-row sm:items-center sm:justify-end sm:space-x-3 sm:space-y-0">
                    <Button
                      type="button"
                      label="Cancel"
                      size="small"
                      className="w-full px-4 py-2 text-sm sm:w-auto"
                      outlined
                      text
                      severity="secondary"
                      onClick={() => {
                        setShowInitialPasswordForm(false)
                        setInitialPasswordData({
                          password: '',
                          confirmPassword: ''
                        })
                      }}
                    />
                    <Button
                      type="submit"
                      label="Set up password"
                      size="small"
                      outlined
                      className="w-full px-4 py-2 text-sm sm:w-auto"
                      disabled={settingUpPassword}
                      loading={settingUpPassword}
                    />
                  </div>
                </form>
              )
            ) : !showPasswordForm ? (
              // Password Display View
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                    <i className="pi pi-lock text-brand-600"></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                      <span className="font-mono text-sm text-gray-400">
                        ••••••••••••••
                      </span>
                      <span
                        className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          passwordStrength.color === 'success'
                            ? 'bg-success-100 text-success-800'
                            : passwordStrength.color === 'warning'
                            ? 'bg-warning-100 text-warning-800'
                            : passwordStrength.color === 'danger'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <i className="pi pi-shield mr-1"></i>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Last updated {passwordLastUpdated}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end sm:ml-4">
                  <Button
                    label="Edit"
                    size="small"
                    outlined
                    icon="pi pi-pencil"
                    onClick={() => setShowPasswordForm(true)}
                  />
                </div>
              </div>
            ) : (
              // Password Edit Form
              <form onSubmit={updatePassword} className="space-y-6">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                    <i className="pi pi-lock text-brand-600"></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Change your password
                    </h4>
                    <p className="text-sm text-gray-500">
                      Enter your current password and choose a new one
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-2 block text-sm font-medium text-gray-700"
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
                      className="w-full"
                    />
                    {form.errors.currentPassword && (
                      <Message
                        severity="error"
                        text={form.errors.currentPassword}
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      New password
                    </label>
                    <InputText
                      id="newPassword"
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      placeholder="Enter new password"
                      className="w-full"
                    />
                    {form.errors.password && (
                      <Message
                        severity="error"
                        text={form.errors.password}
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-gray-700"
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
                      className="w-full"
                    />
                    {form.errors.confirmPassword && (
                      <Message
                        severity="error"
                        text={form.errors.confirmPassword}
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  {form.recentlySuccessful && (
                    <span className="text-sm text-success-600">
                      Password updated successfully
                    </span>
                  )}
                  <div className="flex flex-col space-y-2 sm:ml-auto sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                    <Button
                      type="button"
                      label="Cancel"
                      size="small"
                      className=" w-full px-4 py-2 text-sm sm:w-auto"
                      outlined
                      text
                      severity="secondary"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setData({
                          currentPassword: '',
                          password: '',
                          confirmPassword: ''
                        })
                      }}
                    />
                    <Button
                      type="submit"
                      label="Save new password"
                      size="small"
                      outlined
                      className="w-full px-4 py-2 text-sm sm:w-auto"
                      loading={form.processing}
                    />
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Passkeys */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-900">Passkeys</h3>
            <p className="mb-6 text-sm text-gray-500">
              Use your device's biometric authentication (Face ID, Touch ID,
              Windows Hello) for secure, passwordless sign-in.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    passkeyEnabled ? 'bg-success-50' : 'bg-gray-50'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      passkeyEnabled ? 'text-success-600' : 'text-gray-400'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-2.04-1.34-3.27 0-1.23.47-2.4 1.34-3.27.87-.87 2.04-1.34 3.27-1.34 1.23 0 2.4.47 3.27 1.34.87.87 1.34 2.04 1.34 3.27 0 1.23-.47 2.4-1.34 3.27-.09.1-.22.15-.35.15s-.26-.05-.35-.15c-.87-.87-1.34-2.04-1.34-3.27s.47-2.4 1.34-3.27c.87-.87 2.04-1.34 3.27-1.34s2.4.47 3.27 1.34c.87.87 1.34 2.04 1.34 3.27s-.47 2.4-1.34 3.27c-.09.1-.22.15-.35.15z" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    Passkeys
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {passkeyEnabled
                      ? `${passkeyCount} ${
                          passkeyCount === 1 ? 'passkey' : 'passkeys'
                        } registered - sign in with biometric authentication`
                      : 'Set up passkeys for secure, passwordless authentication'}
                  </p>
                </div>
              </div>
              <InputSwitch
                checked={passkeyEnabled}
                onChange={passkeyEnabled ? handleDisablePasskeys : setupPasskey}
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
              />
            </div>
          </div>

          {/* Passkey Management - Show when passkeys are enabled */}
          {passkeyEnabled && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                    <i className="pi pi-cog text-brand-600"></i>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">
                      Manage Passkeys
                    </h5>
                    <p className="text-sm text-gray-500">
                      View, rename, or remove your registered passkeys
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    label="Manage"
                    size="small"
                    outlined
                    icon="pi pi-cog"
                    onClick={handleManagePasskeys}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-900">
              Two-step verification
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              We recommend requiring a verification code in addition to your
              password.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    twoFactorEnabled ? 'bg-success-50' : 'bg-gray-50'
                  }`}
                >
                  <i
                    className={`pi pi-shield ${
                      twoFactorEnabled ? 'text-success-600' : 'text-gray-400'
                    }`}
                  ></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    Two-step verification
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {twoFactorEnabled
                      ? 'Your account is protected with two-step verification'
                      : 'Add an extra layer of security to your account'}
                  </p>
                </div>
              </div>
              <InputSwitch
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
              />
            </div>
          </div>

          {/* 2FA Methods - Show when 2FA is enabled OR setup flow is active */}
          {(twoFactorEnabled || showSetupFlow) && (
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-900">
                  {twoFactorEnabled
                    ? 'Two-factor authentication methods'
                    : 'Choose your verification methods'}
                </h4>
                <p className="mb-4 text-sm text-gray-500">
                  {twoFactorEnabled
                    ? 'Manage your two-step verification methods.'
                    : 'Select one or both methods to secure your account. You can add more methods later.'}
                </p>
              </div>

              {/* TOTP Card */}
              <div
                className={`rounded-lg border p-4 shadow-sm ${
                  totpEnabled
                    ? 'border-success-200 bg-success-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        totpEnabled ? 'bg-success-100' : 'bg-brand-50'
                      }`}
                    >
                      <i
                        className={`pi pi-mobile ${
                          totpEnabled ? 'text-success-600' : 'text-brand-600'
                        }`}
                      ></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">
                        Authenticator App (TOTP)
                      </h5>
                      <p className="text-sm text-gray-500">
                        Use Passwords, 1Password, Google Authenticator, or
                        similar apps
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {totpEnabled && (
                      <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800">
                        Active
                      </span>
                    )}
                    {!totpEnabled ? (
                      <Button
                        label={settingUpTotp ? 'Setting up...' : 'Set up'}
                        size="small"
                        outlined
                        loading={settingUpTotp}
                        disabled={!hasPassword || settingUpTotp}
                        onClick={setupTOTP}
                        tooltip={
                          !hasPassword ? 'Set up a password first' : undefined
                        }
                      />
                    ) : (
                      <InputSwitch
                        checked={totpEnabled}
                        onChange={handleTotpToggle}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div
                className={`rounded-lg border p-4 shadow-sm ${
                  emailTwoFactorEnabled
                    ? 'border-success-200 bg-success-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        emailTwoFactorEnabled ? 'bg-success-100' : 'bg-brand-50'
                      }`}
                    >
                      <i
                        className={`pi pi-envelope ${
                          emailTwoFactorEnabled
                            ? 'text-success-600'
                            : 'text-brand-600'
                        }`}
                      ></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">
                        Email Verification
                      </h5>
                      <p className="text-sm text-gray-500">
                        Receive verification codes via email
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {emailTwoFactorEnabled && (
                      <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800">
                        Active
                      </span>
                    )}
                    {!emailTwoFactorEnabled ? (
                      <Button
                        label={settingUpEmail ? 'Setting up...' : 'Set up'}
                        size="small"
                        outlined
                        loading={settingUpEmail}
                        disabled={!hasPassword || settingUpEmail}
                        onClick={setupEmail2FA}
                        tooltip={
                          !hasPassword ? 'Set up a password first' : undefined
                        }
                      />
                    ) : (
                      <InputSwitch
                        checked={emailTwoFactorEnabled}
                        onChange={handleEmailTwoFactorToggle}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Backup Codes Section - only show when 2FA is enabled */}
              {twoFactorEnabled && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                        <i className="pi pi-key text-orange-600"></i>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900">
                          Backup Recovery Codes
                        </h5>
                        <p className="text-sm text-gray-500">
                          Generate backup codes to access your account if you
                          lose your 2FA device
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        label={
                          generatingBackupCodes
                            ? 'Generating...'
                            : 'Generate codes'
                        }
                        size="small"
                        outlined
                        loading={generatingBackupCodes}
                        disabled={generatingBackupCodes}
                        onClick={handleGenerateBackupCodes}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cancel button - only show during setup flow when no 2FA is enabled */}
              {!twoFactorEnabled && showSetupFlow && (
                <div className="flex justify-end">
                  <Button
                    label="Cancel"
                    size="small"
                    text
                    severity="secondary"
                    className="p-button-outlined px-4 py-2 text-sm"
                    onClick={() => setShowSetupFlow(false)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
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
      <PasskeyManageModal
        visible={showPasskeyManageModal}
        onHide={() => setShowPasskeyManageModal(false)}
        passkeys={passkeys}
      />
    </>
  )
}
