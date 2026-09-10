import Spinner from '@/components/ui/spinner/Spinner.jsx'
import Trash from '@/components/ui/icons/Trash.jsx'
import SignOut from '@/components/ui/icons/SignOut.jsx'
import { useState } from 'react'
import { Head, usePage, useForm, router } from '@inertiajs/react'

import DashboardLayout from '@/layouts/DashboardLayout'

import InputText from '@/components/ui/input/Input.jsx'
import Button from '@/components/ui/button/Button.jsx'
import Avatar from '@/components/ui/avatar/Avatar.jsx'
import Message from '@/components/ui/alert/Alert.jsx'
import { useConfirmation } from '@/hooks/useConfirmation'
import ConfirmationDialog from '@/components/ConfirmationDialog.jsx'

import ImageUpload from '@/components/ImageUpload'

ProfileSettings.layout = [
  DashboardLayout,
  { title: 'Profile', maxWidth: 'narrow' }
]

export default function ProfileSettings() {
  const confirmation = useConfirmation()

  const loggedInUser = usePage().props.loggedInUser

  const { data, setData, ...form } = useForm({
    email: loggedInUser.email,
    fullName: loggedInUser.fullName,
    avatar: null
  })

  const deleteAccountForm = useForm({})

  function updateProfile(e) {
    e.preventDefault()

    const payload = { email: data.email, fullName: data.fullName }
    if (data.avatar instanceof File) payload.avatar = data.avatar

    form.transform(() => payload)
    form.patch('/settings/profile', {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        form.reset('avatar')
      },
      onError: (errors) => {
        console.error('Update failed:', errors)
      }
    })
  }

  function confirmDeleteAccount() {
    confirmation.request({
      message:
        'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      header: 'Delete Account',
      acceptClassName:
        'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700 dark:text-white',
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
      <>
        <Head title="Profile Settings | Ascent React"></Head>

        <div className="max-w-2xl space-y-12">
          {/* Profile Header */}
          <header className="flex items-center space-x-4">
            <Avatar
              src={loggedInUser.currentAvatarUrl}
              alt={''}
              className={'size-12 rounded-full text-2xl'}
            >
              {loggedInUser.initials}
            </Avatar>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {loggedInUser.fullName}
              </h2>
              <p className="text-sm text-gray-500">{loggedInUser.email}</p>
            </div>
          </header>

          {/* Profile Information */}
          <section className="space-y-6">
            <div>
              <h3 className="mb-4 text-sm font-medium text-gray-900">
                Profile Information
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                Update your personal details and contact information.
              </p>
            </div>

            <form onSubmit={updateProfile} className="space-y-4">
              {/* Avatar Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Avatar
                </label>
                <ImageUpload
                  currentImageUrl={loggedInUser.avatarUrl}
                  onImageSelect={(file) => setData('avatar', file)}
                />
                {form.errors.avatar && (
                  <Message
                    role={'alert'}
                    className={[
                      'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                      'mt-2'
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {form.errors.avatar}
                  </Message>
                )}
              </div>

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
                    className={[
                      'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                      'w-full'
                    ]
                      .filter(Boolean)
                      .join(' ')}
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
                    className={[
                      'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                      'w-full'
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3">
                {form.recentlySuccessful && (
                  <span className="text-sm text-green-600">Saved</span>
                )}
                <Button
                  type="submit"
                  disabled={false || form.processing}
                  aria-busy={form.processing}
                  className={
                    'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                  }
                >
                  {form.processing && <Spinner className="h-4 w-4" />}
                  {form.processing ? 'Saving changes...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </section>

          {/* Account Actions */}
          <section className="space-y-6">
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
                      <SignOut
                        className={'h-[1em] w-[1em] shrink-0 text-orange-600'}
                      ></SignOut>
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
                      onClick={signOutEverywhere}
                      className={[
                        'min-h-10 min-h-8 border border-red-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950',
                        'w-full px-4 py-2 text-sm sm:w-auto'
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <SignOut className="h-4 w-4" />
                      {'Sign out'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Delete account card */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm sm:p-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
                      <Trash
                        className={'h-[1em] w-[1em] shrink-0 text-red-600'}
                      ></Trash>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-red-900">
                        Delete account
                      </h4>
                      <p className="mt-1 text-sm text-red-700">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                      {deleteAccountForm.errors.ownership && (
                        <Message
                          role={'alert'}
                          className={[
                            'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                            'mt-3'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {deleteAccountForm.errors.ownership}
                        </Message>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end sm:ml-4 sm:flex-shrink-0">
                    <Button
                      onClick={confirmDeleteAccount}
                      className={[
                        'min-h-10 min-h-8 border border-red-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950',
                        'w-full px-4 py-2 text-sm sm:w-auto'
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <Trash className="h-4 w-4" />
                      {'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </>
      <ConfirmationDialog state={confirmation} />
    </>
  )
}
