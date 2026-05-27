import { Link, Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'

Dashboard.layout = AppLayout
export default function Dashboard() {
  const page = usePage()
  const loggedInUser = page.props.loggedInUser

  return (
    <>
      <Head title="Dashboard | Mellow"></Head>
      <section className="mx-auto max-w-4xl px-4">
        <section className="from-brand-50/10 rounded-lg bg-gradient-to-b to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <h3 className="text-brand mb-2 text-xl font-semibold">
            Welcome, {loggedInUser.fullName}
          </h3>
          <p className="mb-4 text-gray-600">
            You are logged in as {loggedInUser.email}
          </p>
          <Link
            href="/profile"
            className="border-brand text-brand hover:bg-brand mt-2 rounded-lg border px-4 py-2 transition-colors duration-300 hover:text-white"
          >
            Edit Profile
          </Link>
        </section>
      </section>
    </>
  )
}
