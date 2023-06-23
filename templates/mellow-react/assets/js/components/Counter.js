import { useState } from 'react'
export default function Counter(props) {
  const [count, setCount] = useState(0)
  return (
    <button
      onClick={() => setCount(count + 1)}
      className="rounded-lg border border-purple-500 px-4 py-2 text-sm text-gray-600 hover:border-purple-600"
    >
      Clicked {count} times
    </button>
  )
}
