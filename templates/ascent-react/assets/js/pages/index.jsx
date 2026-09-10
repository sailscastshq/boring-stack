import Input from '@/components/ui/input/Input.jsx'
import ShieldCheck from '@/components/ui/icons/ShieldCheck.jsx'
import Code from '@/components/ui/icons/Code.jsx'
import CurrencyDollar from '@/components/ui/icons/CurrencyDollar.jsx'
import ChevronDown from '@/components/ui/icons/ChevronDown.jsx'
import Heart from '@/components/ui/icons/Heart.jsx'
import CheckCircle from '@/components/ui/icons/CheckCircle.jsx'
import Bolt from '@/components/ui/icons/Bolt.jsx'
import Envelope from '@/components/ui/icons/Envelope.jsx'
import Chat from '@/components/ui/icons/Chat.jsx'
import ChartBar from '@/components/ui/icons/ChartBar.jsx'
import Users from '@/components/ui/icons/Users.jsx'
import CreditCard from '@/components/ui/icons/CreditCard.jsx'
import Lock from '@/components/ui/icons/Lock.jsx'
import Check from '@/components/ui/icons/Check.jsx'
import Spinner from '@/components/ui/spinner/Spinner.jsx'
import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'
import { useState } from 'react'
import Message from '@/components/ui/alert/Alert.jsx'
import '~/css/homepage.css'

