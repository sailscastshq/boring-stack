import { Link, Head, usePage } from '@inertiajs/react'
import DashboardLayout from '@/layouts/DashboardLayout.jsx'

Dashboard.layout = (page) => (
  <DashboardLayout title="Dashboard" maxWidth="wide">
    {page}
  </DashboardLayout>
)
export default function Dashboard() {
  const page = usePage()
  const loggedInUser = page.props.loggedInUser

  return (
    <>
      <Head title="Dashboard | Ascent"></Head>

      <header className="mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 p-8 text-white shadow-2xl">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-white/10"></div>
          <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-4 translate-y-4 rounded-full bg-white/5"></div>
          <div className="relative">
            <h1 className="mb-2 text-2xl font-bold">
              Welcome back, {loggedInUser.fullName.split(' ')[0]}! 👋
            </h1>
            <p className="text-brand-100">
              Here's what's happening with your account today.
            </p>
          </div>
        </div>
      </header>

      <div className="flex min-h-[400px] items-center justify-center rounded-xl bg-white p-12 shadow-sm ring-1 ring-gray-100">
        <div className="max-w-2xl text-center">
          <div className="mb-6 text-6xl">🎨</div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            This is your blank canvas
          </h2>
          <p className="text-lg text-gray-600">
            Go ahead, build something cool. Or don't. I am not your mom. (But
            seriously, you got this! 💪)
          </p>
        </div>
      </div>
    </>
  )
}
