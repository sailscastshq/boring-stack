import { useState, useRef } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import { Toast } from 'primereact/toast'
import { Avatar } from 'primereact/avatar'
import { Button } from 'primereact/button'
import { Menu } from 'primereact/menu'
import { Tooltip } from 'primereact/tooltip'
import { classNames } from 'primereact/utils'
import { useFlashToast } from '@/hooks/useFlashToast'
import { useLocalStorage } from '@/hooks/useLocalStorage'

function DashboardSidebar({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileToggle,
  userMenuItems
}) {
  const { loggedInUser } = usePage().props
  const { url } = usePage()
  const userMenuRef = useRef(null)

  const navigationSections = [
    {
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: 'pi-home'
        }
      ]
    },
    {
      label: 'Settings',
      items: [
        {
          name: 'Profile',
          href: '/settings/profile',
          icon: 'pi-user'
        },
        {
          name: 'Team',
          href: '/settings/team',
          icon: 'pi-users'
        },
        {
          name: 'Billing',
          href: '/settings/billing',
          icon: 'pi-credit-card'
        },
        {
          name: 'Security',
          href: '/settings/security',
          icon: 'pi-shield'
        }
      ]
    }
  ]

  const isActiveRoute = (href) => {
    if (href === '/dashboard') {
      return url === '/dashboard'
    }
    return url.startsWith(href)
  }

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        flex flex-col border-r border-gray-50 bg-white transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${
          // Desktop behavior
          isCollapsed ? 'lg:w-16' : 'lg:w-64'
        }
        ${
          // Mobile behavior - fixed overlay
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-50 w-64 translate-x-0'
            : 'fixed inset-y-0 left-0 z-50 w-64 -translate-x-full lg:translate-x-0'
        }
      `}
      >
        {/* Header */}
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

              {/* Desktop collapse button */}
              <button
                onClick={onToggle}
                className="hidden rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 lg:block"
                title="Collapse sidebar"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </button>

              {/* Mobile close button */}
              <button
                onClick={onMobileToggle}
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 lg:hidden"
                title="Close sidebar"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </>
          ) : (
            <div className="mx-auto">
              <Link href="/">
                <img
                  src="/images/logomark.svg"
                  alt="Ascent"
                  className="h-8 w-8"
                />
              </Link>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-6">
            {navigationSections.map((section, sectionIndex) => {
              const showText = !isCollapsed || isMobileOpen
              return (
                <div key={sectionIndex}>
                  {/* Section Label */}
                  {section.label && showText && (
                    <div className="px-3 pb-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {section.label}
                      </h3>
                    </div>
                  )}

                  {/* Section Items */}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = isActiveRoute(item.href)
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-brand-50 text-brand-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          data-pr-tooltip={!showText ? item.name : undefined}
                          data-pr-position="right"
                          data-pr-at="right center"
                          data-pr-my="left center"
                          onClick={() => {
                            // Close mobile menu when navigating
                            if (isMobileOpen) onMobileToggle()
                          }}
                        >
                          <i
                            className={`pi ${item.icon} text-base ${
                              isActive
                                ? 'text-brand-600'
                                : 'text-gray-400 group-hover:text-gray-500'
                            } ${showText ? 'mr-3' : ''}`}
                          />
                          {showText && <span>{item.name}</span>}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-3">
          {!isCollapsed || isMobileOpen ? (
            <>
              <div
                className="flex cursor-pointer items-center rounded-lg p-3 transition-colors hover:bg-gray-50"
                onClick={(e) => userMenuRef.current.toggle(e)}
              >
                <Avatar
                  image={loggedInUser?.currentAvatarUrl}
                  label={loggedInUser?.initials}
                  size="normal"
                  shape="circle"
                  className="[&_img]:rounded-full"
                  style={{
                    backgroundColor: loggedInUser?.currentAvatarUrl
                      ? undefined
                      : '#6366f1',
                    color: '#ffffff'
                  }}
                />
                <div className="ml-3 min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {loggedInUser?.fullName}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {loggedInUser?.email}
                  </p>
                </div>
                <i className="pi pi-ellipsis-v text-xs text-gray-400" />
              </div>

              <Menu
                ref={userMenuRef}
                model={userMenuItems}
                popup
                className="w-64"
              />
            </>
          ) : (
            <div className="flex justify-center">
              <Avatar
                image={loggedInUser?.currentAvatarUrl}
                label={loggedInUser?.initials}
                size="normal"
                shape="circle"
                className="cursor-pointer [&_img]:rounded-full"
                onClick={(e) => userMenuRef.current.toggle(e)}
                data-pr-tooltip={loggedInUser?.fullName || 'User menu'}
                data-pr-position="right"
                data-pr-at="right center"
                data-pr-my="left center"
                style={{
                  backgroundColor: loggedInUser?.currentAvatarUrl
                    ? undefined
                    : '#6366f1',
                  color: '#ffffff'
                }}
              />
              <Menu
                ref={userMenuRef}
                model={userMenuItems}
                popup
                className="w-64"
              />
            </div>
          )}
        </div>

        {/* Tooltip for collapsed sidebar */}
        {isCollapsed && <Tooltip target="[data-pr-tooltip]" />}
      </aside>
    </>
  )
}

function DashboardNavbar({
  onSidebarToggle,
  onMobileToggle,
  title,
  isCollapsed,
  userMenuItems,
  loggedInUser
}) {
  const navbarUserMenuRef = useRef(null)

  return (
    <header className="border-b border-gray-50 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMobileToggle}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 lg:hidden"
            title="Open sidebar"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="14" y1="8" x2="20" y2="8"></line>
              <line x1="14" y1="12" x2="20" y2="12"></line>
              <line x1="14" y1="16" x2="20" y2="16"></line>
            </svg>
          </button>

          {/* Desktop expand button */}
          {isCollapsed && (
            <button
              onClick={onSidebarToggle}
              className="hidden rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 lg:block"
              title="Expand sidebar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="14" y1="8" x2="20" y2="8"></line>
                <line x1="14" y1="12" x2="20" y2="12"></line>
                <line x1="14" y1="16" x2="20" y2="16"></line>
              </svg>
            </button>
          )}

          <h1 className="text-lg font-medium text-gray-700">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            icon="pi pi-search"
            text
            className="text-gray-500 hover:text-gray-700"
            size="small"
            tooltip="Search"
          />
          <Button
            icon="pi pi-bell"
            text
            className="text-gray-500 hover:text-gray-700"
            size="small"
            tooltip="Notifications"
          />

          {/* User Avatar Dropdown */}
          <div className="relative">
            <Avatar
              image={loggedInUser?.currentAvatarUrl}
              label={loggedInUser?.initials}
              size="normal"
              shape="circle"
              className="cursor-pointer transition-all hover:ring-2 hover:ring-brand-200 [&_img]:rounded-full"
              onClick={(e) => navbarUserMenuRef.current.toggle(e)}
              style={{
                backgroundColor: loggedInUser?.currentAvatarUrl
                  ? undefined
                  : '#6366f1',
                color: '#ffffff'
              }}
            />

            <Menu
              ref={navbarUserMenuRef}
              model={userMenuItems}
              popup
              className="w-64"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

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
  const toast = useRef(null)
  const { loggedInUser, teams, currentTeam } = usePage().props

  useFlashToast(toast)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  // Reuse the same menu items for both sidebar and navbar
  const itemRenderer = (item) => (
    <div>
      <a
        className="flex cursor-pointer items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        onClick={item.command}
      >
        <i className={`${item.icon} mr-3 text-base text-gray-500`} />
        <span className="flex-1">{item.label}</span>
      </a>
    </div>
  )

  const signOutRenderer = (item) => (
    <div className="p-menuitem-content">
      <a
        className="flex cursor-pointer items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        onClick={item.command}
      >
        <i className={`${item.icon} mr-3 text-base text-red-500`} />
        <span className="flex-1">{item.label}</span>
      </a>
    </div>
  )

  const teamSwitcherRenderer = (item, options) => {
    if (!teams || teams.length === 0) return null

    return (
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="mb-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Teams
          </span>
        </div>
        <div className="space-y-1">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => router.post(`/teams/${team.id}/switch`)}
              className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${
                team.isCurrent
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Avatar
                image={team.logoUrl}
                label={team.name.charAt(0).toUpperCase()}
                size="normal"
                className="mr-3 text-xs font-medium [&_img]:rounded-full"
                style={{
                  backgroundColor: team.logoUrl ? 'transparent' : '#6b7280',
                  color: '#ffffff',
                  width: '1.75rem',
                  height: '1.75rem'
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{team.name}</div>
              </div>
              {team.isCurrent && (
                <span className="relative flex h-3 w-3 flex-shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-500"></span>
                </span>
              )}
            </button>
          ))}
          <Link
            href="/team/create"
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <div className="mr-3 flex h-7 w-7 items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs font-medium text-gray-400">
              +
            </div>
            <div className="font-medium">New team</div>
          </Link>
        </div>
      </div>
    )
  }

  const sharedUserMenuItems = [
    {
      template: (item, options) => {
        return (
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center">
              <Avatar
                image={loggedInUser?.currentAvatarUrl}
                label={loggedInUser?.initials}
                className="mr-3 [&_img]:rounded-full"
                shape="circle"
                size="normal"
                style={{
                  backgroundColor: loggedInUser?.currentAvatarUrl
                    ? undefined
                    : '#6366f1',
                  color: '#ffffff'
                }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-gray-900">
                  {loggedInUser?.fullName}
                </span>
                <span className="truncate text-xs text-gray-500">
                  {loggedInUser?.email}
                </span>
              </div>
            </div>
          </div>
        )
      }
    },
    ...(teams && teams.length > 0
      ? [
          {
            template: teamSwitcherRenderer,
            className: 'team-switcher-item'
          }
        ]
      : []),
    {
      label: 'My profile',
      icon: 'pi pi-user',
      command: () => router.visit('/profile'),
      template: itemRenderer
    },
    {
      label: 'Help',
      icon: 'pi pi-question-circle',
      command: () => router.visit('/help'),
      template: itemRenderer
    },
    {
      label: 'Sign out',
      icon: 'pi pi-sign-out',
      command: () => {
        router.delete('/logout')
      },
      template: signOutRenderer
    }
  ]

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <DashboardSidebar
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onMobileToggle={toggleMobileMenu}
        userMenuItems={sharedUserMenuItems}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Navbar */}
        <DashboardNavbar
          onSidebarToggle={toggleSidebar}
          onMobileToggle={toggleMobileMenu}
          title={title}
          isCollapsed={isCollapsed}
          userMenuItems={sharedUserMenuItems}
          loggedInUser={loggedInUser}
        />

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div
            className={`mx-auto py-12 ${
              maxWidth === 'narrow'
                ? 'max-w-3xl'
                : maxWidth === 'wide'
                ? 'max-w-7xl'
                : 'sm:w-10/12' // default
            }`}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toast ref={toast} />
    </div>
  )
}
