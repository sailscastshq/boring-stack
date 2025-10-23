import { ref, watch, onMounted, onUnmounted } from 'vue'

export function useDarkMode() {
  const mode = ref('system')
  const isDark = ref(false)

  // Initialize mode from localStorage
  const initializeMode = () => {
    if (typeof window === 'undefined') return

    const storedPreference = localStorage.getItem('darkModePreference')
    mode.value = storedPreference || 'system'
  }

  // Initialize isDark based on preference or system
  const initializeIsDark = () => {
    if (typeof window === 'undefined') return false

    const preference = localStorage.getItem('darkModePreference')

    if (preference === 'dark') {
      isDark.value = true
      return
    }
    if (preference === 'light') {
      isDark.value = false
      return
    }

    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Apply dark mode class to document
  const applyDarkMode = () => {
    if (typeof window === 'undefined') return

    const root = window.document.documentElement

    if (mode.value === 'system') {
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches

      if (systemPrefersDark) {
        root.classList.add('dark')
        isDark.value = true
      } else {
        root.classList.remove('dark')
        isDark.value = false
      }
    } else {
      if (mode.value === 'dark') {
        root.classList.add('dark')
        isDark.value = true
      } else {
        root.classList.remove('dark')
        isDark.value = false
      }
    }
  }

  // Watch mode changes
  watch(mode, () => {
    applyDarkMode()
  })

  // Listen to system preference changes
  let mediaQuery = null
  const handleSystemChange = (e) => {
    if (mode.value !== 'system') return

    isDark.value = e.matches
    const root = window.document.documentElement
    if (e.matches) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  onMounted(() => {
    initializeMode()
    initializeIsDark()
    applyDarkMode()

    // Listen for system preference changes
    if (typeof window !== 'undefined') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', handleSystemChange)
    }
  })

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleSystemChange)
    }
  })

  const toggleDarkMode = () => {
    const newMode = isDark.value ? 'light' : 'dark'
    mode.value = newMode
    localStorage.setItem('darkModePreference', newMode)
  }

  const setSystemMode = () => {
    mode.value = 'system'
    localStorage.removeItem('darkModePreference')
  }

  return { isDark, toggleDarkMode, setSystemMode, mode }
}
