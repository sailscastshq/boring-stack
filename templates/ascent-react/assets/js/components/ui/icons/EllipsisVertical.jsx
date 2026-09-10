import { forwardRef } from 'react'

const EllipsisVertical = forwardRef(function EllipsisVertical(props, ref) {
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
      <path d="M12 6.25h.01M12 12h.01M12 17.75h.01" strokeWidth="2.25" />
    </svg>
  )
})

export default EllipsisVertical
