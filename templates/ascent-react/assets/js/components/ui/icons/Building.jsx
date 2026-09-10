import { forwardRef } from 'react'

const Building = forwardRef(function Building(props, ref) {
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
      <path d="M5 20.25V4.5h11v15.75M16 9h3v11.25M3.75 20.25h16.5" />
      <path
        d="M8.5 8h.01M12.5 8h.01M8.5 11.5h.01M12.5 11.5h.01M8.5 15h.01M12.5 15h.01M9.5 20.25v-2h2v2"
        strokeWidth="2"
      />
    </svg>
  )
})

export default Building
