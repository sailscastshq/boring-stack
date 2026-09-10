import { reactive } from 'vue'

// Each workflow owns its confirmation. Nothing is shared across pages or requests.
export function useConfirmation() {
  const state = reactive({
    pending: null,
    request(options) {
      state.pending = options
    },
    cancel() {
      const pending = state.pending
      state.pending = null
      pending?.reject?.()
    },
    accept() {
      const pending = state.pending
      state.pending = null
      pending?.accept?.()
    }
  })
  return state
}
