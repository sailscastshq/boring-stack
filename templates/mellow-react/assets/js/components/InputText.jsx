import User from '@/components/ui/icons/User.jsx'
import InputBase from '@/components/InputBase'

export default function InputText(props) {
  return (
    <InputBase
      label="Name"
      id="name"
      type="text"
      placeholder="Your name"
      icon={<User className="text-gray h-5 w-5" />}
      {...props}
    />
  )
}
