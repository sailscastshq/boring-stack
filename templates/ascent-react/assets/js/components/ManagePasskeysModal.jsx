import Spinner from '@/components/ui/spinner/Spinner.jsx'
import Plus from '@/components/ui/icons/Plus.jsx'
import Trash from '@/components/ui/icons/Trash.jsx'
import Edit from '@/components/ui/icons/Edit.jsx'
import X from '@/components/ui/icons/X.jsx'
import Check from '@/components/ui/icons/Check.jsx'
import Key from '@/components/ui/icons/Key.jsx'
import { useState, useEffect } from 'react'
import { useForm, router, usePage } from '@inertiajs/react'
import Dialog from '@/components/Modal.jsx'
import Button from '@/components/ui/button/Button.jsx'
import InputText from '@/components/ui/input/Input.jsx'
import Message from '@/components/ui/alert/Alert.jsx'
import { useConfirmation } from '@/hooks/useConfirmation'
import ConfirmationDialog from '@/components/ConfirmationDialog.jsx'
import Divider from '@/components/ui/separator/Separator.jsx'

export default function ManagePasskeysModal({ visible, onHide, passkeys }) {
  const confirmation = useConfirmation()

  const [editingPasskeyId, setEditingPasskeyId] = useState(null)

  const {
    data: renameData,
    setData: setRenameData,
    patch: updatePasskeyName,
    processing: renamingPasskey,
    errors: renameErrors,
    reset: resetRename
  } = useForm({
    name: ''
  })

  const { post: setupNewPasskey, processing: settingUpPasskey } = useForm({})

  // Reset editing state when modal closes or opens
  useEffect(() => {
    if (!visible) {
      setEditingPasskeyId(null)
      resetRename()
    }
  }, [visible, resetRename])

  function handleEditClick(passkey) {
    setEditingPasskeyId(passkey.credentialID)
    setRenameData('name', passkey.name || '')
  }

  function handleCancelEdit() {
    setEditingPasskeyId(null)
    resetRename()
  }

  function handleRename(e) {
    e.preventDefault()
    console.log(editingPasskeyId)
    const passkey = passkeys.find((p) => p.credentialID === editingPasskeyId)
    if (!passkey) return
    updatePasskeyName(`/security/rename-passkey/${passkey.credentialID}`, {
      preserveScroll: true,
      onSuccess: () => {
        setEditingPasskeyId(null)
        resetRename()
      },
      onError: (errors) => {
        console.error('Passkey rename failed:', errors)
      }
    })
  }

  function confirmDeletePasskey(passkey) {
    confirmation.request({
      message: `Are you sure you want to remove "${
        passkey.name || 'this passkey'
      }"? This action cannot be undone and you won't be able to use this passkey to sign in.`,
      header: 'Remove Passkey',
      acceptClassName: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
      accept: () => {
        router.delete(`/security/delete-passkey/${passkey.credentialID}`, {
          preserveScroll: true,
          onError: (errors) => {
            console.error('Passkey deletion failed:', errors)
          }
        })
      }
    })
  }

  function handleAddNewPasskey() {
    setupNewPasskey('/security/setup-passkey', {
      onError: (errors) => {
        console.error('New passkey setup failed:', errors)
      }
    })
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <Dialog
        className="max-w-2xl"
        open={visible}
        title={'Manage Passkeys'}
        onClose={onHide}
      >
        <div className="space-y-4">
          {/* Supporting text */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rename, remove, or add new passkeys for your account
          </p>

          {/* Passkeys List */}
          {passkeys.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Key
                  className={'h-[1em] w-[1em] shrink-0 text-xl text-gray-400'}
                ></Key>
              </div>
              <h3 className="mb-2 text-base font-medium text-gray-900 dark:text-gray-100">
                No passkeys yet
              </h3>
              <p className="mx-auto max-w-sm text-sm text-gray-500 dark:text-gray-400">
                Add your first passkey to enable secure, passwordless
                authentication.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {passkeys.map((passkey, index) => (
                <div key={passkey.credentialID}>
                  <div className="group flex items-center justify-between px-3 py-4">
                    <div className="flex min-w-0 flex-1 items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
                          <Key className="h-5 w-5 text-brand-600 dark:text-brand-300" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        {editingPasskeyId === passkey.credentialID ? (
                          <div className="space-y-2">
                            <form
                              onSubmit={handleRename}
                              className="flex items-center space-x-2"
                            >
                              <InputText
                                value={renameData.name}
                                onChange={(e) =>
                                  setRenameData('name', e.target.value)
                                }
                                placeholder="Enter passkey name"
                                autoFocus
                                className={[
                                  'min-h-12 py-3 focus-visible:border-brand focus-visible:outline-brand dark:focus-visible:border-brand dark:focus-visible:outline-brand',
                                  'flex-1'
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                              />
                              <Button
                                type="submit"
                                disabled={
                                  !renameData.name.trim() ||
                                  renamingPasskey ||
                                  renamingPasskey
                                }
                                aria-busy={renamingPasskey}
                                aria-label={'Save'}
                                title={'Save'}
                                className={
                                  'min-h-10 rounded-full border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                                }
                              >
                                {renamingPasskey && (
                                  <Spinner className="h-4 w-4" />
                                )}
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={renamingPasskey}
                                aria-label={'Cancel'}
                                title={'Cancel'}
                                className={
                                  'min-h-10 rounded-full border border-transparent bg-transparent px-3 py-2 text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </form>
                            {renameErrors.name && (
                              <Message
                                role={'alert'}
                                className={[
                                  'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                                  'mt-1'
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                              >
                                {renameErrors.name}
                              </Message>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                              {passkey.name || `Passkey ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Added {formatDate(passkey.createdAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingPasskeyId !== passkey.credentialID && (
                      <div className="flex items-center space-x-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <Button
                          onClick={() => handleEditClick(passkey)}
                          aria-label={'Rename'}
                          title={'Rename'}
                          className={[
                            'min-h-10 min-h-8 rounded-full border border-transparent bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                            'text-gray-400 hover:text-gray-600'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => confirmDeletePasskey(passkey)}
                          aria-label={'Delete'}
                          title={'Delete'}
                          className={[
                            'min-h-10 min-h-8 rounded-full border border-transparent bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950',
                            'text-gray-400 hover:text-red-600'
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {index < passkeys.length - 1 && (
                    <Divider
                      key={`divider-${passkey.credentialID}`}
                      className="my-0"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleAddNewPasskey}
            disabled={settingUpPasskey || settingUpPasskey}
            aria-busy={settingUpPasskey}
            className={
              'min-h-10 min-h-8 border border-brand-200 bg-transparent px-2.5 px-3 py-1.5 py-2 text-sm text-brand hover:bg-brand-50 dark:border-brand-700 dark:bg-transparent dark:text-brand-400 dark:hover:bg-brand-950'
            }
          >
            {settingUpPasskey && <Spinner className="h-4 w-4" />}
            <Plus className="h-4 w-4" />
            {'New Passkey'}
          </Button>
          <Button
            onClick={onHide}
            className={[
              'min-h-10 min-h-8 border border-brand bg-brand px-2.5 px-3 py-1.5 py-2 text-base text-sm text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand dark:text-white dark:hover:bg-brand-600 dark:active:bg-brand-700',
              'bg-brand-600 hover:bg-brand-700'
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {'Done'}
          </Button>
        </div>
      </Dialog>
      <ConfirmationDialog state={confirmation} />
    </>
  )
}
