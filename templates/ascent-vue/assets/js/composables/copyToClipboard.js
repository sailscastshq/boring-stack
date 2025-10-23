import { ref } from 'vue'

/**
 * Composable for copying text to clipboard with visual feedback
 * @param {number} resetDelay - Time in milliseconds before resetting copied state (default: 2000)
 * @returns {object} - Contains copied state, copyToClipboard function, and reset function
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const copied = ref(false)

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true

      // Auto-reset after delay
      setTimeout(() => (copied.value = false), resetDelay)

      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  const reset = () => (copied.value = false)

  return {
    copied,
    copyToClipboard,
    reset
  }
}
