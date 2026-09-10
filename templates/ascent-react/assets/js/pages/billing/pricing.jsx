import ChevronDown from '@/components/ui/icons/ChevronDown.jsx'
import Check from '@/components/ui/icons/Check.jsx'
import { Head, Link, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'
import { useState } from 'react'

Pricing.layout = AppLayout
export default function Pricing({ plans }) {
  const page = usePage()
  const [billingCycle, setBillingCycle] = useState(() =>
    new URL(page.url, 'http://localhost').searchParams.get('cycle') === 'yearly'
      ? 'yearly'
      : 'monthly'
  )
  function selectCycle(cycle) {
    setBillingCycle(cycle)
    const url = new URL(window.location.href)
    url.searchParams.set('cycle', cycle)
    window.history.replaceState(window.history.state, '', url)
  }

  return (
    <>
      <Head title="Simple, Transparent Pricing - No Hidden Fees | Ascent" />

      {/* Hero Section */}
      <section className="ascent-page-heading">
        <h1>
          A plan for
          <br />
          your next stage.
        </h1>
        <p>
          Choose the space your team needs today, with room to grow tomorrow.
        </p>
        <div className="ascent-cycle" role="group" aria-label="Billing cycle">
          <button
            type="button"
            aria-pressed={billingCycle === 'monthly'}
            onClick={() => selectCycle('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={billingCycle === 'yearly'}
            onClick={() => selectCycle('yearly')}
          >
            Yearly · save 20%
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Starter Plan */}
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-xl  bg-gray-50 opacity-10 blur transition duration-300 group-hover:opacity-20 dark:bg-gray-950"></div>
              <div className="relative rounded-xl border border-gray-200 bg-white p-8 shadow-none dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Starter
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Perfect for side projects and small teams getting started
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-6xl font-bold text-gray-900 dark:text-gray-100">
                      ${plans.starter.variants[billingCycle].amount}
                    </span>
                    <span className="ml-2 text-lg font-medium text-gray-500 dark:text-gray-400">
                      /
                      {billingCycle === 'monthly'
                        ? 'month'
                        : 'month, billed yearly'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="mt-1 text-sm font-medium text-success-600 dark:text-success-300">
                      Save $
                      {plans.starter.variants.monthly.amount * 12 -
                        plans.starter.variants.yearly.amount * 12}{' '}
                      per year
                    </p>
                  )}
                </div>

                <div className="mb-8 space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    What's included:
                  </h4>

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 dark:bg-success-950/40">
                      <Check className="h-3 w-3 text-success-600 dark:text-success-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Up to 5 team members
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add your core team and start collaborating
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 dark:bg-success-950/40">
                      <Check className="h-3 w-3 text-success-600 dark:text-success-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Complete authentication system
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        OAuth, magic links, 2FA ready
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 dark:bg-success-950/40">
                      <Check className="h-3 w-3 text-success-600 dark:text-success-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Subscription billing
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Lemon Squeezy integration included
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 dark:bg-success-950/40">
                      <Check className="h-3 w-3 text-success-600 dark:text-success-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Email support
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get help when you need it
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 dark:bg-success-950/40">
                      <Check className="h-3 w-3 text-success-600 dark:text-success-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Basic analytics
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track key metrics and user activity
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href={`/checkout?plan=starter&billingCycle=${billingCycle}`}
                    className="block w-full rounded-xl border-2 border-gray-900 bg-gray-900 px-6 py-4 text-center text-lg font-bold text-white shadow-none transition-all duration-200 hover:bg-gray-800 dark:border-gray-700"
                  >
                    Get Started
                  </Link>
                  <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    Start your Starter subscription today
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Plan - Featured */}
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-xl  bg-gray-50 opacity-30 blur transition duration-300 group-hover:opacity-40 dark:bg-gray-950"></div>
              <div className="relative overflow-visible rounded-xl border border-brand-200 bg-white p-8 shadow-none dark:border-brand-900 dark:bg-gray-900">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Pro
                  </h3>
                  <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
                    For growing businesses that need advanced features and
                    priority support
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-6xl font-bold text-gray-900 dark:text-gray-100">
                      ${plans.pro.variants[billingCycle].amount}
                    </span>
                    <span className="ml-2 text-lg font-medium text-gray-500 dark:text-gray-400">
                      /
                      {billingCycle === 'monthly'
                        ? 'month'
                        : 'month, billed yearly'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="mt-1 text-sm font-medium text-success-600 dark:text-success-300">
                      Save $
                      {plans.pro.variants.monthly.amount * 12 -
                        plans.pro.variants.yearly.amount * 12}{' '}
                      per year
                    </p>
                  )}
                </div>

                <div className="mb-8 space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Everything in Starter, plus:
                  </h4>

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 dark:bg-success-950/40">
                      <Check className="h-3 w-3 text-success-600 dark:text-success-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Unlimited team members
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Scale your team without limits
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 dark:bg-success-950/40">
                      <Check className="h-3 w-3 text-success-600 dark:text-success-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Advanced role permissions
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Granular control over user access
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 dark:bg-success-950/40">
                      <Check className="h-3 w-3 text-success-600 dark:text-success-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Priority support
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get help in under 4 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 dark:bg-success-950/40">
                      <Check className="h-3 w-3 text-success-600 dark:text-success-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Advanced analytics & reporting
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Revenue tracking, cohort analysis, and more
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 dark:bg-success-950/40">
                      <Check className="h-3 w-3 text-success-600 dark:text-success-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Custom integrations
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Connect with your favorite tools
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success-100 dark:bg-success-950/40">
                      <Check className="h-3 w-3 text-success-600 dark:text-success-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        White-label options
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Brand the experience as your own
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href={`/checkout?plan=pro&billingCycle=${billingCycle}`}
                    className="block w-full rounded-xl  bg-brand-600 px-6 py-4 text-center text-lg font-bold text-white shadow-none transition-all duration-200 hover:brightness-95"
                  >
                    Get Started
                  </Link>
                  <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    Start your Pro subscription today
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="relative bg-gray-50 px-4 py-20 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
              Compare Plans
              <span className="block  text-brand-700 dark:text-brand-300">
                Choose What's Right for You
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-gray-600 dark:text-gray-400">
              Every plan includes our core features. Upgrade for advanced
              functionality and priority support.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-none dark:border-gray-700 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table
                className="w-full"
                role="table"
                aria-label="Plan features comparison"
              >
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950">
                    <th className="px-6 py-4 text-left">
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Features
                      </span>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          Starter
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ${plans.starter.variants[billingCycle].amount}/month
                        </div>
                      </div>
                    </th>
                    <th className="bg-brand-50 px-6 py-4 text-center dark:bg-brand-950/40">
                      <div>
                        <div className="text-lg font-bold text-brand-700 dark:text-brand-300">
                          Pro
                        </div>
                        <div className="text-sm text-brand-600 dark:text-brand-300">
                          ${plans.pro.variants[billingCycle].amount}/month
                        </div>
                        <div className="mt-1 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                          Most Popular
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-gray-50 dark:bg-gray-950">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                      Core Features
                    </td>
                    <td></td>
                    <td className="bg-brand-50/30 dark:bg-brand-950/40"></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Team Members
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                      Up to 5
                    </td>
                    <td className="bg-brand-50/30 px-6 py-4 text-center text-gray-700 dark:bg-brand-950/40 dark:text-gray-300">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Authentication System
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                    <td className="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Subscription Billing
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                    <td className="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Basic Analytics
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                    <td className="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                  </tr>

                  <tr className="bg-gray-50 dark:bg-gray-950">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                      Advanced Features
                    </td>
                    <td></td>
                    <td className="bg-brand-50/30 dark:bg-brand-950/40"></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Advanced Role Permissions
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Advanced Analytics & Reporting
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Custom Integrations
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      White-label Options
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                  </tr>

                  <tr className="bg-gray-50 dark:bg-gray-950">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                      Support
                    </td>
                    <td></td>
                    <td className="bg-brand-50/30 dark:bg-brand-950/40"></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Email Support
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                      Standard
                    </td>
                    <td className="bg-brand-50/30 px-6 py-4 text-center text-gray-700 dark:bg-brand-950/40 dark:text-gray-300">
                      Priority (4hr response)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Phone Support
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      Dedicated Account Manager
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="bg-brand-50/30 px-6 py-4 text-center dark:bg-brand-950/40">
                      <Check className="mx-auto h-5 w-5 text-success-600 dark:text-success-300" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative overflow-hidden bg-white px-4 py-20 dark:bg-gray-900">
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
              Frequently Asked
              <span className="block  text-brand-700 dark:text-brand-300">
                Questions
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            <details className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-none shadow-sm transition-all duration-300 dark:border-gray-700 dark:bg-gray-900">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600 dark:text-gray-100">
                  What's included in the free trial?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 transition-colors group-hover:bg-brand-100 dark:bg-brand-950/40">
                    <ChevronDown className="h-4 w-4 text-brand-600 transition-transform group-open:rotate-180 dark:text-brand-300" />
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                    Your 14-day free trial includes full access to all features
                    in your chosen plan. No credit card required to start, and
                    you can cancel anytime during the trial period.
                  </p>
                </div>
              </div>
            </details>

            <details className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-none shadow-sm transition-all duration-300 dark:border-gray-700 dark:bg-gray-900">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600 dark:text-gray-100">
                  Can I change plans later?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 transition-colors group-hover:bg-brand-100 dark:bg-brand-950/40">
                    <ChevronDown className="h-4 w-4 text-brand-600 transition-transform group-open:rotate-180 dark:text-brand-300" />
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                    Absolutely! You can upgrade or downgrade your plan at any
                    time. Changes take effect immediately, and we'll prorate any
                    billing differences.
                  </p>
                </div>
              </div>
            </details>

            <details className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-none shadow-sm transition-all duration-300 dark:border-gray-700 dark:bg-gray-900">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600 dark:text-gray-100">
                  Is there a setup fee or hidden costs?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 transition-colors group-hover:bg-brand-100 dark:bg-brand-950/40">
                    <ChevronDown className="h-4 w-4 text-brand-600 transition-transform group-open:rotate-180 dark:text-brand-300" />
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                    No setup fees, no hidden costs. The price you see is what
                    you pay. All features, integrations, and support are
                    included in your subscription.
                  </p>
                </div>
              </div>
            </details>

            <details className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-none shadow-sm transition-all duration-300 dark:border-gray-700 dark:bg-gray-900">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600 dark:text-gray-100">
                  What payment methods do you accept?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 transition-colors group-hover:bg-brand-100 dark:bg-brand-950/40">
                    <ChevronDown className="h-4 w-4 text-brand-600 transition-transform group-open:rotate-180 dark:text-brand-300" />
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                    We accept all major credit cards (Visa, MasterCard, American
                    Express) and PayPal. All payments are processed securely
                    through Lemon Squeezy.
                  </p>
                </div>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gray-900 px-4 py-20">
        <div className="absolute inset-0  bg-gray-50 dark:bg-gray-950"></div>
        <div className="hidden"></div>

        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
            Ready to Get
            <span className="block  text-brand-700 dark:text-brand-300">
              Started?
            </span>
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-gray-300">
            Join thousands of developers who are already building amazing SaaS
            products with our platform.
          </p>

          <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group relative inline-block rounded-xl bg-brand-600  px-10 py-5 text-lg font-bold text-white no-underline shadow-none transition-all duration-200 hover:brightness-95"
            >
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 rounded-xl  bg-gray-50 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-950"></div>
            </Link>
            <a
              href="YOUTUBE_VIDEO_URL"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-xl border-2 border-gray-600 bg-transparent px-10 py-5 text-lg font-bold text-white no-underline shadow-none transition-all duration-200 hover:border-brand-400 hover:bg-brand-500/10 hover:brightness-95 dark:border-gray-700"
            >
              See It in Action
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-success-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-success-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-success-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
