import { Link, Head, usePage } from '@inertiajs/react'
import DashboardLayout from '@/layouts/DashboardLayout.jsx'

Dashboard.layout = (page) => (
  <DashboardLayout title="Dashboard">{page}</DashboardLayout>
)
export default function Dashboard() {
  const page = usePage()
  const loggedInUser = page.props.loggedInUser

  const stats = [
    {
      label: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: 'pi-users'
    },
    {
      label: 'Revenue',
      value: '$14,852',
      change: '+8.2%',
      trend: 'up',
      icon: 'pi-dollar'
    },
    {
      label: 'Conversion Rate',
      value: '3.24%',
      change: '-0.4%',
      trend: 'down',
      icon: 'pi-chart-line'
    },
    {
      label: 'Active Sessions',
      value: '847',
      change: '+5.1%',
      trend: 'up',
      icon: 'pi-globe'
    }
  ]

  return (
    <>
      <Head title="Dashboard | Ascent"></Head>

      {/* Welcome Section */}
      <div className="mb-8">
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
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span
                    className={`flex items-center font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <i
                      className={`pi ${
                        stat.trend === 'up' ? 'pi-arrow-up' : 'pi-arrow-down'
                      } mr-1 text-xs`}
                    />
                    {stat.change}
                  </span>
                  <span className="ml-2 text-gray-500">from last month</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <i className={`pi ${stat.icon} text-lg text-brand-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/settings/team"
              className="flex items-center rounded-lg p-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <i className="pi pi-user-plus text-blue-600" />
              </div>
              Invite team member
            </Link>
            <Link
              href="/settings/billing"
              className="flex items-center rounded-lg p-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <i className="pi pi-credit-card text-green-600" />
              </div>
              Update billing
            </Link>
            <Link
              href="/settings"
              className="flex items-center rounded-lg p-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <i className="pi pi-cog text-purple-600" />
              </div>
              Account settings
            </Link>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
                <i className="pi pi-user text-xs text-brand-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">
                  Profile updated successfully
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <i className="pi pi-check text-xs text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">Payment processed</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <i className="pi pi-bell text-xs text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">New team member joined</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
