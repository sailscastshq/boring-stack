import { useState } from 'react'
import { Head, useForm, usePage, router } from '@inertiajs/react'
import { Button } from 'primereact/button'
import { Password } from 'primereact/password'
import { InputText } from 'primereact/inputtext'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { confirmDialog } from 'primereact/confirmdialog'
import AppLayout from '@/layouts/AppLayout.jsx'
import SettingsLayout from '@/layouts/SettingsLayout.jsx'

SecuritySettings.layout = (page) => (
  <AppLayout>
    <SettingsLayout children={page} />
  </AppLayout>
)

export default function SecuritySettings() {
  const loggedInUser = usePage().props.loggedInUser
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const { data, setData, ...form } = useForm({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  })

  // Mock session data - replace with real data from your backend
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: 'Safari on Mac OS X',
      location: 'Melbourne, Australia',
      lastActive: 'Current session',
      isCurrent: true,
      icon: 'pi pi-globe',
      browserIcon: '🌐'
    },
    {
      id: 2,
      device: "Sienna's MacBook Pro",
      location: 'Melbourne, Australia',
      lastActive: '1 day ago',
      isCurrent: false,
      icon: 'pi pi-desktop',
      browserIcon: '💻'
    },
    {
      id: 3,
      device: 'Safari on Mac OS X',
      location: 'Melbourne, Australia',
      lastActive: '1 month ago',
      isCurrent: false,
      icon: 'pi pi-globe',
      browserIcon: '🌐'
    },
    {
      id: 4,
      device: "Sienna's MacBook Pro",
      location: 'Melbourne, Australia',
      lastActive: '1 month ago',
      isCurrent: false,
      icon: 'pi pi-desktop',
      browserIcon: '💻'
    },
    {
      id: 5,
      device: 'Brave on Mac OS X',
      location: 'Melbourne, Australia',
      lastActive: '1 month ago',
      isCurrent: false,
      icon: 'pi pi-shield',
      browserIcon: '🦁'
    }
  ])

  function updatePassword(e) {
    e.preventDefault()
    form.patch('/settings/security/password', {
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

  function revokeSession(sessionId, deviceName) {
    confirmDialog({
      message: `This device will be automatically logged out.`,
      header: `"${deviceName}" removed`,
      icon: 'pi pi-check-circle',
      acceptClassName: 'p-button-success',
      acceptLabel: 'Undo',
      rejectLabel: 'Dismiss',
      accept: () => {
        // Undo the removal (add back to sessions)
        console.log('Undo removal')
      },
      reject: () => {
        // Actually remove session from state
        setSessions(sessions.filter((session) => session.id !== sessionId))

        // You would also call your backend API here:
        // router.delete(`/settings/security/sessions/${sessionId}`, {
        //   preserveScroll: true,
        //   onSuccess: () => {
        //     console.log(`Session ${sessionId} revoked`)
        //   }
        // })
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
                      <span className="inline-flex w-fit items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800">
                        <i className="pi pi-shield mr-1"></i>
                        Very secure
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Last updated 3 months ago
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
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
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
        </div>

        {/* Browser and Devices Sessions */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-900">
              Active sessions
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              These browsers and devices are currently signed in to your
              account. Remove any unauthorized devices.
            </p>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`rounded-lg border p-4 shadow-sm transition-colors ${
                  session.isCurrent
                    ? 'border-brand-200 bg-brand-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        session.isCurrent ? 'bg-brand-100' : 'bg-gray-50'
                      }`}
                    >
                      <i
                        className={`${session.icon} ${
                          session.isCurrent ? 'text-brand-600' : 'text-gray-400'
                        }`}
                      ></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {session.device}
                        </h4>
                        {session.isCurrent && (
                          <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">
                            <i className="pi pi-circle-fill mr-1 text-brand-600"></i>
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <i className="pi pi-map-marker mr-1"></i>
                          {session.location}
                        </span>
                        <span className="flex items-center">
                          <i className="pi pi-clock mr-1"></i>
                          {session.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {!session.isCurrent && (
                      <Button
                        onClick={() =>
                          revokeSession(session.id, session.device)
                        }
                        size="small"
                        severity="danger"
                        icon="pi pi-trash"
                        tooltip="Remove device"
                        text
                        tooltipOptions={{ position: 'left' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
