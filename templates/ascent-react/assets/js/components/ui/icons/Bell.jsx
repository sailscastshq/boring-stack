import { forwardRef } from 'react'

const Bell = forwardRef(function Bell(props, ref) {
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
      <path d="M6.25 10.25c0-3.7 2.15-6 5.75-6s5.75 2.3 5.75 6c0 4.5 1.75 5.35 1.75 6.75h-15c0-1.4 1.75-2.25 1.75-6.75" />
      <path d="M9.5 19.25c.55.67 1.37 1 2.5 1s1.95-.33 2.5-1" />
    </svg>
  )
})

export default Bell
