import { useState, useRef } from 'react'
import { Head, useForm, router, Link } from '@inertiajs/react'
import { InputOtp } from 'primereact/inputotp'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import { useFlashToast } from '@/hooks/useFlashToast'

export default function VerifyTwoFactor({ twoFactorMethods, userEmail }) {
  const [activeMethod, setActiveMethod] = useState(
    twoFactorMethods.defaultMethod
  )
  const [emailSent, setEmailSent] = useState(false)

  const { data, setData, post, processing, errors, reset } = useForm({
    code: '',
    method: activeMethod
  })

  const toast = useRef(null)
  useFlashToast(toast)

  function handleVerifyCode(e) {
    e.preventDefault()
    post('/verify-2fa', {
      onSuccess: () => {
        reset()
      },
      onError: (errors) => {
        console.error('2FA verification failed:', errors)
      }
    })
  }

  function handleSendEmail() {
    router.post(
      '/verify-2fa/send-email',
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          setEmailSent(true)
          setActiveMethod('email')
          setData('method', 'email')
        },
        onError: (errors) => {
          console.error('Failed to send email:', errors)
        }
      }
    )
  }

  function handleSwitchMethod(method) {
    setActiveMethod(method)
    setData({ method: method, code: '' })

    // Auto-send email when switching to email method
    if (method === 'email') {
      handleSendEmail()
    }
  }

  return (
    <>
      <Head title="Two-Factor Authentication | Ascent React" />

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
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Two-Factor Authentication
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Please verify your identity to complete login
            </p>
          </div>
        </div>

        <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="relative">
            {/* Background blur effect */}
            <div className="absolute inset-0 scale-105 rounded-2xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 blur-xl"></div>

            {/* Main card */}
            <div className="relative rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-2xl">
              {/* Global error */}
              {errors.method && (
                <section className="mb-6">
                  <Message
                    severity="error"
                    text={errors.method}
                    className="w-full"
                  />
                </section>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-5">
                {activeMethod === 'totp' && (
                  <div>
                    <label className="mb-4 block text-center text-sm font-medium text-gray-700">
                      Enter code from your authenticator app
                    </label>
                    <div className="flex justify-center">
                      <InputOtp
                        value={data.code}
                        onChange={(e) => setData('code', e.value)}
                        length={6}
                        integerOnly
                      />
                    </div>
                  </div>
                )}

                {activeMethod === 'email' && (
                  <div>
                    <label className="mb-4 block text-center text-sm font-medium text-gray-700">
                      Enter code sent to {userEmail}
                    </label>
                    <div className="flex justify-center">
                      <InputOtp
                        value={data.code}
                        onChange={(e) => setData('code', e.value)}
                        length={6}
                        integerOnly
                      />
                    </div>
                  </div>
                )}

                {errors.code && <Message severity="error" text={errors.code} />}

                {/* Submit button - always visible like login page */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={
                      processing || !data.code || String(data.code).length !== 6
                    }
                    className={`flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                      processing || !data.code || String(data.code).length !== 6
                        ? 'bg-gray-300'
                        : 'bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
                    }`}
                  >
                    {processing ? (
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
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>
                </div>

                {/* Method switching like login page */}
                {((activeMethod === 'totp' && twoFactorMethods.email) ||
                  (activeMethod === 'email' && twoFactorMethods.totp)) && (
                  <div className="text-center">
                    {activeMethod === 'totp' && twoFactorMethods.email && (
                      <button
                        type="button"
                        onClick={() => handleSwitchMethod('email')}
                        className="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600"
                      >
                        Get the code via email instead
                      </button>
                    )}

                    {activeMethod === 'email' && twoFactorMethods.totp && (
                      <button
                        type="button"
                        onClick={() => handleSwitchMethod('totp')}
                        className="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600"
                      >
                        Use authenticator app instead
                      </button>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <Toast ref={toast} />
    </>
  )
}
