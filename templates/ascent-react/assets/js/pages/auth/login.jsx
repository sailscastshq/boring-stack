import Input from '@/components/ui/input/Input.jsx'
import ChevronLeft from '@/components/ui/icons/ChevronLeft.jsx'
import Fingerprint from '@/components/ui/icons/Fingerprint.jsx'
import Envelope from '@/components/ui/icons/Envelope.jsx'
import Spinner from '@/components/ui/spinner/Spinner.jsx'
import Notifications from '@/components/Notifications.jsx'
import { Link, Head, useForm } from '@inertiajs/react'
import { useState, useMemo, useEffect, useRef } from 'react'

import Message from '@/components/ui/alert/Alert.jsx'

export default function Login({ passkeyChallenge }) {
  const { data, setData, ...form } = useForm({
    email: '',
    password: '',
    rememberMe: false
  })

  const {
    data: passkeyData,
    setData: setPasskeyData,
    post: postPasskeySignin,
    processing: isSigningInWithPasskey,
    ...passkeyForm
  } = useForm({
    email: ''
  })
  // Form for verifying passkey assertion
  const {
    data: verifyPasskeyData,
    setData: setVerifyPasskeyData,
    post: postVerifyPasskey,
    processing: isVerifyingPasskey,
    ...verifyPasskeyForm
  } = useForm({
    assertion: null,
    email: ''
  })

  const [focusedField, setFocusedField] = useState('')
  const [showExpandedOptions, setShowExpandedOptions] = useState(false)
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false)

  useEffect(() => {
    if (passkeyChallenge) {
      handleWebAuthnChallenge(passkeyChallenge)
    }
  }, [passkeyChallenge])

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

  const toggleToPasswordMode = () => {
    setShowExpandedOptions(true)
    try {
      if (typeof window !== 'undefined' && window.location && window.history) {
        const url = new URL(window.location)
        url.searchParams.set('mode', 'password')
        window.history.pushState({}, '', url)
      }
    } catch (error) {
      // Silently handle URL update error - non-critical
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
      // Silently handle URL update error - non-critical
    }
  }

  const disableLoginButton = useMemo(() => {
    if (!data.email) return true
    if (!data.password && showExpandedOptions) return true
    if (form.processing) return true
    return false
  }, [data.email, data.password, form.processing, showExpandedOptions])

  const disableMagicLinkButton = useMemo(() => {
    if (!data.email) return true
    if (isSendingMagicLink) return true
    return false
  }, [data.email, isSendingMagicLink])

  function submit(e) {
    e.preventDefault()
    form.post('/login')
  }

  function sendMagicLink(e) {
    e.preventDefault()
    if (!data.email) return

    setIsSendingMagicLink(true)

    form.post('/magic-link', {
      data: {
        email: data.email,
        fullName: data.fullName || undefined
      },
      onSuccess: () => {
        setIsSendingMagicLink(false)
      },
      onError: (errors) => {
        setIsSendingMagicLink(false)
      }
    })
  }

  function handlePasskeySignin(e) {
    e.preventDefault()
    if (!data.email) return
    passkeyForm.transform(() => ({ email: data.email }))
    postPasskeySignin('/challenge-passkey')
  }

  async function handleWebAuthnChallenge(challengeData) {
    try {
      const { startAuthentication } = await import('@simplewebauthn/browser')
      const assertion = await startAuthentication(challengeData.options)
      const email = challengeData.email

      verifyPasskeyForm.transform(() => ({
        assertion,
        email
      }))

      postVerifyPasskey('/verify-passkey')
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        // User cancelled the passkey prompt - no action needed
      } else {
        // WebAuthn errors are useful for debugging
        console.error('WebAuthn error:', error)
      }
    }
  }

  return (
    <>
      <>
        <Head title="Sign In | Ascent"></Head>
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
                Welcome back
              </h1>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Sign in to your Ascent account
              </p>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Or{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-300"
                >
                  create a new account
                </Link>
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
                {(form.errors.login ||
                  form.errors.magicLink ||
                  verifyPasskeyForm.errors.passkey) && (
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
                      {form.errors.login ||
                        form.errors.magicLink ||
                        verifyPasskeyForm.errors.passkey}
                    </Message>
                  </div>
                )}

                {!showExpandedOptions ? (
                  // Magic Link Primary View
                  <form onSubmit={sendMagicLink} className="space-y-5">
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
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField('')}
                          className={`w-full rounded-lg border px-4 py-4 text-base font-medium transition-all duration-200 ${
                            form.errors.email
                              ? 'border-red-300 bg-red-50 ring-2 ring-red-100 dark:border-red-900 dark:bg-red-950/40'
                              : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950'
                          }`}
                          placeholder="Enter your email address"
                        />
                      </div>
                      {form.errors.email && (
                        <Message
                          role={'alert'}
                          className={
                            'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
                          }
                        >
                          {form.errors.email}
                        </Message>
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
                            : 'bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600'
                        }`}
                      >
                        {isSendingMagicLink ? (
                          <div className="flex items-center space-x-2">
                            <Spinner className="h-5 w-5" />
                            <span>Sending link...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Envelope className="mr-2 h-5 w-5" />
                            <span>Send Magic Link</span>
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Other Sign-in Options */}
                    <div className="flex flex-col items-center space-y-2 text-center">
                      {/* Passkey Sign-in - appears below magic link button */}
                      {data.email && (
                        <button
                          type="button"
                          onClick={handlePasskeySignin}
                          disabled={isSigningInWithPasskey}
                          className="inline-flex items-center text-sm font-medium text-brand-600 transition-colors hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-300"
                        >
                          {isSigningInWithPasskey ? (
                            'Signing in...'
                          ) : (
                            <>
                              <Fingerprint className="mr-1 h-4 w-4" />
                              Use passkey
                            </>
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={toggleToPasswordMode}
                        className="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600 dark:text-gray-400"
                      >
                        Other sign-in options
                      </button>
                    </div>
                  </form>
                ) : (
                  // Expanded Traditional Login View
                  <div className="space-y-5">
                    {/* Back to Magic Link */}
                    <div className="mb-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={toggleToMagicMode}
                        className="flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-brand-600 dark:text-gray-400"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to magic link
                      </button>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                      {/* Email */}
                      <div>
                        <label
                          htmlFor="email-expanded"
                          className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <Input
                            id="email-expanded"
                            type="email"
                            autoComplete="email"
                            required
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField('')}
                            className={`w-full rounded-lg border px-4 py-4 text-base font-medium transition-all duration-200 ${
                              form.errors.email
                                ? 'border-red-300 bg-red-50 ring-2 ring-red-100 dark:border-red-900 dark:bg-red-950/40'
                                : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950'
                            }`}
                            placeholder="Enter your email address"
                          />
                        </div>
                        {form.errors.email && (
                          <Message
                            role={'alert'}
                            className={
                              'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
                            }
                          >
                            {form.errors.email}
                          </Message>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <label
                          htmlFor="password"
                          className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={data.password}
                            onChange={(e) =>
                              setData('password', e.target.value)
                            }
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField('')}
                            className={`w-full rounded-lg border px-4 py-4 text-base font-medium transition-all duration-200 ${
                              form.errors.password
                                ? 'border-red-300 bg-red-50 ring-2 ring-red-100 dark:border-red-900 dark:bg-red-950/40'
                                : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950'
                            }`}
                            placeholder="Enter your password"
                          />
                        </div>
                        {form.errors.password && (
                          <Message
                            role={'alert'}
                            className={
                              'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
                            }
                          >
                            {form.errors.password}
                          </Message>
                        )}
                      </div>

                      {/* Remember me and Forgot password */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            id="rememberMe"
                            type="checkbox"
                            checked={data.rememberMe}
                            onChange={(e) =>
                              setData('rememberMe', !data.rememberMe)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:text-brand-300"
                          />
                          <label
                            htmlFor="rememberMe"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Remember me
                          </label>
                        </div>

                        <div>
                          <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-300"
                          >
                            Forgot password?
                          </Link>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={disableLoginButton}
                          className={`flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                            disableLoginButton
                              ? 'bg-gray-300'
                              : 'bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600'
                          }`}
                        >
                          {form.processing ? (
                            <div className="flex items-center space-x-2">
                              <Spinner className="h-5 w-5" />
                              <span>Signing in...</span>
                            </div>
                          ) : (
                            'Sign In'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Divider - Only show when expanded options is active */}
                {showExpandedOptions && (
                  <div className="my-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
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
                      className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base font-medium text-gray-700 shadow-none transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
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
                      className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-base font-medium text-gray-700 shadow-none transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
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
      </>
      <Notifications />
    </>
  )
}
