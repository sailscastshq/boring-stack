import Check from '@/components/ui/icons/Check.jsx'
import X from '@/components/ui/icons/X.jsx'
import Link from '@/components/ui/icons/Link.jsx'
import Clock from '@/components/ui/icons/Clock.jsx'
import Building from '@/components/ui/icons/Building.jsx'
import Users from '@/components/ui/icons/Users.jsx'
import Notifications from '@/components/Notifications.jsx'
import { Link as InertiaLink, Head, useForm } from '@inertiajs/react'
import { useRef } from 'react'

export default function TeamInvite({ team, inviteToken, via, invite }) {
  const { data, setData, post, processing, ...form } = useForm({
    inviteToken,
    response: ''
  })

  function handleInviteResponse(response) {
    form.transform((data) => ({ ...data, response }))
    post(`/team/${inviteToken}`)
  }

  return (
    <>
      <>
        <Head title={`Join ${team.name} | Ascent`}></Head>
        <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-brand-50/30 via-white to-accent-50/20 py-12 sm:px-6 lg:px-8">
          {/* Background Elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-brand-200/20 blur-3xl"></div>
            <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl"></div>
          </div>

          <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center">
              <InertiaLink href="/" className="group">
                <div className="relative">
                  <div className="absolute inset-0 scale-110 rounded-2xl bg-brand-200/30 opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                  <img
                    src="/images/logo.svg"
                    alt="Ascent Logo"
                    className="relative h-12 w-auto"
                  />
                </div>
              </InertiaLink>
            </div>

            {/* Header */}
            <header className="mb-8 text-center">
              <div className="mb-6 flex items-center justify-center">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute inset-0 scale-110 rounded-2xl bg-brand-200/40 opacity-70 blur-xl"></div>
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Join {team.name}
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                {via === 'email' && invite?.invitedBy ? (
                  <>
                    <strong>
                      {invite.invitedBy.fullName || invite.invitedBy.email}
                    </strong>{' '}
                    invited you to join their team
                  </>
                ) : (
                  `You've been invited to join ${team.name}`
                )}
              </p>
            </header>
          </div>

          <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
            <div className="relative">
              {/* Background blur effect */}
              <div className="absolute inset-0 scale-105 rounded-2xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 blur-xl"></div>

              {/* Main card */}
              <div className="relative rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-2xl">
                <div className="space-y-6">
                  {/* Team Info */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6 text-center">
                    <div className="mb-4 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                        <Building className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {team.name}
                    </h3>

                    {/* Invitation Details */}
                    {via === 'email' && invite && (
                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-center space-x-2">
                          <span>Sent to {invite.email}</span>
                        </div>

                        {invite.expiresAt && (
                          <div className="flex items-center justify-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              Expires{' '}
                              {new Date(invite.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {via === 'link' && (
                      <div className="mt-4">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          <Link className="h-4 w-4" />
                          <span>Shareable team invitation</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* Decline Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleInviteResponse('decline')
                      }}
                      className="order-2 flex-1 sm:order-1"
                    >
                      <button
                        type="submit"
                        disabled={processing}
                        className="flex w-full items-center justify-center rounded-xl border border-red-200 bg-white px-6 py-4 text-lg font-medium text-red-600 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-red-300 hover:bg-red-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <X className="mr-2 h-5 w-5" />
                        {processing ? 'Processing...' : 'Decline'}
                      </button>
                    </form>

                    {/* Accept Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleInviteResponse('accept')
                      }}
                      className="order-1 flex-1 sm:order-2"
                    >
                      <button
                        type="submit"
                        disabled={processing}
                        className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-brand-700 hover:to-accent-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <Check className="mr-2 h-5 w-5" />
                        {processing ? 'Processing...' : 'Accept'}
                      </button>
                    </form>
                  </div>

                  {/* Footer Info */}
                  <footer className="border-t border-gray-100 pt-6 text-center">
                    <p className="text-sm text-gray-500">
                      By accepting, you'll be able to collaborate with the team
                      and access shared resources.
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      Need help?{' '}
                      <InertiaLink
                        href="/contact"
                        className="text-brand-600 hover:text-brand-500"
                      >
                        Contact support
                      </InertiaLink>
                    </p>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
      <Notifications />
    </>
  )
}
