import { forwardRef } from 'react'

const Clock = forwardRef(function Clock(props, ref) {
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
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5v4.9l3.25 2" />
    </svg>
  )
})

export default Clock
