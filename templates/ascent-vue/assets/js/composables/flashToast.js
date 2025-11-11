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

      if (flash.success && Array.isArray(flash.success)) {
        flash.success.forEach((message) => {
          toast.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
            life: 4000
          })
        })
      }

      if (flash.error && Array.isArray(flash.error)) {
        flash.error.forEach((message) => {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 5000
          })
        })
      }

      if (flash.message && Array.isArray(flash.message)) {
        flash.message.forEach((message) => {
          toast.add({
            severity: 'info',
            summary: 'Info',
            detail: message,
            life: 4000
          })
        })
      }

      if (flash.warning && Array.isArray(flash.warning)) {
        flash.warning.forEach((message) => {
          toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: message,
            life: 4000
          })
        })
      }
    },
    {
      deep: true,
      immediate: true
    }
  )

  return { toast }
}
