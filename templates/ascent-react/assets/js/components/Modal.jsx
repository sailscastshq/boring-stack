import { twMerge } from 'tailwind-merge'
import { useId } from 'react'
import Dialog from '@/components/ui/dialog/Dialog.jsx'
import Button from '@/components/ui/button/Button.jsx'
import X from '@/components/ui/icons/X.jsx'
export default function Modal({
  open,
  title,
  onClose,
  dismissible = true,
  children,
  footer,
  className,
  ...props
}) {
  const titleId = useId()
  return (
    <Dialog
      {...props}
      className={twMerge('max-h-[90dvh] overflow-y-auto', className)}
      open={open}
      dismissible={dismissible}
      aria-labelledby={titleId}
      onOpenChange={(value) => {
        if (!value) onClose?.()
      }}
    >
      <header className="mb-6 flex items-center justify-between gap-4">
        <h2 id={titleId} className="text-xl font-semibold">
          {title}
        </h2>
        {dismissible && (
          <Button
            className="min-h-8 bg-transparent px-2 py-1 text-gray-500 hover:bg-gray-100 dark:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </header>
      {children}
      {footer && (
        <footer className="mt-6 flex justify-end gap-2">{footer}</footer>
      )}
    </Dialog>
  )
}
