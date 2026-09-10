import Spinner from '@/components/ui/spinner/Spinner.jsx'
import InfoCircle from '@/components/ui/icons/InfoCircle.jsx'
import Envelope from '@/components/ui/icons/Envelope.jsx'
import { useForm } from '@inertiajs/react'
import Dialog from '@/components/Modal.jsx'
import Button from '@/components/ui/button/Button.jsx'
import InputOtp from '@/components/ui/input/Input.jsx'
import Message from '@/components/ui/alert/Alert.jsx'

export default function EmailTwoFactorSetupModal({
  visible,
  onHide,
  userEmail
}) {
  const { data, setData, post, processing, errors, reset } = useForm({
    code: ''
  })

  function handleVerifyCode(e) {
    e.preventDefault()
    post('/security/verify-email-2fa-setup', {
      onSuccess: () => {
        reset()
        // Allow reset to take effect before closing modal
        setTimeout(() => {
          onHide()
        }, 0)
      },
      onError: (errors) => {
        console.error('Email 2FA verification failed:', errors)
      }
    })
  }

  function handleClose() {
    reset()
    onHide()
  }

  // Don't render modal if no user email
  if (!userEmail) {
    return null
  }

  return (
    <Dialog
      className="max-w-lg"
      open={visible}
      title={'Email Two Factor Setup'}
      onClose={handleClose}
      dismissible={!processing}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Envelope
              className={'h-[1em] w-[1em] shrink-0 text-2xl text-blue-600'}
            ></Envelope>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Verify Your Email
          </h2>
          <p className="text-sm text-gray-600">
            We've sent a 6-digit verification code to{' '}
            <strong>{userEmail}</strong>. Enter it below to enable email
            two-factor authentication.
          </p>
        </div>

        {/* Error Message */}
        {errors.code && (
          <Message
            role={'alert'}
            className={
              'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
            }
          >
            {typeof errors.code === 'string'
              ? errors.code
              : 'Invalid verification code'}
          </Message>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Enter verification code
            </label>
            <div className="flex justify-start">
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

          {/* Help Text */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InfoCircle
                  className={'h-[1em] w-[1em] shrink-0 text-gray-400'}
                ></InfoCircle>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  The verification code expires in 10 minutes. If you don't see
                  the email, check your spam folder.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
            <Button
              type="button"
              onClick={handleClose}
              disabled={processing}
              className={[
                'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                'w-full sm:w-auto'
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={!data.code || data.code.length !== 6 || processing}
              aria-busy={processing}
              className={[
                'min-h-10 min-h-8 border border-brand bg-brand px-2.5 px-3 py-1.5 py-2 text-base text-sm text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700',
                'w-full sm:w-auto'
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {processing && <Spinner className="h-4 w-4" />}
              {'Verify & Enable Email 2FA'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
