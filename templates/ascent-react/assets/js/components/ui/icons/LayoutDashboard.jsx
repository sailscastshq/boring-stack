import { forwardRef } from 'react'

const LayoutDashboard = forwardRef(function LayoutDashboard(props, ref) {
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
      <rect x="3.75" y="3.75" width="6.5" height="9.5" rx="1.5" />
      <rect x="13.75" y="3.75" width="6.5" height="5.5" rx="1.5" />
      <rect x="3.75" y="16.75" width="6.5" height="3.5" rx="1.5" />
      <rect x="13.75" y="12.75" width="6.5" height="7.5" rx="1.5" />
    </svg>
  )
})

export default LayoutDashboard
