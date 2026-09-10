import Spinner from '@/components/ui/spinner/Spinner.jsx'
import Notifications from '@/components/Notifications.jsx'
import { useState, useRef } from 'react'
import { Head, useForm, router, Link } from '@inertiajs/react'
import InputOtp from '@/components/ui/input/Input.jsx'
import Message from '@/components/ui/alert/Alert.jsx'

export default function VerifyTwoFactor({ twoFactorMethods, userEmail }) {
  const [activeMethod, setActiveMethod] = useState(
    twoFactorMethods.defaultMethod
  )
  const [emailSent, setEmailSent] = useState(false)

  const { data, setData, post, processing, errors, reset } = useForm({
    code: '',
    method: activeMethod
  })

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
      <>
        <Head title="Two-Factor Authentication | Ascent React" />

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
                Two-Factor Authentication
              </h1>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Please verify your identity to complete login
              </p>
            </header>
          </div>

          <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
            <div className="relative">
              {/* Background blur effect */}
              <div className="hidden"></div>

              {/* Main card */}
              <div className="ascent-auth-panel">
                {/* Global errors */}
                {(errors.method || errors.code) && (
                  <div className="mb-6" role="alert">
                    {errors.method && (
                      <Message
                        role={'alert'}
                        className={[
                          'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                          'mb-3 w-full'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {errors.method}
                      </Message>
                    )}
                    {errors.code && (
                      <Message
                        role={'alert'}
                        className={[
                          'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                          'w-full'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {errors.code}
                      </Message>
                    )}
                  </div>
                )}

                <form onSubmit={handleVerifyCode} className="space-y-5">
                  {activeMethod === 'totp' && (
                    <div>
                      <label className="mb-4 block text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enter code from your authenticator app
                      </label>
                      <div className="flex justify-center">
                        <InputOtp
                          value={data.code}
                          maxLength={6}
                          autoComplete={'one-time-code'}
                          inputMode={'numeric'}
                          aria-label={'Verification code'}
                          onChange={(e) => setData('code', e.target.value)}
                          className={
                            'max-w-64 mx-auto text-center text-2xl tracking-[0.5em]'
                          }
                        />
                      </div>
                    </div>
                  )}

                  {activeMethod === 'email' && (
                    <div>
                      <label className="mb-4 block text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enter code sent to {userEmail}
                      </label>
                      <div className="flex justify-center">
                        <InputOtp
                          value={data.code}
                          maxLength={6}
                          autoComplete={'one-time-code'}
                          inputMode={'numeric'}
                          aria-label={'Verification code'}
                          onChange={(e) => setData('code', e.target.value)}
                          className={
                            'max-w-64 mx-auto text-center text-2xl tracking-[0.5em]'
                          }
                        />
                      </div>
                    </div>
                  )}

                  {activeMethod === 'backup' && (
                    <div>
                      <label className="mb-4 block text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enter a backup recovery code
                      </label>
                      <div className="flex justify-center">
                        <InputOtp
                          value={data.code}
                          maxLength={8}
                          autoComplete={'one-time-code'}
                          inputMode={'text'}
                          aria-label={'Verification code'}
                          onChange={(e) =>
                            setData('code', e.target.value.toUpperCase())
                          }
                          className={
                            'max-w-64 mx-auto text-center text-2xl tracking-[0.5em]'
                          }
                        />
                      </div>
                      <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                        Each backup code can only be used once
                      </p>
                    </div>
                  )}

                  {/* Submit button - always visible like login page */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={
                        processing ||
                        !data.code ||
                        (activeMethod === 'backup'
                          ? String(data.code).length !== 8
                          : String(data.code).length !== 6)
                      }
                      className={`flex w-full justify-center rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                        processing ||
                        !data.code ||
                        (activeMethod === 'backup'
                          ? String(data.code).length !== 8
                          : String(data.code).length !== 6)
                          ? 'bg-gray-300'
                          : 'bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600'
                      }`}
                    >
                      {processing ? (
                        <div className="flex items-center space-x-2">
                          <Spinner className="h-5 w-5" />
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        'Verify & Continue'
                      )}
                    </button>
                  </div>

                  {/* Method switching */}
                  <div className="space-y-3 text-center">
                    {/* Primary method alternatives */}
                    {activeMethod !== 'backup' && (
                      <>
                        {((activeMethod === 'totp' && twoFactorMethods.email) ||
                          (activeMethod === 'email' &&
                            twoFactorMethods.totp)) && (
                          <div>
                            {activeMethod === 'totp' &&
                              twoFactorMethods.email && (
                                <button
                                  type="button"
                                  onClick={() => handleSwitchMethod('email')}
                                  className="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600 dark:text-gray-400"
                                >
                                  Get the code via email instead
                                </button>
                              )}

                            {activeMethod === 'email' &&
                              twoFactorMethods.totp && (
                                <button
                                  type="button"
                                  onClick={() => handleSwitchMethod('totp')}
                                  className="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600 dark:text-gray-400"
                                >
                                  Use authenticator app instead
                                </button>
                              )}
                          </div>
                        )}

                        {/* Backup code option - always available */}
                        <div>
                          <button
                            type="button"
                            onClick={() => handleSwitchMethod('backup')}
                            className="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600 dark:text-gray-400"
                          >
                            Use backup code
                          </button>
                        </div>
                      </>
                    )}

                    {/* Back from backup code */}
                    {activeMethod === 'backup' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSwitchMethod(twoFactorMethods.defaultMethod)
                        }
                        className="text-sm font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-brand-600 dark:text-gray-400"
                      >
                        Use{' '}
                        {twoFactorMethods.defaultMethod === 'totp'
                          ? 'authenticator app'
                          : 'email code'}{' '}
                        instead
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </>
      <Notifications />
    </>
  )
}
