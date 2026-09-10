import { forwardRef } from 'react'

const Key = forwardRef(function Key(props, ref) {
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
      <circle cx="8.25" cy="11.75" r="3.75" />
      <path d="m11.5 10 8-4.5M15.5 7.75l2 2M17.75 6.5l1.5 1.5" />
    </svg>
  )
})

export default Key
