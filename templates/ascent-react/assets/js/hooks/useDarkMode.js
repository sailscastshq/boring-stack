import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'system'
    return localStorage.getItem('darkModePreference') || 'system'
  })

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false

    const preference = localStorage.getItem('darkModePreference')

    if (preference === 'dark') return true
    if (preference === 'light') return false

    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = window.document.documentElement

    if (mode === 'system') {
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches

      if (systemPrefersDark) {
        root.classList.add('dark')
        setIsDark(true)
      } else {
        root.classList.remove('dark')
        setIsDark(false)
      }
    } else {
      if (mode === 'dark') {
        root.classList.add('dark')
        setIsDark(true)
      } else {
        root.classList.remove('dark')
        setIsDark(false)
      }
    }
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e) => {
      setIsDark(e.matches)
      const root = window.document.documentElement
      if (e.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mode])

  const toggleDarkMode = () => {
    const newMode = isDark ? 'light' : 'dark'
    setMode(newMode)
    localStorage.setItem('darkModePreference', newMode)
  }

  const setSystemMode = () => {
    setMode('system')
    localStorage.removeItem('darkModePreference')
  }

  return { isDark, toggleDarkMode, setSystemMode, mode }
}
