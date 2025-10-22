import { Button } from 'primereact/button'
import { useDarkMode } from '@/hooks/useDarkMode'

export default function DarkModeToggle() {
  const { isDark, toggleDarkMode } = useDarkMode()

  return (
    <Button
      onClick={toggleDarkMode}
      icon={isDark ? 'pi pi-sun' : 'pi pi-moon'}
      rounded
      text
      severity="secondary"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      tooltip={isDark ? 'Light mode' : 'Dark mode'}
      tooltipOptions={{ position: 'bottom' }}
    />
  )
}
