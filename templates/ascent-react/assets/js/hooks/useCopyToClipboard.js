import { useState } from 'react'

/**
 * Custom hook for copying text to clipboard with visual feedback
 * @param {number} resetDelay - Time in milliseconds before resetting copied state (default: 2000)
 * @returns {object} - Contains copied state, copyToClipboard function, and reset function
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)

      // Auto-reset after delay
      setTimeout(() => setCopied(false), resetDelay)

      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  const reset = () => setCopied(false)

  return {
    copied,
    copyToClipboard,
    reset
  }
}
