import { forwardRef } from 'react'

const ChevronLeft = forwardRef(function ChevronLeft(props, ref) {
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
      <path d="m15.25 6.25-6.5 5.75 6.5 5.75" />
    </svg>
  )
})

export default ChevronLeft
