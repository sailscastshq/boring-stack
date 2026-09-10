import { useState } from 'react'

export function useConfirmation() {
  const [pending, setPending] = useState(null)
  return {
    pending,
    request: setPending,
    cancel() {
      setPending(null)
      pending?.reject?.()
    },
    accept() {
      setPending(null)
      pending?.accept?.()
    }
  }
}
