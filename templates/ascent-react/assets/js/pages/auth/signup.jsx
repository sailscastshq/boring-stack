import { Link, Head, useForm } from '@inertiajs/react'
import { useMemo, useState, useEffect, useRef } from 'react'
import { Toast } from 'primereact/toast'
import { useFlashToast } from '@/hooks/useFlashToast'

import { Message } from 'primereact/message'

import InputText from '@/components/InputText.jsx'
import InputEmail from '@/components/InputEmail.jsx'
import InputPassword from '@/components/InputPassword.jsx'
import InputButton from '@/components/InputButton.jsx'
import GoogleButton from '@/components/GoogleButton.jsx'

export default function Signup() {
  const { data, setData, ...form } = useForm({
    fullName: '',
    email: '',
    password: ''
  })

  const [focusedField, setFocusedField] = useState('')
  const [showExpandedOptions, setShowExpandedOptions] = useState(false)
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false)

  // Initialize toast notifications
  const toast = useRef(null)
  useFlashToast(toast)

  // Handle query parameters for controlling the initial view
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search)
        const mode = urlParams.get('mode')

        if (mode === 'password') {
          setShowExpandedOptions(true)
        }
      }
    } catch (error) {
      console.error('Error handling URL parameters:', error)
    }
  }, [])

  // Update URL when toggling modes
  const toggleToPasswordMode = () => {
    setShowExpandedOptions(true)
    try {
      if (typeof window !== 'undefined' && window.location && window.history) {
        const url = new URL(window.location)
        url.searchParams.set('mode', 'password')
        window.history.pushState({}, '', url)
      }
    } catch (error) {
      console.error('Error updating URL for password mode:', error)
    }
  }

  const toggleToMagicMode = () => {
    setShowExpandedOptions(false)
    try {
      if (typeof window !== 'undefined' && window.location && window.history) {
        const url = new URL(window.location)
        url.searchParams.delete('mode')
        window.history.pushState({}, '', url)
      }
    } catch (error) {
      console.error('Error updating URL for magic mode:', error)
    }
  }

  const containsSpecialChars = useMemo(() => {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
    return specialChars.test(data.password)
  }, [data.password])

  const passwordIsValid = useMemo(() => {
    return data.password?.length >= 8
  })

  const disableSignupButton = useMemo(() => {
    if (!data.fullName) return true
    if (!data.email) return true
    if (!passwordIsValid && showExpandedOptions) return true
    if (!containsSpecialChars && showExpandedOptions) return true
    if (form.processing) return true
    return false
  }, [
    data.fullName,
    data.email,
    passwordIsValid,
    containsSpecialChars,
    form.processing,
    showExpandedOptions
  ])

  const disableMagicLinkButton = useMemo(() => {
    if (!data.fullName) return true
    if (!data.email) return true
    if (isSendingMagicLink) return true
    return false
  }, [data.fullName, data.email, isSendingMagicLink])

  function submit(e) {
    e.preventDefault()
    form.post('/signup')
  }

  function sendMagicLink(e) {
    e.preventDefault()
    if (!data.fullName || !data.email) return

    setIsSendingMagicLink(true)

    form.post('/magic-link', {
      data: {
        email: data.email,
        fullName: data.fullName,
        redirectUrl: '/signup'
      },
      onSuccess: () => {
        setIsSendingMagicLink(false)
      },
      onError: (errors) => {
        setIsSendingMagicLink(false)
      }
    })
  }

  return (
    <>
      <Head title="Create Account | Ascent"></Head>
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
              Create your account
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Join thousands of teams scaling with Ascent
            </p>
            <p className="mt-2 text-base text-gray-600">
              Or{' '}
              <Link
                href="/login"
                className="font-semibold text-brand-600 transition-colors hover:text-brand-500"
              >
                sign in to your existing account
              </Link>
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
              {form.errors.signup && (
                <div className="mb-6" role="alert">
                  <Message
                    severity="error"
                    text={form.errors.signup}
                    className="w-full"
                  />
                </div>
              )}

              {!showExpandedOptions ? (
                // Magic Link Primary View
                <form onSubmit={sendMagicLink} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        id="fullName"
                        type="text"
                        autoComplete="name"
                        required
                        value={data.fullName}
                        onChange={(e) => setData('fullName', e.target.value)}
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => setFocusedField('')}
                        className={`w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200 ${
                          form.errors.fullName
                            ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {form.errors.fullName && (
                      <Message severity="error" text={form.errors.fullName} />
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        className={`w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200 ${
                          form.errors.email
                            ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                        }`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {form.errors.email && (
                      <Message severity="error" text={form.errors.email} />
                    )}
                  </div>

                  {/* Magic Link Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={disableMagicLinkButton}
                      className={`flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                        disableMagicLinkButton
                          ? 'bg-gray-300'
                          : 'bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
                      }`}
                    >
                      {isSendingMagicLink ? (
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-5 w-5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Sending link...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <svg
                            className="mr-2 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Send Magic Link</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Other Sign-up Options */}
                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={toggleToPasswordMode}
                      className="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600"
                    >
                      Other sign-up options
                    </button>
                  </div>
                </form>
              ) : (
                // Expanded Traditional Signup View
                <div className="space-y-5">
                  {/* Back to Magic Link */}
                  <div className="mb-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={toggleToMagicMode}
                      className="flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-brand-600"
                    >
                      <svg
                        className="mr-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back to magic link
                    </button>
                  </div>

                  <form onSubmit={submit} className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="fullName-expanded"
                        className="mb-2 block text-sm font-semibold text-gray-900"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          id="fullName-expanded"
                          type="text"
                          autoComplete="name"
                          required
                          value={data.fullName}
                          onChange={(e) => setData('fullName', e.target.value)}
                          onFocus={() => setFocusedField('fullName')}
                          onBlur={() => setFocusedField('')}
                          className={`w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200 ${
                            form.errors.fullName
                              ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                              : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {form.errors.fullName && (
                        <Message severity="error" text={form.errors.fullName} />
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email-expanded"
                        className="mb-2 block text-sm font-semibold text-gray-900"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          id="email-expanded"
                          type="email"
                          autoComplete="email"
                          required
                          value={data.email}
                          onChange={(e) => setData('email', e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField('')}
                          className={`w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200 ${
                            form.errors.email
                              ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                              : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                          }`}
                          placeholder="Enter your email address"
                        />
                      </div>
                      {form.errors.email && (
                        <Message severity="error" text={form.errors.email} />
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-semibold text-gray-900"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type="password"
                          autoComplete="new-password"
                          required
                          value={data.password}
                          onChange={(e) => setData('password', e.target.value)}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField('')}
                          className={`w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200 ${
                            form.errors.password
                              ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                              : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                          }`}
                          placeholder="Create a secure password"
                        />
                      </div>
                      {form.errors.password && (
                        <Message severity="error" text={form.errors.password} />
                      )}

                      {/* Password Requirements */}
                      <div className="mt-4 space-y-2">
                        <div
                          className={`flex items-center text-sm transition-colors ${
                            passwordIsValid ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          <div
                            className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full ${
                              passwordIsValid ? 'bg-green-100' : 'bg-gray-100'
                            }`}
                          >
                            <svg
                              className="h-3 w-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="font-medium">
                            At least 8 characters
                          </span>
                        </div>
                        <div
                          className={`flex items-center text-sm transition-colors ${
                            containsSpecialChars
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}
                        >
                          <div
                            className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full ${
                              containsSpecialChars
                                ? 'bg-green-100'
                                : 'bg-gray-100'
                            }`}
                          >
                            <svg
                              className="h-3 w-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="font-medium">
                            At least 1 special character
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={disableSignupButton}
                        className={`flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                          disableSignupButton
                            ? 'bg-gray-300'
                            : 'bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
                        }`}
                      >
                        {form.processing ? (
                          <div className="flex items-center space-x-2">
                            <svg
                              className="h-5 w-5 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Creating account...</span>
                          </div>
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    </div>

                    {/* Terms - cleaner positioning */}
                    <div className="pt-4 text-center">
                      <p className="text-sm text-gray-600">
                        By creating an account, you agree to our{' '}
                        <a
                          href="/terms"
                          className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-500"
                        >
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                          href="/privacy-policy"
                          className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-500"
                        >
                          Privacy Policy
                        </a>
                      </p>
                    </div>
                  </form>
                </div>
              )}

              {/* Divider - Only show when expanded options is active */}
              {showExpandedOptions && (
                <div className="my-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 font-medium text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* OAuth Buttons - Only show when expanded options is active */}
              {showExpandedOptions && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Google Button - Half width */}
                  <a
                    href="/auth/google/redirect"
                    className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base font-medium text-gray-700 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-gray-300 hover:bg-gray-100 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Google</span>
                  </a>

                  {/* GitHub Button - Half width */}
                  <a
                    href="/auth/github/redirect"
                    className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base font-medium text-gray-700 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-gray-300 hover:bg-gray-100 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>GitHub</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toast ref={toast} />
    </>
  )
}
