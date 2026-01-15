import { watch } from 'vue'
import { usePage } from '@inertiajs/vue3'
import { useToast } from 'primevue/usetoast'

/**
 * Helper to normalize flash values to an array.
 * Supports both sails.inertia.flash() (single values) and req.flash() (arrays).
 * @param {*} value - The flash value (string, array, or object)
 * @returns {Array} - Normalized array of messages
 */
function normalizeFlash(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [value]
  // For objects like { type: 'success', message: 'Saved!' }
  if (typeof value === 'object' && value.message) return [value]
  return [value]
}

export function useFlashToast() {
  const toast = useToast()
  const page = usePage()

  // Watch for changes in flash messages and automatically show them as toasts
  watch(
    () => page.props.flash,
    (flash) => {
      if (!flash) return

      // Handle success messages
      const successMessages = normalizeFlash(flash.success)
      successMessages.forEach((message) => {
        const detail = typeof message === 'object' ? message.message : message
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail,
          life: 4000
        })
      })

      // Handle error messages
      const errorMessages = normalizeFlash(flash.error)
      errorMessages.forEach((message) => {
        const detail = typeof message === 'object' ? message.message : message
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail,
          life: 5000
        })
      })

      // Handle info messages
      const infoMessages = normalizeFlash(flash.message)
      infoMessages.forEach((message) => {
        const detail = typeof message === 'object' ? message.message : message
        toast.add({
          severity: 'info',
          summary: 'Info',
          detail,
          life: 4000
        })
      })

      // Handle custom toast objects from sails.inertia.flash('toast', { ... })
      if (flash.toast) {
        const toastData = flash.toast
        toast.add({
          severity: toastData.type || toastData.severity || 'info',
          summary:
            toastData.summary ||
            toastData.title ||
            capitalize(toastData.type || 'Info'),
          detail: toastData.message || toastData.detail,
          life: toastData.life || toastData.duration || 4000
        })
      }
    },
    {
      deep: true,
      immediate: true // Show toasts immediately on component mount if flash messages exist
    }
  )

  return {
    // Return the toast instance in case components need direct access
    toast
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