Index.layout = AppLayout
export default function Index() {
  const [isWaitlistActive] = useState(true)
  const [shouldShake, setShouldShake] = useState(false)
  const { data, setData, post, processing, errors } = useForm({
    email: ''
  })

  const handleWaitlistSubmit = (e) => {
    e.preventDefault()

    if (!data.email.trim()) {
      setShouldShake(true)
      setTimeout(() => setShouldShake(false), 500)
      return
    }

    post('/waitlist', { preserveScroll: true })
  }

  return (
    <>
      <Head title="Ascent - The Complete SaaS Platform for Modern Teams" />
      <section className="relative overflow-hidden px-4 pb-16 pt-20">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/30 via-white to-accent-50/20"></div>
        <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 transform rounded-full bg-brand-100/20 blur-3xl"></div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Logo with subtle animation */}
          <div className="mb-8 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 scale-110 rounded-2xl bg-brand-200/20 blur-xl"></div>
              <img
                src="/images/logo.svg"
                alt="Ascent Logo"
                className="relative h-14 w-auto"
              />
            </div>
          </div>

          {/* Hero headline with better typography */}
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            <span className="block leading-tight text-gray-900">
              Scale Your Team,
            </span>
            <span className="block bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text leading-tight text-transparent">
              Streamline Success
            </span>
          </h1>

          {/* Improved subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-gray-600">
            Stop building the same authentication, billing, and team features
            over and over.
            <span className="font-semibold text-gray-900">
              {' '}
              Launch your SaaS in days, not months.
            </span>
          </p>

          {/* Social Proof Badge */}
          <div className="mb-8 flex items-center justify-center">
            <div className="inline-flex items-center space-x-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
              <div className="flex -space-x-1">
                <div className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600"></div>
                <div className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-green-600"></div>
                <div className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-purple-600"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Join 2,847+ developers
              </span>
            </div>
          </div>

          {/* Waitlist/CTA Section */}
          <div className="mx-auto mb-16 max-w-lg">
            {isWaitlistActive ? (
              <div className="relative">
                <div className="absolute inset-0 scale-105 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 opacity-20 blur-xl"></div>
                <form
                  onSubmit={handleWaitlistSubmit}
                  className={`relative rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl transition-all duration-300 ${
                    shouldShake ? 'ring-4 ring-red-100' : 'hover:shadow-3xl'
                  }`}
                  style={{
                    animation: shouldShake ? 'shake 0.5s ease-in-out' : 'none'
                  }}
                >
                  <div className="mb-6 text-center">
                    <h3 className="mb-2 text-2xl font-bold text-gray-900">
                      Join the Waitlist
                    </h3>
                    <p className="font-medium text-gray-600">
                      Be the first to scale with Ascent
                    </p>
                  </div>

                  {/* Global error */}
                  {errors.waitlist && (
                    <div className="mb-6" role="alert">
                      <Message
                        role={'alert'}
                        className={[
                          'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
                          'w-full'
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {errors.waitlist}
                      </Message>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        id="email-input"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Enter your email address"
                        className={`w-full rounded-xl border px-4 py-4 text-lg font-medium transition-all duration-200 ${
                          shouldShake || errors.email
                            ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                            : 'border-gray-200 bg-gray-50 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100'
                        }`}
                        disabled={processing}
                        aria-describedby={
                          errors.email ? 'email-error' : undefined
                        }
                        aria-invalid={errors.email ? 'true' : 'false'}
                        required
                      />
                      {errors.email && (
                        <p
                          id="email-error"
                          className="mt-2 text-sm text-red-600"
                          role="alert"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-75"
                      aria-describedby="email-input"
                    >
                      {processing ? (
                        <span className="flex items-center justify-center space-x-2">
                          <Spinner className="h-5 w-5 " />
                          <span>Joining...</span>
                        </span>
                      ) : (
                        'Join the Waitlist →'
                      )}
                    </button>
                  </div>

                  <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Early access</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>No spam</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Unsubscribe anytime</span>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              // CTA Mode (when waitlist is disabled)
              <div className="text-center">
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <button className="hover:shadow-3xl group relative rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-8 py-4 font-bold text-white shadow-2xl transition-all duration-200 hover:scale-[1.02]">
                    <span className="relative z-10">Start Free Trial</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-700 to-accent-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  </button>
                  <button className="rounded-xl border-2 border-gray-200 bg-white px-8 py-4 font-bold text-gray-700 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-brand-300 hover:shadow-xl">
                    Schedule Demo
                  </button>
                </div>
                <p className="mt-6 text-sm font-medium text-gray-500">
                  No credit card required • 14-day free trial • Cancel anytime
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Key Features Section */}
      <section className="relative bg-white px-4 py-20">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        ></div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
                ✨ Features
              </span>
            </div>
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Everything You Need to
              <span className="block bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                Scale Fast
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-gray-600">
              From authentication to payments, we've built all the
              infrastructure your growing business needs.
              <span className="mt-2 block font-semibold text-gray-900">
                Focus on what makes you unique.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Secure Authentication */}
            <div className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Secure Authentication
                </h3>
                <p className="mb-4 leading-relaxed text-gray-600">
                  OAuth, magic links, 2FA, and session management.
                  Enterprise-grade security that scales.
                </p>
                <div className="flex items-center text-sm font-medium text-brand-600">
                  <span>OAuth • 2FA • Magic Links</span>
                </div>
              </div>
            </div>

            {/* Subscription Billing */}
            <div className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg">
                  <CreditCard className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Subscription Billing
                </h3>
                <p className="mb-4 leading-relaxed text-gray-600">
                  Lemon Squeezy integration for seamless recurring payments and
                  subscription management.
                </p>
                <div className="flex items-center text-sm font-medium text-accent-600">
                  <span>Recurring • One-time • Trials</span>
                </div>
              </div>
            </div>

            {/* Team Management */}
            <div className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-success-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-success-500 to-success-600 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Team Management
                </h3>
                <p className="mb-4 leading-relaxed text-gray-600">
                  Multi-tenancy with team invites, role-based permissions, and
                  complete workspace isolation.
                </p>
                <div className="flex items-center text-sm font-medium text-success-600">
                  <span>Roles • Invites • Workspaces</span>
                </div>
              </div>
            </div>

            {/* Admin Dashboard */}
            <div className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <ChartBar className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Admin Dashboard
                </h3>
                <p className="mb-4 leading-relaxed text-gray-600">
                  Powerful admin interface to manage users, subscriptions, and
                  monitor your business metrics.
                </p>
                <div className="flex items-center text-sm font-medium text-purple-600">
                  <span>Analytics • Users • Revenue</span>
                </div>
              </div>
            </div>

            {/* Content & Blog */}
            <div className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <Chat className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Content & Blog
                </h3>
                <p className="mb-4 leading-relaxed text-gray-600">
                  Built-in CMS and blog system powered by Sails Content to
                  engage your audience and improve SEO.
                </p>
                <div className="flex items-center text-sm font-medium text-orange-600">
                  <span>CMS • Blog • SEO Ready</span>
                </div>
              </div>
            </div>

            {/* Transactional Email */}
            <div className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                  <Envelope className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Transactional Email
                </h3>
                <p className="mb-4 leading-relaxed text-gray-600">
                  Automated emails for onboarding, billing, notifications, and
                  customer communication.
                </p>
                <div className="flex items-center text-sm font-medium text-red-600">
                  <span>Templates • Triggers • Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Value Proposition Section */}
      <section className="relative overflow-hidden bg-gray-900 px-4 py-24">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900"></div>
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 transform rounded-full bg-brand-500/10 blur-3xl"></div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Why Choose
              <span className="block bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                The Boring Stack?
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-gray-300">
              Because it works. No drama, no complexity, just results.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="group text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 scale-110 rounded-2xl bg-brand-500/20 blur-xl"></div>
                  <div className="relative rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-4 shadow-2xl">
                    <Bolt className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">Ship Fast</h3>
              <p className="leading-relaxed text-gray-300">
                Built with battle-tested technologies. No more wrestling with
                complex build tools or chasing JavaScript trends.
              </p>
              <div className="mt-4 inline-flex items-center text-sm font-medium text-brand-400">
                <span>React • Node.js • PostgreSQL</span>
              </div>
            </div>

            <div className="group text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 scale-110 rounded-2xl bg-accent-500/20 blur-xl"></div>
                  <div className="relative rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 p-4 shadow-2xl">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">SaaS Ready</h3>
              <p className="leading-relaxed text-gray-300">
                Authentication, payments, teams, admin dashboard, and more.
                Everything you need to launch your SaaS.
              </p>
              <div className="mt-4 inline-flex items-center text-sm font-medium text-accent-400">
                <span>Auth • Billing • Multi-tenancy</span>
              </div>
            </div>

            <div className="group text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 scale-110 rounded-2xl bg-success-500/20 blur-xl"></div>
                  <div className="relative rounded-2xl bg-gradient-to-br from-success-500 to-success-600 p-4 shadow-2xl">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">
                Premium Experience
              </h3>
              <p className="leading-relaxed text-gray-300">
                PrimeReact components, Tailwind CSS, and modern tooling.
                Everything works together seamlessly.
              </p>
              <div className="mt-4 inline-flex items-center text-sm font-medium text-success-400">
                <span>PrimeReact • Tailwind • TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section - Enhanced with Refactoring UI principles */}
      <section className="relative overflow-hidden bg-white px-4 py-20">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-white"></div>
        <div className="absolute right-1/4 top-0 h-72 w-72 rounded-full bg-brand-100/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-accent-100/20 blur-3xl"></div>

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700">
                ❓ FAQ
              </span>
            </div>
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Got Questions?
              <span className="block bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                We've Got Answers
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl font-medium leading-relaxed text-gray-600">
              Everything you need to know about launching your SaaS with Ascent.
            </p>
          </div>

          <div className="space-y-6">
            <details className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                  Why should I choose Ascent over building from scratch?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 transition-colors group-hover:bg-brand-100">
                    <ChevronDown className="h-4 w-4 text-brand-600 transition-transform group-open:rotate-180" />
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4">
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Building a SaaS from scratch takes 6-12 months of expensive
                    development time. Ascent gives you
                    everything—authentication, billing, teams, admin
                    dashboard—in minutes, not months.
                  </p>
                  <div className="inline-flex items-center space-x-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
                    <Bolt className="h-4 w-4" />
                    <span>Save 6+ months of development time</span>
                  </div>
                </div>
              </div>
            </details>

            <details className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                  How much money could this save my startup?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-50 transition-colors group-hover:bg-success-100">
                    <ChevronDown className="h-4 w-4 text-success-600 transition-transform group-open:rotate-180" />
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4">
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Hiring a full-stack developer costs $120k+ annually.
                    Building auth, payments, and admin features takes months of
                    expensive development time. Ascent delivers production-ready
                    SaaS infrastructure immediately.
                  </p>
                  <div className="inline-flex items-center space-x-2 rounded-lg bg-success-50 px-3 py-2 text-sm font-semibold text-success-700">
                    <CurrencyDollar className="h-4 w-4" />
                    <span>ROI from day one instead of month six</span>
                  </div>
                </div>
              </div>
            </details>

            <details className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                  Is this actually production-ready or just a demo?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 transition-colors group-hover:bg-accent-100">
                    <ChevronDown className="h-4 w-4 text-accent-600 transition-transform group-open:rotate-180" />
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4">
                  <p className="mb-4 leading-relaxed text-gray-600">
                    100% production-ready. Enterprise-grade security, real
                    payment processing, automated emails, database migrations,
                    deployment scripts—everything you need to launch and scale.
                  </p>
                  <div className="inline-flex items-center space-x-2 rounded-lg bg-accent-50 px-3 py-2 text-sm font-semibold text-accent-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Deploy to production in hours, not months</span>
                  </div>
                </div>
              </div>
            </details>

            <details className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                  What if I need to customize or add features?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 transition-colors group-hover:bg-purple-100">
                    <ChevronDown className="h-4 w-4 text-purple-600 transition-transform group-open:rotate-180" />
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4">
                  <p className="mb-4 leading-relaxed text-gray-600">
                    You get the full source code—no black boxes, no vendor
                    lock-in. Built with clean, modern patterns that are easy to
                    extend. Add your unique features on top of our solid
                    foundation.
                  </p>
                  <div className="inline-flex items-center space-x-2 rounded-lg bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700">
                    <Code className="h-4 w-4" />
                    <span>Your code, your control, your IP</span>
                  </div>
                </div>
              </div>
            </details>

            <details className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                  How do I know this won't become technical debt?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 transition-colors group-hover:bg-orange-100">
                    <ChevronDown className="h-4 w-4 text-orange-600 transition-transform group-open:rotate-180" />
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4">
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Built on The Boring Stack—proven technologies that have
                    powered successful companies for years. No experimental
                    frameworks, no bleeding-edge risks. Just reliable,
                    maintainable code that scales.
                  </p>
                  <div className="inline-flex items-center space-x-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
                    <ShieldCheck className="h-4 w-4" />
                    <span>
                      Battle-tested foundation, future-proof architecture
                    </span>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </section>
    </>
  )
}
