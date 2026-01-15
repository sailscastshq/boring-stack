import { watch } from 'vue'
import { usePage } from '@inertiajs/vue3'
import { useToast } from 'primevue/usetoast'

export function useFlashToast() {
  const toast = useToast()
  const page = usePage()

  watch(
    () => page.props.flash,
    (flash) => {
      if (!flash) return

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
            if (message) {
              toast.add({
                ...config,
                detail: message
              })
            }
          })
        }
      })
    },
    {
      deep: true,
      immediate: true
    }
  )

  return { toast }
}
