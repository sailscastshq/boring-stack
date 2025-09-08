import { useState, useEffect } from 'react'
import { Head, useForm, usePage, router } from '@inertiajs/react'
import { Button } from 'primereact/button'
import { Password } from 'primereact/password'
import { InputText } from 'primereact/inputtext'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { confirmDialog } from 'primereact/confirmdialog'
import AppLayout from '@/layouts/AppLayout.jsx'
import SettingsLayout from '@/layouts/SettingsLayout.jsx'
import TotpSetupModal from '@/components/TotpSetupModal.jsx'
import BackupCodesModal from '@/components/BackupCodesModal.jsx'
import EmailTwoFactorSetupModal from '@/components/EmailTwoFactorSetupModal.jsx'

SecuritySettings.layout = (page) => (
  <AppLayout>
    <SettingsLayout children={page} />
  </AppLayout>
)

export default function SecuritySettings({
  loggedInUser,
  totpSetupData,
  backupCodes,
  passwordLastUpdated,
  passwordStrength
}) {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showSetupFlow, setShowSetupFlow] = useState(false)
  const [showTotpModal, setShowTotpModal] = useState(false)
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false)
  const [showEmailTwoFactorModal, setShowEmailTwoFactorModal] = useState(false)

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

  // Determine backup codes context based on whether TOTP setup data is present
  const backupCodesContext = totpSetupData ? 'setup' : 'regenerate'

  const { data, setData, ...form } = useForm({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  })

  const { post: generateBackupCodes, processing: generatingBackupCodes } =
    useForm({})

  function updatePassword(e) {
    e.preventDefault()
    form.patch('/settings/update-password', {
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
      // User wants to enable 2FA - show setup flow with individual method cards
      setShowSetupFlow(true)
    } else {
      // User wants to disable all 2FA methods
      router.post('/security/disable-2fa', {
        preserveScroll: true,
        onSuccess: () => {
          setShowSetupFlow(false)
        },
        onError: (errors) => {
          console.error('2FA disable failed:', errors)
        }
      })
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
    router.post(
      '/security/setup-totp',
      {},
      {
        preserveScroll: true,
        onError: (errors) => {
          console.error('TOTP setup failed:', errors)
        }
      }
    )
  }

  function setupEmail2FA() {
    router.post(
      '/security/setup-email-2fa',
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowEmailTwoFactorModal(true)
        },
        onError: (errors) => {
          console.error('Email 2FA setup failed:', errors)
        }
      }
    )
  }

  function handleGenerateBackupCodes() {
    generateBackupCodes('/security/generate-backup-codes', {
      preserveScroll: true,
      onError: (errors) => {
        console.error('Backup codes generation failed:', errors)
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
              Set a strong password to protect your account.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            {!showPasswordForm ? (
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
                  </div>
                </div>

                {form.errors.password && (
                  <p className="text-sm text-red-600">{form.errors.password}</p>
                )}

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
              <button
                onClick={handleTwoFactorToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-brand-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
                        label="Set up"
                        size="small"
                        outlined
                        onClick={setupTOTP}
                      />
                    ) : (
                      <button
                        onClick={handleTotpToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full bg-brand-600 transition-colors`}
                      >
                        <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
                      </button>
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
                        label="Set up"
                        size="small"
                        outlined
                        onClick={setupEmail2FA}
                      />
                    ) : (
                      <button
                        onClick={handleEmailTwoFactorToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full bg-brand-600 transition-colors`}
                      >
                        <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
                      </button>
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
    </>
  )
}
