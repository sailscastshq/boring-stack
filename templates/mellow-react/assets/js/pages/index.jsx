import Counter from '@/components/Counter'
import { Link } from '@inertiajs/react'

export default function Index({ name }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-8 text-center text-gray-700">
      <h1>
        A brand new
        <span className="text-xl font-bold text-purple-400"> {name}</span> app
        on Sails
      </h1>
      <Counter />

      <Link href="/example" className="text-purple-600 underline">
        Go to example page
      </Link>
      <ul className="flex space-x-4 text-gray-400">
        <li>
          <a
            href="https://sailsjs.com"
            target="_blank"
            className="hover:text-gray-600 hover:underline"
          >
            Sails
          </a>
        </li>
        <li>
          <a
            href="https://inertiajs.com"
            target="_blank"
            className="hover:text-gray-600 hover:underline"
          >
            Inertia
          </a>
        </li>
        <li>
          <a
            href="https://reactjs.org"
            target="_blank"
            className="hover:text-gray-600 hover:underline"
          >
            React
          </a>
        </li>
        <li>
          <a
            href="https://tailwindcss.com"
            target="_blank"
            className="hover:text-gray-600 hover:underline"
          >
            Tailwind CSS
          </a>
        </li>
      </ul>
    </div>
  )
}
