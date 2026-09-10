import { forwardRef } from 'react'

const Chat = forwardRef(function Chat(props, ref) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-slot="icon"
      {...props}
      ref={ref}
    >
      <path d="M4 11.25c0-4.15 3.25-7 8-7s8 2.85 8 7-3.25 7-8 7c-1.15 0-2.25-.18-3.2-.5L4.5 20l1.15-4A6.45 6.45 0 0 1 4 11.25" />
      <path d="M8.5 11.25h.01M12 11.25h.01M15.5 11.25h.01" strokeWidth="2" />
    </svg>
  )
})

export default Chat
