import Button from '@/components/ui/button/Button.jsx'
import Lock from '@/components/ui/icons/Lock.jsx'
import EyeOff from '@/components/ui/icons/EyeOff.jsx'
import Eye from '@/components/ui/icons/Eye.jsx'
import { useState } from 'react'
import InputBase from '@/components/InputBase'

export default function InputPassword(props) {
  const [showPassword, setShowPassword] = useState(false)

  function toggleShowPassword() {
    setShowPassword(!showPassword)
  }

  return (
    <InputBase
      label="Password"
      id="password"
      type={showPassword ? 'text' : 'password'}
      placeholder="Your password"
      icon={<Lock className="text-gray h-5 w-5" />}
      suffix={
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <Button
            type="button"
            onClick={toggleShowPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="min-h-5 min-w-5 rounded-sm bg-transparent p-0 hover:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:active:bg-transparent"
          >
            {showPassword ? (
              <EyeOff className="text-gray h-5 w-5" />
            ) : (
              <Eye className="text-gray h-5 w-5" />
            )}
          </Button>
        </span>
      }
      {...props}
    />
  )
}
