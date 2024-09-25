import { Link, Head, usePage, useForm, router } from '@inertiajs/react'

import AppLayout from '@/layouts/AppLayout.jsx'

import InputText from '@/components/InputText.jsx'
import InputPassword from '@/components/InputPassword.jsx'
import InputEmail from '@/components/InputEmail.jsx'
import InputButton from '@/components/InputButton.jsx'

Profile.layout = (page) => <AppLayout children={page} />
export default function Profile() {
  const loggedInUser = usePage().props.loggedInUser
  const { data, setData, ...form } = useForm({
    email: loggedInUser.email,
    fullName: loggedInUser.fullName,
    currentPassword: undefined,
    password: undefined,
    confirmPassword: undefined
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
    form.patch(`/profile`, {
      preserveScroll: true,
      preserveState: true,
      onError: (errors) => {
        console.error('Update failed:', errors)
      }
    })
  }

  function deleteAccount(e) {
    e.preventDefault()
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      deleteAccountForm.delete('/profile')
    }
  }

  return (
    <>
      <Head title="Profile | Mellow"></Head>
      <div className="mx-auto space-y-8 px-4 md:w-8/12 xl:w-4/12">
        <section className="rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <header className="mb-6">
            <h1 className="text-2xl">Profile Information</h1>
            <p className="mt-2 text-gray-600">
              Update your account's profile information and email address.
            </p>
          </header>

          <form onSubmit={updateProfile} className="space-y-4">
            <InputText
              value={data.fullName}
              onChange={(e) => setData('fullName', e.target.value)}
            />
            <InputEmail
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
            />
            <div className="flex items-center justify-end">
              <InputButton
                processing={form.processing}
                disabled={form.processing}
                label="Save changes"
              />
            </div>
            {form.recentlySuccessful && (
              <p className="text-right text-green-700">
                Profile updated successfully!
              </p>
            )}
          </form>
        </section>

        <section className="rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <header className="mb-6">
            <h2 className="text-2xl">Change Password</h2>
            <p className="mt-2 text-gray-600">
              Ensure your account is using a long, random password to stay
              secure.
            </p>
          </header>

          <form onSubmit={updateProfile} className="space-y-4">
            <InputPassword
              label="Current Password"
              id="currentPassword"
              value={data.currentPassword}
              onChange={(e) => setData('currentPassword', e.target.value)}
              placeholder="Current Password"
            />
            <InputPassword
              label="New Password"
              id="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder="New Password"
            />
            <InputPassword
              label="Confirm Password"
              placeholder="Confirm Password"
              id="confirmPassword"
              value={data.confirmPassword}
              onChange={(e) => setData('confirmPassword', e.target.value)}
            />
            {form.errors.password && (
              <p className="text-red-500" v-if="form.errors.password">
                {form.errors.password}
              </p>
            )}
            <div className="flex items-center justify-end">
              <InputButton
                processing={form.processing}
                disabled={form.processing}
                label="Update Password"
              />
            </div>
            {form.recentlySuccessful && (
              <p className="text-right text-green-700">
                Profile updated successfully!
              </p>
            )}
          </form>
        </section>

        <section className="rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <header className="mb-6">
            <h2 className="text-2xl">Delete Account</h2>
            <p className="mt-2 text-gray-600">
              Once your account is deleted, all of its resources and data will
              be permanently deleted. Before deleting your account, please
              download any data or information that you wish to retain.
            </p>
          </header>

          <form onSubmit={deleteAccount} className="space-y-4">
            <InputPassword
              required
              value={deleteAccountData.password}
              onChange={(e) => setDeleteAccountData('password', e.target.value)}
            />
            <div className="flex items-center justify-end">
              <InputButton
                processing={deleteAccountForm.processing}
                disabled={deleteAccountForm.processing}
                className="border-red-600 bg-red-600"
                label="Delete Account"
              />
            </div>
          </form>
        </section>

        <InputButton
          onClick={(e) => router.delete('/logout')}
          className="w-full border-red-600 bg-red-600"
          label="Logout"
        />
      </div>
    </>
  )
}
