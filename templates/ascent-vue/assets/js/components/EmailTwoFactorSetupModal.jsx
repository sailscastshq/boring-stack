import { useForm } from '@inertiajs/react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputOtp } from 'primereact/inputotp'
import { Message } from 'primereact/message'

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
      visible={visible}
      onHide={handleClose}
      header={null}
      modal
      closable={!processing}
      className="mx-4 w-full max-w-lg sm:mx-0"
      contentStyle={{ paddingRight: '2rem', paddingLeft: '2rem' }}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <i className="pi pi-envelope text-2xl text-blue-600"></i>
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
            severity="error"
            text={
              typeof errors.code === 'string'
                ? errors.code
                : 'Invalid verification code'
            }
          />
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
                onChange={(e) => setData('code', e.value)}
                length={6}
                integerOnly
                mask
              />
            </div>
          </div>

          {/* Help Text */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="pi pi-info-circle text-gray-400"></i>
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
              label="Cancel"
              severity="secondary"
              outlined
              onClick={handleClose}
              size="small"
              disabled={processing}
              className="w-full sm:w-auto"
            />
            <Button
              type="submit"
              label="Verify & Enable Email 2FA"
              size="small"
              loading={processing}
              disabled={!data.code || data.code.length !== 6}
              className="w-full sm:w-auto"
            />
          </div>
        </form>
      </div>
    </Dialog>
  )
}
