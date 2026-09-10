import { forwardRef } from 'react'

const Code = forwardRef(function Code(props, ref) {
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
      <path d="m8.5 7-4.75 5 4.75 5M15.5 7l4.75 5-4.75 5M13.5 4.75l-3 14.5" />
    </svg>
  )
})

export default Code
