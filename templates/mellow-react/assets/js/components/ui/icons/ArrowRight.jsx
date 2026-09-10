import { forwardRef } from 'react'

const ArrowRight = forwardRef(function ArrowRight(props, ref) {
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
      <path d="M4.5 12h14" />
      <path d="m13.25 6.75 5.25 5.25-5.25 5.25" />
    </svg>
  )
})

export default ArrowRight
