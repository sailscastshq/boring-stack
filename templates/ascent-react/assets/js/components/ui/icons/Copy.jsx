import { forwardRef } from 'react'

const Copy = forwardRef(function Copy(props, ref) {
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
      <rect x="7.75" y="7.75" width="11.75" height="11.75" rx="2.25" />
      <path d="M16.25 7.75v-1c0-1.24-1.01-2.25-2.25-2.25H6.75C5.51 4.5 4.5 5.51 4.5 6.75V14c0 1.24 1.01 2.25 2.25 2.25h1" />
    </svg>
  )
})

export default Copy
