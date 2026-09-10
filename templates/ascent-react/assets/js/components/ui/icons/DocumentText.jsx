import { forwardRef } from 'react'

const DocumentText = forwardRef(function DocumentText(props, ref) {
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
      <path d="M6 3.75h7l5 5v11.5H6z" />
      <path d="M13 3.75v5h5M9 13h6M9 16.5h6" />
    </svg>
  )
})

export default DocumentText
