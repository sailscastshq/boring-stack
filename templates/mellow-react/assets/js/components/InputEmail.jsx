import Envelope from '@/components/ui/icons/Envelope.jsx'
import InputBase from '@/components/InputBase'

export default function InputEmail(props) {
  return (
    <InputBase
      label="Email"
      id="email"
      type="email"
      placeholder="Your email"
      icon={<Envelope className="text-gray h-5 w-5" />}
      {...props}
    />
  )
}
