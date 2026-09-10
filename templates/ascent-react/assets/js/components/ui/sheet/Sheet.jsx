import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import Dialog from '../dialog/Dialog.jsx'

const BASE_CLASSES = [
  'fixed inset-y-0 right-0 left-auto m-0 ml-auto h-dvh max-h-none w-[min(26rem,calc(100vw-1rem))] max-w-none translate-x-full overflow-hidden rounded-none border-y-0 border-r-0 border-l border-gray-200 bg-white p-0 text-gray-950 opacity-0 shadow-2xl outline-none',
  'open:translate-x-0 open:opacity-100',
  'transition-[display,overlay,opacity,transform] transition-discrete duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
  'starting:open:translate-x-full starting:open:opacity-0 motion-reduce:transition-none',
  'backdrop:bg-black/50 starting:open:backdrop:bg-black/0',
  'dark:border-gray-700 dark:bg-gray-950 dark:text-white'
]

const Sheet = forwardRef(function Sheet(
  { className, children, ...dialogProps },
  forwardedRef
) {
  return (
    <Dialog
      {...dialogProps}
      ref={forwardedRef}
      data-klean-sheet=""
      className={twMerge(BASE_CLASSES, className)}
    >
      {children}
    </Dialog>
  )
})

export default Sheet
