import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import Toast from '@/components/ui/toast/Toast.jsx'
import { toast } from '@/components/ui/toast/toast.js'
export default function Notifications() {
  const { props } = usePage()
  useEffect(() => {
    const flash = props.flash
    if (!flash) return
    for (const [key, title] of [
      ['success', 'Success'],
      ['error', 'Error'],
      ['message', 'Info'],
      ['info', 'Info'],
      ['warning', 'Warning']
    ]) {
      const messages = !flash[key]
        ? []
        : Array.isArray(flash[key])
        ? flash[key]
        : [flash[key]]
      for (const message of messages)
        toast({
          title,
          message: typeof message === 'object' ? message.message : message,
          duration: key === 'error' ? 5000 : 4000,
          class:
            key === 'error'
              ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
              : ''
        })
    }
    if (flash.toast) {
      const item = flash.toast
      toast({
        title: item.title || item.summary || 'Notification',
        message: item.message || item.detail,
        duration: item.duration ?? item.life ?? 4000
      })
    }
  }, [props.flash])
  return <Toast position="top-right" />
}
