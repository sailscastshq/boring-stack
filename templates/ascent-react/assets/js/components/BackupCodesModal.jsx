import { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'

export default function BackupCodesModal({
  visible,
  onHide,
  backupCodes,
  context = 'setup'
}) {
  const [copied, setCopied] = useState(false)

  function copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true)
        // Reset after 2 seconds
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        console.error('Failed to copy:', err)
      })
  }

  // Reset copied state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setCopied(false)
    }
  }, [visible])

  function handleSavedCodes() {
    onHide()
  }

  // Don't render modal if no backup codes
  if (!backupCodes || !backupCodes.length) {
    return null
  }

  return (
    <Dialog
      visible={visible}
      onHide={handleSavedCodes}
      header={null}
      modal
      closable={false}
      className="mx-4 w-full max-w-xl sm:mx-0"
      contentStyle={{ paddingRight: '2rem', paddingLeft: '2rem' }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-100">
            <i className="pi pi-key text-xl text-success-600"></i>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            {context === 'setup'
              ? 'Authenticator App Setup Complete!'
              : 'New Backup Codes Generated'}
          </h2>
          <p className="text-sm text-gray-600">
            {context === 'setup'
              ? 'Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.'
              : 'Your new backup codes are ready. Save them in a secure place - they replace any previous backup codes.'}
          </p>
        </div>

        {/* Important Notice */}
        <Message
          severity="warn"
          text={
            context === 'setup'
              ? "Please save these codes now—they're shown only once."
              : "Important: These new codes replace all previous backup codes. Save them now—they're shown only once."
          }
          className="w-full"
        />

        {/* Backup Codes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Your backup codes
            </h3>
            <Button
              icon={copied ? 'pi pi-check' : 'pi pi-copy'}
              text
              size="small"
              onClick={() => copyToClipboard(backupCodes.join('\n'))}
              tooltip={copied ? 'Copied!' : 'Copy all codes'}
              tooltipOptions={{ position: 'left' }}
              className={
                copied
                  ? 'text-success-600 hover:text-success-700'
                  : 'text-gray-500 hover:text-gray-700'
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {backupCodes.map((code, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-sm font-medium text-gray-900 shadow-sm transition-shadow duration-150"
              >
                {code}
              </div>
            ))}
          </div>
        </div>

        {/* Storage Hint */}
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex items-center space-x-2">
            <i className="pi pi-info-circle text-sm text-indigo-600"></i>
            <p className="text-sm text-indigo-800">
              <strong>Pro tip:</strong> Save these in your password manager
              alongside your login credentials
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            label="I've saved my backup codes"
            onClick={handleSavedCodes}
            size="small"
          />
        </div>
      </div>
    </Dialog>
  )
}
