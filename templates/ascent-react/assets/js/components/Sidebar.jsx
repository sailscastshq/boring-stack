import { Link, usePage } from '@inertiajs/react'
import { Avatar } from 'primereact/avatar'
import { Button } from 'primereact/button'
import { useState } from 'react'

export default function Sidebar({ isOpen, onToggle }) {
  const { loggedInUser } = usePage().props
  const { url } = usePage()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'pi pi-home',
      prefetch: true
    },
    {
      name: 'Team',
      href: '/settings/team',
      icon: 'pi pi-users',
      prefetch: true
    },
    {
      name: 'Billing',
      href: '/settings/billing',
      icon: 'pi pi-credit-card',
      prefetch: true,
      cacheFor: '1m'
    }
  ]

  const settingsItems = [
    {
      name: 'Profile',
      href: '/settings/profile',
      icon: 'pi pi-user',
      prefetch: true
    },
    {
      name: 'Security',
      href: '/settings/security',
      icon: 'pi pi-shield',
      prefetch: true
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
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="group flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-0 scale-110 rounded-xl bg-brand-200/20 opacity-0 blur-sm transition-opacity group-hover:opacity-100"></div>
              <img
                src="/images/logo.svg"
                alt="Ascent Logo"
                className="relative h-8 w-auto transition-transform group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Close button for mobile */}
          <Button
            icon="pi pi-times"
            text
            className="lg:hidden"
            onClick={onToggle}
            severity="secondary"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActiveRoute(item.href)
                    ? 'bg-brand-100 text-brand-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
                }`}
                prefetch={item.prefetch}
                cacheFor={item.cacheFor}
              >
                <i
                  className={`${item.icon} mr-3 text-lg transition-colors ${
                    isActiveRoute(item.href)
                      ? 'text-brand-600'
                      : 'text-gray-400 group-hover:text-brand-500'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Settings Section */}
          <div className="pt-6">
            <div className="mb-3 px-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Settings
              </h3>
            </div>
            <div className="space-y-1">
              {settingsItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActiveRoute(item.href)
                      ? 'bg-brand-100 text-brand-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
                  }`}
                  prefetch={item.prefetch}
                  cacheFor={item.cacheFor}
                >
                  <i
                    className={`${item.icon} mr-3 text-lg transition-colors ${
                      isActiveRoute(item.href)
                        ? 'text-brand-600'
                        : 'text-gray-400 group-hover:text-brand-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Avatar
              image={loggedInUser?.avatarUrl}
              label={loggedInUser?.initials}
              size="large"
              shape="circle"
              className="border-2 border-gray-200 [&_img]:rounded-full"
              style={{
                backgroundColor: loggedInUser?.avatarUrl
                  ? undefined
                  : '#6366f1',
                color: '#ffffff'
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {loggedInUser?.fullName}
              </p>
              <p className="truncate text-xs text-gray-500">
                {loggedInUser?.email}
              </p>
            </div>
            <form action="/logout" method="POST">
              <Button
                type="submit"
                icon="pi pi-sign-out"
                text
                severity="secondary"
                size="small"
                tooltip="Sign out"
                className="text-gray-400 hover:text-gray-600"
              />
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

// Mobile menu toggle button component
export function MobileMenuToggle({ onClick, className = '' }) {
  return (
    <Button
      icon="pi pi-bars"
      text
      onClick={onClick}
      className={`lg:hidden ${className}`}
      severity="secondary"
      aria-label="Open sidebar"
    />
  )
}
