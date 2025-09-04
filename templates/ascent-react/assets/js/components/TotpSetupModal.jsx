import { useForm } from '@inertiajs/react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputOtp } from 'primereact/inputotp'
import { Message } from 'primereact/message'

export default function TotpSetupModal({ visible, onHide, setupData }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    token: ''
  })

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

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
  }

  // Don't render modal if no setup data
  if (!setupData) {
    return null
  }

  return (
    <Dialog
      visible={visible}
      onHide={handleClose}
      header={null}
      modal
      closable={!processing}
      className="mx-4 w-full max-w-2xl sm:mx-0"
      contentStyle={{ paddingRight: '2rem', paddingLeft: '2rem' }}
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
          <Message severity="error" text={errors.twoFactorSetup} />
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
                  icon="pi pi-copy"
                  text
                  onClick={() => copyToClipboard(setupData.manualEntryKey)}
                  tooltip="Copy code"
                />
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
                  onChange={(e) => setData('token', e.value)}
                  length={6}
                  integerOnly
                />
              </div>
              {errors.token && (
                <Message
                  severity="error"
                  text={errors.token}
                  className="mt-3"
                />
              )}
            </div>

            <div className="flex flex-col justify-end space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <Button
                type="button"
                label="Cancel"
                severity="secondary"
                onClick={handleClose}
                size="small"
                disabled={processing}
                className="w-full sm:w-auto"
              />
              <Button
                type="submit"
                label="Verify & Enable"
                size="small"
                loading={processing}
                disabled={!data.token || data.token.length !== 6}
                className="w-full sm:w-auto"
              />
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
