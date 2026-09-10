import { forwardRef } from 'react'

const CreditCard = forwardRef(function CreditCard(props, ref) {
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
      <rect x="3.5" y="5.25" width="17" height="13.5" rx="2.25" />
      <path d="M3.5 9.25h17M7 14.75h4.5" />
    </svg>
  )
})

export default CreditCard
