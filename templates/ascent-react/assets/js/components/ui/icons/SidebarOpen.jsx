import { forwardRef } from 'react'

const SidebarOpen = forwardRef(function SidebarOpen(props, ref) {
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
      <rect x="3.75" y="4.25" width="16.5" height="15.5" rx="2" />
      <path d="M9 4.25v15.5M13.5 9l3 3-3 3" />
    </svg>
  )
})

export default SidebarOpen
