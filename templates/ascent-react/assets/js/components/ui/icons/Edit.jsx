import { forwardRef } from 'react'

const Edit = forwardRef(function Edit(props, ref) {
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
      <path d="m5 15.75-.75 4 4-.75L18.5 8.75l-3.25-3.25z" />
      <path d="m13.75 7 3.25 3.25M5 15.75 8.25 19" />
    </svg>
  )
})

export default Edit
