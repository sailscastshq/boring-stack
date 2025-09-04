import { useState } from 'react'
import { Head, usePage, useForm, router } from '@inertiajs/react'

import AppLayout from '@/layouts/AppLayout.jsx'
import SettingsLayout from '@/layouts/SettingsLayout.jsx'

import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Avatar } from 'primereact/avatar'
import { Message } from 'primereact/message'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { confirmDialog } from 'primereact/confirmdialog'

ProfileSettings.layout = (page) => (
  <AppLayout>
    <SettingsLayout children={page} />
  </AppLayout>
)

export default function ProfileSettings() {
  const loggedInUser = usePage().props.loggedInUser

  const { data, setData, ...form } = useForm({
    email: loggedInUser.email,
    fullName: loggedInUser.fullName
  })

  const {
    data: deleteAccountData,
    setData: setDeleteAccountData,
    ...deleteAccountForm
  } = useForm({
    password: undefined
  })

  function updateProfile(e) {
    e.preventDefault()
    form.patch(`/settings/profile`, {
      preserveScroll: true,
      preserveState: true,
      onError: (errors) => {
        console.error('Update failed:', errors)
      }
    })
  }

  function confirmDeleteAccount() {
    confirmDialog({
      message:
        'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      header: 'Delete Account',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => {
        deleteAccountForm.delete('/settings/profile')
      }
    })
  }

  function signOutEverywhere() {
    router.delete('/logout')
  }

  return (
    <>
      <Head title="Profile Settings | Ascent React"></Head>
      <ConfirmDialog />

      <div className="max-w-2xl space-y-12">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <Avatar
            image={loggedInUser.avatarUrl}
            label={loggedInUser.initials}
            size="large"
            shape="circle"
          />
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {loggedInUser.fullName}
            </h2>
            <p className="text-sm text-gray-500">{loggedInUser.email}</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-900">
              Profile Information
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Update your personal details and contact information.
            </p>
          </div>

          <form onSubmit={updateProfile} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1 block text-sm text-gray-700"
                >
                  Full Name
                </label>
                <InputText
                  id="fullName"
                  value={data.fullName}
                  onChange={(e) => setData('fullName', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm text-gray-700"
                >
                  Email Address
                </label>
                <InputText
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3">
              {form.recentlySuccessful && (
                <span className="text-sm text-green-600">Saved</span>
              )}
              <Button
                type="submit"
                label="Save changes"
                loading={form.processing}
                size="small"
                outlined
              />
            </div>
          </form>
        </div>

        {/* Account Actions */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-900">
              Account Actions
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Manage your account security and data.
            </p>
          </div>

          <div className="space-y-4">
            {/* Sign out everywhere card */}
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-sm sm:p-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                <div className="flex items-start space-x-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50">
                    <i className="pi pi-sign-out text-orange-600"></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-orange-900">
                      Sign out everywhere
                    </h4>
                    <p className="mt-1 text-sm text-orange-700">
                      Sign out from all devices and browser sessions for
                      enhanced security.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end sm:ml-4 sm:flex-shrink-0">
                  <Button
                    label="Sign out"
                    onClick={signOutEverywhere}
                    size="small"
                    className="w-full px-4 py-2 text-sm sm:w-auto"
                    outlined
                    severity="warning"
                    icon="pi pi-sign-out"
                  />
                </div>
              </div>
            </div>

            {/* Delete account card */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm sm:p-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                <div className="flex items-start space-x-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
                    <i className="pi pi-trash text-red-600"></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-red-900">
                      Delete account
                    </h4>
                    <p className="mt-1 text-sm text-red-700">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end sm:ml-4 sm:flex-shrink-0">
                  <Button
                    label="Delete"
                    onClick={confirmDeleteAccount}
                    severity="danger"
                    size="small"
                    className="w-full px-4 py-2 text-sm sm:w-auto"
                    icon="pi pi-trash"
                    outlined
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
