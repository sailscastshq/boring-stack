import { useState, useEffect } from 'react'
import { useForm, router, usePage } from '@inertiajs/react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { confirmDialog } from 'primereact/confirmdialog'
import { Divider } from 'primereact/divider'

export default function PasskeyManageModal({ visible, onHide, passkeys = [] }) {
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
    confirmDialog({
      message: `Are you sure you want to remove "${
        passkey.name || 'this passkey'
      }"? This action cannot be undone and you won't be able to use this passkey to sign in.`,
      header: 'Remove Passkey',
      icon: 'pi pi-exclamation-triangle',
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

  function getDeviceIcon(transports) {
    if (!transports || transports.length === 0) return 'pi pi-mobile'

    if (transports.includes('usb')) return 'pi pi-usb'
    if (transports.includes('nfc')) return 'pi pi-wifi'
    if (transports.includes('ble')) return 'pi pi-bluetooth'
    if (transports.includes('internal')) return 'pi pi-mobile'
    if (transports.includes('hybrid')) return 'pi pi-mobile'

    return 'pi pi-key'
  }

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Manage Passkeys"
      modal
      className="mx-4 w-full max-w-2xl sm:mx-0"
    >
      <div className="space-y-4">
        {/* Supporting text */}
        <p className="text-sm text-gray-500">
          Rename, remove, or add new passkeys for your account
        </p>

        {/* Passkeys List */}
        {passkeys.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <i className="pi pi-key text-xl text-gray-400"></i>
            </div>
            <h3 className="mb-2 text-base font-medium text-gray-900">
              No passkeys yet
            </h3>
            <p className="mx-auto max-w-sm text-sm text-gray-500">
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                        <i
                          className={`${getDeviceIcon(
                            passkey.transports
                          )} text-brand-600`}
                        ></i>
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
                              className="flex-1"
                              placeholder="Enter passkey name"
                              autoFocus
                            />
                            <Button
                              type="submit"
                              icon="pi pi-check"
                              severity="success"
                              text
                              rounded
                              loading={renamingPasskey}
                              disabled={
                                !renameData.name.trim() || renamingPasskey
                              }
                              tooltip="Save"
                            />
                            <Button
                              type="button"
                              icon="pi pi-times"
                              severity="secondary"
                              text
                              rounded
                              onClick={handleCancelEdit}
                              disabled={renamingPasskey}
                              tooltip="Cancel"
                            />
                          </form>
                          {renameErrors.name && (
                            <Message
                              severity="error"
                              text={renameErrors.name}
                              className="mt-1"
                            />
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="truncate text-sm font-medium text-gray-900">
                            {passkey.name || `Passkey ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Added {formatDate(passkey.createdAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingPasskeyId !== passkey.credentialID && (
                    <div className="flex items-center space-x-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      <Button
                        icon="pi pi-pencil"
                        severity="secondary"
                        text
                        rounded
                        size="small"
                        onClick={() => handleEditClick(passkey)}
                        tooltip="Rename"
                        className="text-gray-400 hover:text-gray-600"
                      />
                      <Button
                        icon="pi pi-trash"
                        severity="danger"
                        text
                        rounded
                        size="small"
                        onClick={() => confirmDeletePasskey(passkey)}
                        tooltip="Delete"
                        className="text-gray-400 hover:text-red-600"
                      />
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
          label="New Passkey"
          icon="pi pi-plus"
          onClick={handleAddNewPasskey}
          loading={settingUpPasskey}
          disabled={settingUpPasskey}
          outlined
          size="small"
        />
        <Button
          label="Done"
          onClick={onHide}
          className="bg-brand-600 hover:bg-brand-700"
          size="small"
        />
      </div>
    </Dialog>
  )
}
