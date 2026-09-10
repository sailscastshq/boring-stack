import Modal from '@/components/Modal.jsx'
import Button from '@/components/ui/button/Button.jsx'
export default function ConfirmationDialog({ state }) {
  return (
    <Modal
      open={Boolean(state.pending)}
      title={state.pending?.header || 'Confirm action'}
      onClose={state.cancel}
    >
      <p className="text-gray-600 dark:text-gray-300">
        {state.pending?.message}
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
          autoFocus
          onClick={state.cancel}
        >
          {state.pending?.rejectLabel || 'Cancel'}
        </Button>
        <Button
          className={
            state.pending?.acceptClassName ||
            'bg-brand text-white hover:bg-brand-600 dark:bg-brand dark:text-white dark:hover:bg-brand-600'
          }
          onClick={state.accept}
        >
          {state.pending?.acceptLabel || 'Confirm'}
        </Button>
      </div>
    </Modal>
  )
}
