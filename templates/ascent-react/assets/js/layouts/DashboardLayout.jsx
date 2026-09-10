import { useEffect, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import Avatar from '@/components/ui/avatar/Avatar.jsx'
import Button from '@/components/ui/button/Button.jsx'
import Sheet from '@/components/ui/sheet/Sheet.jsx'
import UserMenu from '@/components/UserMenu.jsx'
import Notifications from '@/components/Notifications.jsx'
import LayoutDashboard from '@/components/ui/icons/LayoutDashboard.jsx'
import User from '@/components/ui/icons/User.jsx'
import Users from '@/components/ui/icons/Users.jsx'
import CreditCard from '@/components/ui/icons/CreditCard.jsx'
import ShieldCheck from '@/components/ui/icons/ShieldCheck.jsx'
import SidebarClose from '@/components/ui/icons/SidebarClose.jsx'
import SidebarOpen from '@/components/ui/icons/SidebarOpen.jsx'
import Menu from '@/components/ui/icons/Menu.jsx'
import X from '@/components/ui/icons/X.jsx'
import Search from '@/components/ui/icons/Search.jsx'
import Bell from '@/components/ui/icons/Bell.jsx'
import EllipsisVertical from '@/components/ui/icons/EllipsisVertical.jsx'

const navigation = [
  { items: [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] },
  {
    label: 'Settings',
    items: [
      { name: 'Profile', href: '/settings/profile', icon: User },
      { name: 'Team', href: '/settings/team', icon: Users },
      { name: 'Billing', href: '/settings/billing', icon: CreditCard },
      { name: 'Security', href: '/settings/security', icon: ShieldCheck }
    ]
  }
]
const iconButton =
  'min-h-8 min-w-8 border-0 bg-transparent p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800'

export default function DashboardLayout({
  children,
  title = 'Dashboard',
  maxWidth = 'default'
}) {
  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    'ASCENT_SIDEBAR_COLLAPSED',
    false
  )
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const {
    url,
    props: { loggedInUser: user }
  } = usePage()
  useEffect(() => {
    const viewport = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      setIsDesktop(viewport.matches)
      if (viewport.matches) setIsMobileOpen(false)
    }
    sync()
    viewport.addEventListener('change', sync)
    return () => viewport.removeEventListener('change', sync)
  }, [])
  useEffect(() => {
    setIsMobileOpen(false)
  }, [url])
  const Sidebar = isDesktop ? 'aside' : Sheet
  const active = (href) =>
    href === '/dashboard' ? url === href : url.startsWith(href)
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        {...(isDesktop
          ? {}
          : {
              open: isMobileOpen,
              onOpenChange: setIsMobileOpen,
              'aria-label': 'Main navigation'
            })}
        className={`fixed inset-y-0 left-0 right-auto z-50 m-0 flex-col border-r border-gray-100 bg-white p-0 transition-all duration-300 ease-in-out motion-reduce:transition-none ${
          isCollapsed ? 'lg:w-16' : 'lg:w-64'
        } ${
          isDesktop
            ? 'flex translate-x-0'
            : 'starting:open:-translate-x-full w-64 -translate-x-full open:flex open:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {!isCollapsed || isMobileOpen ? (
            <>
              <Link href="/" className="group">
                <img
                  src="/images/logo.svg"
                  alt="Ascent Logo"
                  className="h-8 w-auto transition-transform group-hover:scale-105"
                />
              </Link>
              <Button
                aria-label="Collapse sidebar"
                className={`${iconButton} hidden lg:inline-flex`}
                onClick={() => setIsCollapsed(true)}
              >
                <SidebarClose className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Close sidebar"
                className={`${iconButton} lg:hidden`}
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/" className="mx-auto">
              <img
                src="/images/logo.svg"
                alt="Ascent Logo"
                className="h-8 w-8 object-contain"
              />
            </Link>
          )}
        </div>
        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Main navigation"
        >
          <div className="space-y-6">
            {navigation.map((section, index) => (
              <div key={index}>
                {section.label && (!isCollapsed || isMobileOpen) && (
                  <h3 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {section.label}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={item.name}
                      aria-current={active(item.href) ? 'page' : undefined}
                      title={isCollapsed ? item.name : undefined}
                      className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active(item.href)
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 ${
                          active(item.href)
                            ? 'text-brand-600'
                            : 'text-gray-400 group-hover:text-gray-500'
                        } ${!isCollapsed || isMobileOpen ? 'mr-3' : ''}`}
                      />
                      {(!isCollapsed || isMobileOpen) && (
                        <span>{item.name}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
        <div className="p-3">
          <button
            type="button"
            popoverTarget="sidebar-user-menu"
            aria-label="Account menu"
            className={`flex w-full items-center rounded-lg p-3 text-left transition-colors hover:bg-gray-50 ${
              isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
            }`}
          >
            <Avatar
              src={user?.currentAvatarUrl}
              alt=""
              className="size-8 bg-indigo-500 text-white"
            >
              {user?.initials}
            </Avatar>
            {(!isCollapsed || isMobileOpen) && (
              <>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user?.fullName}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
                <EllipsisVertical className="h-4 w-4 text-gray-400" />
              </>
            )}
          </button>
          <UserMenu id="sidebar-user-menu" />
        </div>
      </Sidebar>
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Button
                className={`${iconButton} lg:hidden`}
                aria-label="Open sidebar"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              {isCollapsed && (
                <Button
                  className={`${iconButton} hidden lg:inline-flex`}
                  aria-label="Expand sidebar"
                  onClick={() => setIsCollapsed(false)}
                >
                  <SidebarOpen className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button className={iconButton} aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
              <Button className={iconButton} aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <button
                type="button"
                popoverTarget="navbar-user-menu"
                aria-label="Account menu"
                className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Avatar
                  src={user?.currentAvatarUrl}
                  alt=""
                  className="size-8 bg-indigo-500 text-white"
                >
                  {user?.initials}
                </Avatar>
              </button>
              <UserMenu id="navbar-user-menu" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div
            className={`mx-auto py-12 ${
              maxWidth === 'narrow'
                ? 'max-w-3xl'
                : maxWidth === 'wide'
                ? 'max-w-7xl'
                : 'sm:w-10/12'
            }`}
          >
            {children}
          </div>
        </main>
      </div>
      <Notifications />
    </div>
  )
}
