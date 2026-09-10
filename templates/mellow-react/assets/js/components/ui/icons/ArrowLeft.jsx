import { forwardRef } from 'react'

const ArrowLeft = forwardRef(function ArrowLeft(props, ref) {
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
      <path d="M19.5 12h-14" />
      <path d="m10.75 6.75-5.25 5.25 5.25 5.25" />
    </svg>
  )
})

export default ArrowLeft
