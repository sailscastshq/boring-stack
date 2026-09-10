import { forwardRef } from 'react'

const Users = forwardRef(function Users(props, ref) {
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
      <circle cx="9.25" cy="8.5" r="3.25" />
      <path d="M3.75 19.5c.35-3.65 2.18-5.5 5.5-5.5s5.15 1.85 5.5 5.5M14 6.25a3 3 0 0 1 0 5.75M15.5 14c2.85.3 4.35 2.15 4.75 5.5" />
    </svg>
  )
})

export default Users
