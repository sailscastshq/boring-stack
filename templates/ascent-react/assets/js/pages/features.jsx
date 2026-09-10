import Code from '@/components/ui/icons/Code.jsx'
import Envelope from '@/components/ui/icons/Envelope.jsx'
import Chat from '@/components/ui/icons/Chat.jsx'
import Bolt from '@/components/ui/icons/Bolt.jsx'
import Users from '@/components/ui/icons/Users.jsx'
import ChartBar from '@/components/ui/icons/ChartBar.jsx'
import CreditCard from '@/components/ui/icons/CreditCard.jsx'
import InfoCircle from '@/components/ui/icons/InfoCircle.jsx'
import Check from '@/components/ui/icons/Check.jsx'
import Lock from '@/components/ui/icons/Lock.jsx'
import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'

Features.layout = AppLayout
export default function Features() {
  return (
    <>
      <Head title="Features - Everything You Need to Scale Fast | Ascent" />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/30 via-white to-accent-50/20"></div>
        <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 transform rounded-full bg-brand-100/20 blur-3xl"></div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700">
              ⚡ Built for Speed
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            <span className="block leading-tight text-gray-900">
              Everything You Need
            </span>
            <span className="block bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text leading-tight text-transparent">
              to Scale Fast
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-gray-600">
            Stop rebuilding the same features over and over. Launch your SaaS
            with enterprise-grade infrastructure that actually works.
            <span className="font-semibold text-gray-900">
              {' '}
              Focus on what makes you unique.
            </span>
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="hover:shadow-3xl group relative inline-block rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-8 py-4 font-bold text-white no-underline shadow-2xl transition-all duration-200 hover:scale-[1.02]"
            >
              <span className="relative z-10">Start Building Today</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-700 to-accent-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
            </Link>
            <a
              href="https://youtu.be/2Rd6NQV2jWg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-xl border-2 border-gray-200 bg-white px-8 py-4 font-bold text-gray-700 no-underline shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-brand-300 hover:shadow-xl"
            >
              View Live Demo
            </a>
          </div>
        </div>
      </section>

      {/* Detailed Features Grid */}
      <section className="relative bg-white px-4 py-20">
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
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Secure Authentication */}
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-brand-600 to-accent-600 opacity-20 blur transition duration-300 group-hover:opacity-30"></div>
              <div className="relative rounded-3xl border border-gray-100 bg-white p-10 shadow-xl">
                <div className="mb-8 flex items-center space-x-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Enterprise Authentication
                    </h3>
                    <p className="font-medium text-brand-600">
                      Security that scales with you
                    </p>
                  </div>
                </div>

                <p className="mb-8 text-lg leading-relaxed text-gray-600">
                  Stop worrying about security vulnerabilities. Our
                  authentication system includes everything from basic password
                  auth to enterprise SSO, with security best practices baked in
                  from day one.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      OAuth with Google, GitHub, and more
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Magic link authentication (passwordless)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Two-factor authentication ready
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Session management & security headers
                    </span>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl bg-brand-50 p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
                      <InfoCircle className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-900">
                        Enterprise Ready
                      </h4>
                      <p className="text-sm leading-relaxed text-brand-700">
                        Built with OWASP security standards, rate limiting, and
                        audit logging. Your users' data is protected from day
                        one.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Billing */}
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-accent-600 to-purple-600 opacity-20 blur transition duration-300 group-hover:opacity-30"></div>
              <div className="relative rounded-3xl border border-gray-100 bg-white p-10 shadow-xl">
                <div className="mb-8 flex items-center space-x-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Revenue-Ready Billing
                    </h3>
                    <p className="font-medium text-accent-600">
                      Start earning from day one
                    </p>
                  </div>
                </div>

                <p className="mb-8 text-lg leading-relaxed text-gray-600">
                  Integrated with Lemon Squeezy for hassle-free payments. Handle
                  subscriptions, one-time payments, trials, and complex pricing
                  models without touching a single line of payment code.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Recurring subscriptions with automatic billing
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Free trials and proration handling
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Multiple pricing tiers and add-ons
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Dunning management for failed payments
                    </span>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl bg-accent-50 p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100">
                      <ChartBar className="h-5 w-5 text-accent-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-accent-900">
                        Revenue Analytics
                      </h4>
                      <p className="text-sm leading-relaxed text-accent-700">
                        Track MRR, churn, LTV, and other key metrics with
                        built-in analytics dashboard. Make data-driven decisions
                        from day one.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Management */}
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-success-600 to-emerald-600 opacity-20 blur transition duration-300 group-hover:opacity-30"></div>
              <div className="relative rounded-3xl border border-gray-100 bg-white p-10 shadow-xl">
                <div className="mb-8 flex items-center space-x-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-success-500 to-success-600 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Multi-Tenant Teams
                    </h3>
                    <p className="font-medium text-success-600">
                      Scale to enterprise customers
                    </p>
                  </div>
                </div>

                <p className="mb-8 text-lg leading-relaxed text-gray-600">
                  Built-in multi-tenancy with complete workspace isolation. Your
                  customers can invite teammates, manage permissions, and
                  collaborate safely—all without you writing a single line of
                  team management code.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Role-based permissions (Owner, Admin, Member)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Email invitations with onboarding flow
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Complete data isolation between workspaces
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Team switching and management UI
                    </span>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl bg-success-50 p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100">
                      <Lock className="h-5 w-5 text-success-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-success-900">
                        Enterprise Security
                      </h4>
                      <p className="text-sm leading-relaxed text-success-700">
                        Every team action is logged and auditable. Perfect for
                        compliance requirements and enterprise security
                        standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Dashboard */}
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-20 blur transition duration-300 group-hover:opacity-30"></div>
              <div className="relative rounded-3xl border border-gray-100 bg-white p-10 shadow-xl">
                <div className="mb-8 flex items-center space-x-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <ChartBar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Powerful Admin Dashboard
                    </h3>
                    <p className="font-medium text-purple-600">
                      Control everything from one place
                    </p>
                  </div>
                </div>

                <p className="mb-8 text-lg leading-relaxed text-gray-600">
                  A beautiful, comprehensive admin interface to manage users,
                  monitor revenue, track key metrics, and keep your finger on
                  the pulse of your growing business.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      User management and activity monitoring
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Revenue analytics and subscription insights
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      System health and performance metrics
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Email campaign management and logs
                    </span>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl bg-purple-50 p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                      <Bolt className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900">
                        Real-time Insights
                      </h4>
                      <p className="text-sm leading-relaxed text-purple-700">
                        Get instant notifications about important events, track
                        user behavior, and make informed decisions with
                        real-time data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="relative bg-gray-50 px-4 py-20">
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              And That's Not All
              <span className="block bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                We've Thought of Everything
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-gray-600">
              Every feature you need to launch and scale your SaaS, built with
              modern technologies and best practices.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Content & Blog */}
            <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <Chat className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Content Management
                </h3>
                <p className="mb-6 leading-relaxed text-gray-600">
                  Built-in CMS and blog system powered by Sails Content. Create
                  landing pages, write blog posts, and manage marketing content
                  without leaving your app.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    <span>Markdown editor with live preview</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    <span>SEO optimization built-in</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    <span>Custom page templates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email System */}
            <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                  <Envelope className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Transactional Email
                </h3>
                <p className="mb-6 leading-relaxed text-gray-600">
                  Beautiful email templates for onboarding, billing
                  notifications, password resets, and customer communication.
                  All automated and ready to go.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                    <span>Responsive HTML templates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                    <span>Event-triggered automation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                    <span>Delivery tracking & analytics</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Stack */}
            <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Code className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Modern Tech Stack
                </h3>
                <p className="mb-6 leading-relaxed text-gray-600">
                  Built with React 19, Sails.js, and Inertia.js. Modern tooling
                  with hot reload, TypeScript support, and everything you need
                  for rapid development.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                    <span>React 19 with modern hooks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                    <span>Tailwind CSS + PrimeReact</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                    <span>Database agnostic ORM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gray-900 px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900"></div>
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 transform rounded-full bg-brand-500/10 blur-3xl"></div>

        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            Ready to Ship Your
            <span className="block bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              Next Big Idea?
            </span>
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-gray-300">
            Stop wasting months on infrastructure. Start with a production-ready
            foundation and focus on what makes your SaaS unique.
          </p>

          <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/signup"
              className="hover:shadow-3xl group relative inline-block rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-10 py-5 text-lg font-bold text-white no-underline shadow-2xl transition-all duration-200 hover:scale-[1.02]"
            >
              <span className="relative z-10">Get Started Today</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-700 to-accent-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
            </a>
            <a
              href="YOUTUBE_VIDEO_URL"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-xl border-2 border-gray-600 bg-transparent px-10 py-5 text-lg font-bold text-white no-underline shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-brand-400 hover:bg-brand-500/10"
            >
              View Live Demo
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-success-500" />
              <span>Launch in hours, not months</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-success-500" />
              <span>Production-ready code</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-success-500" />
              <span>Your code, your control</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
