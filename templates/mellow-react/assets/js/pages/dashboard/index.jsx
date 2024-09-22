import { Link, Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'

Dashboard.layout = (page) => <AppLayout children={page} />
export default function Dashboard() {
  const page = usePage()
  const loggedInUser = page.props.loggedInUser

  return (
    <>
      <Head title="Dashboard | Mellow"></Head>
      <section className="mx-auto max-w-4xl px-4">
        <section className="rounded-lg bg-gradient-to-b from-brand-50/10 to-white p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <h3 className="mb-2 text-xl font-semibold text-brand">
            Welcome, {loggedInUser.fullName}
          </h3>
          <p className="mb-4 text-gray-600">
            You are logged in as {loggedInUser.email}
          </p>
          <Link
            href="/profile"
            className="mt-2 rounded-lg border border-brand px-4 py-2 text-brand transition-colors duration-300 hover:bg-brand hover:text-white"
          >
            Edit Profile
          </Link>
        </section>
      </section>
    </>
  )
}
