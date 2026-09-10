import Check from '@/components/ui/icons/Check.jsx'
import Copy from '@/components/ui/icons/Copy.jsx'
import InfoCircle from '@/components/ui/icons/InfoCircle.jsx'
import Key from '@/components/ui/icons/Key.jsx'
import { useEffect } from 'react'
import Dialog from '@/components/Modal.jsx'
import Button from '@/components/ui/button/Button.jsx'
import Message from '@/components/ui/alert/Alert.jsx'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

export default function BackupCodesModal({
  visible,
  onHide,
  backupCodes,
  context = 'setup'
}) {
  const { copied, copyToClipboard, reset } = useCopyToClipboard()

  // Reset copied state when modal opens/closes
  useEffect(() => {
    if (visible) {
      reset()
    }
  }, [visible, reset])

  function handleSavedCodes() {
    onHide()
  }

  // Don't render modal if no backup codes
  if (!backupCodes || !backupCodes.length) {
    return null
  }

  return (
    <Dialog
      className="max-w-xl"
      open={visible}
      title={'Backup Codes'}
      onClose={handleSavedCodes}
      dismissible={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-100">
            <Key
              className={'h-[1em] w-[1em] shrink-0 text-xl text-success-600'}
            ></Key>
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
          role={'status'}
          className={[
            'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
            'w-full'
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {context === 'setup'
            ? "Please save these codes now—they're shown only once."
            : "Important: These new codes replace all previous backup codes. Save them now—they're shown only once."}
        </Message>

        {/* Backup Codes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Your backup codes
            </h3>
            <Button
              onClick={() => copyToClipboard(backupCodes.join('\n'))}
              aria-label={copied ? 'Copied!' : 'Copy all codes'}
              title={copied ? 'Copied!' : 'Copy all codes'}
              className={[
                'min-h-10 min-h-8 border border-transparent bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
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
            <InfoCircle
              className={'h-[1em] w-[1em] shrink-0 text-sm text-indigo-600'}
            ></InfoCircle>
            <p className="text-sm text-indigo-800">
              <strong>Pro tip:</strong> Save these in your password manager
              alongside your login credentials
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSavedCodes}
            className={
              'min-h-10 min-h-8 border border-brand bg-brand px-2.5 px-3 py-1.5 py-2 text-base text-sm text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700'
            }
          >
            {"I've saved my backup codes"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
