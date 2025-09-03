import { Link, usePage } from '@inertiajs/react'

export default function SettingsLayout({ children }) {
  const { url } = usePage()

  const sidebarItems = [
    {
      name: 'Profile',
      href: '/settings/profile',
      description: 'Personal details and preferences'
    },
    {
      name: 'Security',
      href: '/settings/security',
      description: 'Authentication and safety'
    },
    {
      name: 'Billing',
      href: '/settings/billing',
      description: 'Payment methods and invoices'
    },
    {
      name: 'Team',
      href: '/settings/team',
      description: 'Manage team members'
    }
  ]

  const getCurrentPageInfo = () => {
    const currentItem = sidebarItems.find((item) => item.href === url)
    return (
      currentItem || {
        name: 'Settings',
        description: 'Manage your account settings'
      }
    )
  }

  const currentPage = getCurrentPageInfo()

  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Simple Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {currentPage.name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {currentPage.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:gap-8">
            {/* Sticky Sidebar */}
            <aside className="mb-8 lg:mb-0 lg:w-64 lg:flex-shrink-0">
              <div className="lg:sticky lg:top-24 lg:max-h-screen lg:overflow-y-auto">
                <nav className="space-y-1 rounded-lg p-4 shadow-sm lg:p-6">
                  {sidebarItems.map((item) => {
                    const isActive = url === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-brand-500 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}
