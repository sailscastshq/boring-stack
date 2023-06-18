import { Link } from '@inertiajs/react'
export default function Hello({ quote }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-8 text-center text-gray-700">
      <p className="text-xl">{quote}</p>
      <Link href="/" className="text-purple-600 underline">
        Back to Home
      </Link>
    </div>
  )
}
