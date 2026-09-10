import { useState } from 'react'
import Input from '@/components/ui/input/Input.jsx'
import Button from '@/components/ui/button/Button.jsx'
import Eye from '@/components/ui/icons/Eye.jsx'
import EyeOff from '@/components/ui/icons/EyeOff.jsx'
export default function PasswordField({ className = '', ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`pr-11 ${className}`}
      />
      <Button
        className="min-h-8 min-w-8 absolute right-1 top-1/2 -translate-y-1/2 bg-transparent p-1 text-gray-500 hover:bg-transparent dark:bg-transparent dark:text-gray-400 dark:hover:bg-transparent"
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </Button>
    </div>
  )
}
