import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'

export function useFlashToast(toast) {
  const { props } = usePage()

  useEffect(() => {
    if (!props?.flash) {
      return
    }

    const flash = props.flash

    const types = {
      success: {
        severity: 'success',
        summary: 'Success',
        life: 4000
      },
      error: {
        severity: 'error',
        summary: 'Error',
        life: 5000
      },
      message: {
        severity: 'info',
        summary: 'Info',
        life: 4000
      },
      info: {
        severity: 'info',
        summary: 'Info',
        life: 4000
      },
      warning: {
        severity: 'warn',
        summary: 'Warning',
        life: 4000
      }
    }

    Object.entries(types).forEach(([type, config]) => {
      const messages = flash[type]

      if (messages) {
        const messageArray = Array.isArray(messages) ? messages : [messages]

        messageArray.forEach((message) => {
          if (message && toast?.current) {
            toast.current.show({
              ...config,
              detail: message
            })
          }
        })
      }
    })
  }, [props.flash, toast])

  return { toast }
}
