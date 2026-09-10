import { forwardRef } from 'react'

const Search = forwardRef(function Search(props, ref) {
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
      <circle cx="10.75" cy="10.75" r="6.25" />
      <path d="m15.25 15.25 4.25 4.25" />
    </svg>
  )
})

export default Search
