import Check from '@/components/ui/icons/Check.jsx'
import Copy from '@/components/ui/icons/Copy.jsx'
import Spinner from '@/components/ui/spinner/Spinner.jsx'
import { useForm } from '@inertiajs/react'
import Dialog from '@/components/Modal.jsx'
import Button from '@/components/ui/button/Button.jsx'
import InputOtp from '@/components/ui/input/Input.jsx'
import Message from '@/components/ui/alert/Alert.jsx'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

export default function TotpSetupModal({ visible, onHide, setupData }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    token: ''
  })

  const { copied, copyToClipboard } = useCopyToClipboard()

  function handleVerifyTOTP(e) {
    e.preventDefault()
    post('/security/verify-totp-setup', {
      onSuccess: () => {
        reset()
        // Don't call onHide() - let the redirect happen naturally
        // The backup codes modal will show after page reload
      },
      onError: (errors) => {
        console.error('TOTP verification failed:', errors)
      }
    })
  }

  function handleClose() {
    reset()
    onHide()
  }

  // Don't render modal if no setup data
  if (!setupData) {
    return null
  }

  return (
    <Dialog
      className="max-w-2xl"
      open={visible}
      title="Authenticator setup"
      onClose={handleClose}
      dismissible={!processing}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Set up Authenticator App
          </h2>
          <p className="text-sm text-gray-600">
            Each time you log in, in addition to your password, you'll use an
            authenticator app to generate a one-time code.
          </p>
        </div>

        {/* Error Message */}
        {errors.twoFactorSetup && (
          <Message
            role={'alert'}
            className={
              'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
            }
          >
            {errors.twoFactorSetup}
          </Message>
        )}

        {/* Step 1: Scan QR Code */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
              1
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Scan QR code
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Scan the QR code below or manually enter the secret key into your
            authenticator app.
          </p>

          <div className="flex flex-col space-y-6 py-4 sm:flex-row sm:items-start sm:space-x-8 sm:space-y-0">
            {/* QR Code */}
            <div className="flex justify-center sm:justify-start">
              <img
                src={setupData.qrCode}
                alt="TOTP QR Code"
                className="h-32 w-32 rounded-lg border-2 border-white shadow-sm"
              />
            </div>

            {/* Manual Entry */}
            <div className="flex-1 space-y-3 sm:min-w-0">
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-900">
                  Can't scan QR code?
                </h4>
                <p className="mb-3 text-sm text-gray-600">
                  Enter this secret instead:
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="min-w-0 flex-1 break-all rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900">
                  {setupData.manualEntryKey}
                </div>
                <Button
                  onClick={() => copyToClipboard(setupData.manualEntryKey)}
                  aria-label={copied ? 'Copied!' : 'Copy code'}
                  title={copied ? 'Copied!' : 'Copy code'}
                  className={[
                    'min-h-10 border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                    copied
                      ? 'text-success-600 hover:text-success-700'
                      : 'text-gray-500 hover:text-gray-700'
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Enter Verification Code */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
              2
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Get verification code
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Enter the 6-digit code you see in your authenticator app.
          </p>

          <form onSubmit={handleVerifyTOTP} className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Enter verification code
              </label>
              <div className="flex justify-start">
                <InputOtp
                  value={data.token}
                  maxLength={6}
                  autoComplete={'one-time-code'}
                  inputMode={'numeric'}
                  aria-label={'Verification code'}
                  onChange={(e) => setData('token', e.target.value)}
                  className={
                    'max-w-64 mx-auto text-center text-2xl tracking-[0.5em]'
                  }
                />
              </div>
              {errors.token && (
                <Message
                  role={'alert'}
                  className={[
                    'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                    'mt-3'
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {errors.token}
                </Message>
              )}
            </div>

            <div className="flex flex-col justify-end space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <Button
                type="button"
                onClick={handleClose}
                disabled={processing}
                className={[
                  'min-h-10 min-h-8 border border-gray-300 bg-white px-2.5 px-3 py-1.5 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800',
                  'w-full sm:w-auto'
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={!data.token || data.token.length !== 6 || processing}
                aria-busy={processing}
                className={[
                  'min-h-10 min-h-8 border border-brand bg-brand px-2.5 px-3 py-1.5 py-2 text-base text-sm text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700',
                  'w-full sm:w-auto'
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {processing && <Spinner className="h-4 w-4" />}
                {'Verify & Enable'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
