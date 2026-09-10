import Input from '@/components/ui/input/Input.jsx'
import ChevronLeft from '@/components/ui/icons/ChevronLeft.jsx'
import Spinner from '@/components/ui/spinner/Spinner.jsx'
import Notifications from '@/components/Notifications.jsx'
import { Link, Head, useForm } from '@inertiajs/react'
import { useMemo, useRef } from 'react'

import Message from '@/components/ui/alert/Alert.jsx'

export default function ForgotPassword() {
  const form = useForm({
    email: ''
  }).withPrecognition('post', '/forgot-password')
  const { data, setData } = form

  const disableForgotPasswordButton = useMemo(() => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    const isEmailValid = emailRegex.test(data.email)
    if (!isEmailValid) return true
    if (form.processing) return true
    return false
  }, [data.email, form.processing])

  function submit(e) {
    e.preventDefault()
    form.post('/forgot-password')
  }

  return (
    <>
      <>
        <Head title="Reset Password | Ascent"></Head>
        <div className="ascent-auth">
          {/* Background Elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="hidden"></div>
            <div className="hidden"></div>
          </div>

          <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center">
              <Link href="/" className="group">
                <div className="relative">
                  <div className="hidden"></div>
                  <span
                    className="inline-flex items-center gap-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
                    aria-label="Ascent"
                  >
                    Ascent
                    <span
                      className="text-brand-600 dark:text-brand-300"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Header */}
            <header className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Forgot your password?
              </h1>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a link to reset your
                password
              </p>
            </header>
          </div>

          <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
            <div className="relative">
              {/* Background blur effect */}
              <div className="hidden"></div>

              {/* Main card */}
              <div className="ascent-auth-panel">
                {/* Global error */}
                {form.errors.email && (
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
                      {form.errors.email}
                    </Message>
                  </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        onBlur={() => form.validate('email')}
                        className={`w-full rounded-lg border px-4 py-4 text-base font-medium transition-all duration-200 ${
                          form.errors.email
                            ? 'border-red-300 bg-red-50 ring-2 ring-red-100 dark:border-red-900 dark:bg-red-950/40'
                            : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950'
                        }`}
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={disableForgotPasswordButton}
                      className={`flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                        disableForgotPasswordButton
                          ? 'bg-gray-300'
                          : 'bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600'
                      }`}
                    >
                      {form.processing ? (
                        <div className="flex items-center space-x-2">
                          <Spinner className="h-5 w-5" />
                          <span>Sending reset link...</span>
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </form>

                {/* Back to login link */}
                <div className="mt-6 text-center">
                  <Link
                    href="/login?mode=password"
                    className="flex items-center justify-center text-sm font-medium text-gray-600 transition-colors hover:text-brand-600 dark:text-gray-400"
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
