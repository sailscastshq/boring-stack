import Input from '@/components/ui/input/Input.jsx'
import ChevronLeft from '@/components/ui/icons/ChevronLeft.jsx'
import Spinner from '@/components/ui/spinner/Spinner.jsx'
import CheckCircle from '@/components/ui/icons/CheckCircle.jsx'
import Notifications from '@/components/Notifications.jsx'
import { Link, Head, useForm } from '@inertiajs/react'
import { useMemo, useRef } from 'react'

import Message from '@/components/ui/alert/Alert.jsx'

export default function ResetPassword({ token }) {
  const { data, setData, ...form } = useForm({
    token,
    password: '',
    confirmPassword: ''
  })

  const containsSpecialChars = useMemo(() => {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
    return specialChars.test(data.password)
  }, [data.password])

  const passwordIsValid = useMemo(() => {
    return data.password?.length >= 8
  }, [data.password])

  const passwordsMatch = useMemo(() => {
    return data.password === data.confirmPassword
  }, [data.password, data.confirmPassword])

  const disableResetPasswordButton = useMemo(() => {
    if (!passwordIsValid) return true
    if (!containsSpecialChars) return true
    if (!passwordsMatch) return true
    if (form.processing) return true
    return false
  }, [passwordIsValid, containsSpecialChars, passwordsMatch, form.processing])

  function submit(e) {
    e.preventDefault()
    form.post('/reset-password')
  }

  return (
    <>
      <>
        <Head title="Reset Password | Ascent"></Head>
        <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-brand-50/30 via-white to-accent-50/20 py-12 sm:px-6 lg:px-8">
          {/* Background Elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-brand-200/20 blur-3xl"></div>
            <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl"></div>
          </div>

          <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center">
              <Link href="/" className="group">
                <div className="relative">
                  <div className="absolute inset-0 scale-110 rounded-2xl bg-brand-200/30 opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                  <img
                    src="/images/logo.svg"
                    alt="Ascent Logo"
                    className="relative h-12 w-auto"
                  />
                </div>
              </Link>
            </div>

            {/* Header */}
            <header className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Create new password
              </h1>
              <p className="mt-2 text-base text-gray-600">
                Please create a strong password for your account
              </p>
            </header>
          </div>

          <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
            <div className="relative">
              {/* Background blur effect */}
              <div className="absolute inset-0 scale-105 rounded-2xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 blur-xl"></div>

              {/* Main card */}
              <div className="relative rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-2xl">
                {/* Global error */}
                {form.errors.password && (
                  <div className="mb-6" role="alert">
                    <Message
                      role={'alert'}
                      className={[
                        'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                        'w-full'
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {form.errors.password}
                    </Message>
                  </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className={`w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200 ${
                          form.errors.password
                            ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                        }`}
                        placeholder="Enter your new password"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={data.confirmPassword}
                        onChange={(e) =>
                          setData('confirmPassword', e.target.value)
                        }
                        className={`w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200 ${
                          data.confirmPassword && !passwordsMatch
                            ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                        }`}
                        placeholder="Confirm your new password"
                      />
                    </div>
                    {data.confirmPassword && !passwordsMatch && (
                      <p className="mt-1 text-sm text-red-600">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Password requirements:
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div
                        className={`flex items-center space-x-2 text-sm ${
                          passwordIsValid ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        <CheckCircle
                          className={`h-4 w-4 flex-shrink-0 ${
                            passwordIsValid ? 'text-green-500' : 'text-gray-400'
                          }`}
                        />
                        <span>At least 8 characters</span>
                      </div>
                      <div
                        className={`flex items-center space-x-2 text-sm ${
                          containsSpecialChars
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}
                      >
                        <CheckCircle
                          className={`h-4 w-4 flex-shrink-0 ${
                            containsSpecialChars
                              ? 'text-green-500'
                              : 'text-gray-400'
                          }`}
                        />
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={disableResetPasswordButton}
                      className={`flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                        disableResetPasswordButton
                          ? 'bg-gray-300'
                          : 'bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
                      }`}
                    >
                      {form.processing ? (
                        <div className="flex items-center space-x-2">
                          <Spinner className="h-5 w-5 " />
                          <span>Resetting password...</span>
                        </div>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>
                </form>

                {/* Back to login link */}
                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="flex items-center justify-center text-sm font-medium text-gray-600 transition-colors hover:text-brand-600"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
      <Notifications />
    </>
  )
}
