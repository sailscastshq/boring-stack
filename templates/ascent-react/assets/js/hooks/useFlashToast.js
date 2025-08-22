/**
 * useFlashToast Hook
 *
 * Automatically converts Sails flash messages into PrimeReact toast notifications.
 * Based on the pattern from: https://blog.sailscasts.com/powering-toast-notifications-with-flash-messages
 */

import { useEffect, useRef } from 'react'
import { usePage } from '@inertiajs/react'

export function useFlashToast(toast) {
  const { props } = usePage()
  const previousFlash = useRef()

  useEffect(() => {
    // Safety check for props
    if (!props) {
      return
    }

    const flash = props.flash

    // Skip if no flash messages or if it's the same as previous render
    if (
      !flash ||
      JSON.stringify(flash) === JSON.stringify(previousFlash.current)
    ) {
      return
    }

    // Store current flash for comparison
    previousFlash.current = flash

    // Configuration for different flash message types
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

    // Process each flash message type
    Object.entries(types).forEach(([type, config]) => {
      const messages = flash[type]

      if (messages) {
        // Handle both single strings and arrays
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
