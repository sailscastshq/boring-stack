import { forwardRef } from 'react'

const Camera = forwardRef(function Camera(props, ref) {
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
      <path d="M4 8.25c0-1.1.9-2 2-2h2l1.25-2h5.5l1.25 2h2c1.1 0 2 .9 2 2v8.5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2z" />
      <circle cx="12" cy="12.5" r="3.25" />
    </svg>
  )
})

export default Camera
