import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout.jsx'
import { useState } from 'react'

Pricing.layout = (page) => <AppLayout children={page} />
export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly')

  return (
    <>
      <Head title="Simple, Transparent Pricing - No Hidden Fees | Ascent" />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/30 via-white to-accent-50/20"></div>
        <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 transform rounded-full bg-brand-100/20 blur-3xl"></div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full bg-success-100 px-4 py-2 text-sm font-semibold text-success-700">
              💰 Simple Pricing
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            <span className="block leading-tight text-gray-900">
              Pricing That Makes
            </span>
            <span className="block bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text leading-tight text-transparent">
              Perfect Sense
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-gray-600">
            Start free, scale when you're ready. No hidden fees, no surprises.
            <span className="font-semibold text-gray-900">
              {' '}
              Just honest, transparent pricing that grows with your business.
            </span>
          </p>

          {/* Billing Toggle */}
          <div className="mb-16 flex flex-col items-center justify-center">
            <div className="relative inline-flex items-center rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
              {/* Sliding Background */}
              <div
                className={`absolute top-2 bottom-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 shadow-md transition-all duration-500 ease-in-out ${
                  billingCycle === 'monthly'
                    ? 'left-2 w-[160px]'
                    : 'left-[162px] w-[160px]'
                }`}
              />

              {/* Monthly Button */}
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`relative z-10 w-[160px] rounded-xl px-8 py-4 text-sm font-bold transition-colors duration-300 focus:outline-none ${
                  billingCycle === 'monthly'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Monthly
              </button>

              {/* Yearly Button */}
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`relative z-10 w-[160px] rounded-xl px-8 py-4 text-sm font-bold transition-colors duration-300 focus:outline-none ${
                  billingCycle === 'yearly'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Yearly
              </button>
            </div>

            {/* Savings indicator below toggle - always reserve space */}
            <div className="mt-3 h-6 flex items-center justify-center">
              {billingCycle === 'yearly' && (
                <div className="inline-flex items-center rounded-full bg-success-100 px-3 py-1 text-xs font-bold text-success-700 transition-all duration-300">
                  Save 20%
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Starter Plan */}
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-gray-600 to-gray-400 opacity-10 blur transition duration-300 group-hover:opacity-20"></div>
              <div className="relative rounded-3xl border border-gray-200 bg-white p-10 shadow-xl">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                  <p className="mt-2 text-gray-600">
                    Perfect for side projects and small teams getting started
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-6xl font-bold text-gray-900">
                      ${billingCycle === 'monthly' ? '29' : '23'}
                    </span>
                    <span className="ml-2 text-lg font-medium text-gray-500">
                      /
                      {billingCycle === 'monthly'
                        ? 'month'
                        : 'month, billed yearly'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="mt-1 text-sm text-success-600 font-medium">
                      Save $72 per year
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-gray-900">
                    What's included:
                  </h4>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100 mt-0.5">
                      <svg
                        className="h-3 w-3 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Up to 5 team members
                      </p>
                      <p className="text-sm text-gray-500">
                        Add your core team and start collaborating
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100 mt-0.5">
                      <svg
                        className="h-3 w-3 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Complete authentication system
                      </p>
                      <p className="text-sm text-gray-500">
                        OAuth, magic links, 2FA ready
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100 mt-0.5">
                      <svg
                        className="h-3 w-3 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Subscription billing
                      </p>
                      <p className="text-sm text-gray-500">
                        Lemon Squeezy integration included
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100 mt-0.5">
                      <svg
                        className="h-3 w-3 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email support</p>
                      <p className="text-sm text-gray-500">
                        Get help when you need it
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100 mt-0.5">
                      <svg
                        className="h-3 w-3 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Basic analytics
                      </p>
                      <p className="text-sm text-gray-500">
                        Track key metrics and user activity
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="block w-full rounded-xl border-2 border-gray-900 bg-gray-900 px-6 py-4 text-center text-lg font-bold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg"
                  >
                    Start Free Trial
                  </Link>
                  <p className="mt-3 text-center text-sm text-gray-500">
                    14-day free trial, no credit card required
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Plan - Featured */}
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-brand-600 to-accent-600 opacity-30 blur transition duration-300 group-hover:opacity-40"></div>
              <div className="relative rounded-3xl border border-brand-200 bg-white p-10 shadow-2xl overflow-hidden">
                {/* Ribbon Banner */}
                <div className="absolute top-6 -right-12 w-48 py-2 bg-gradient-to-r from-brand-600 to-accent-600 text-white text-xs font-bold text-center transform rotate-45 shadow-lg z-10">
                  MOST POPULAR
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                  <p className="mt-2 text-gray-600">
                    For growing businesses that need advanced features and
                    priority support
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-6xl font-bold text-gray-900">
                      ${billingCycle === 'monthly' ? '89' : '71'}
                    </span>
                    <span className="ml-2 text-lg font-medium text-gray-500">
                      /
                      {billingCycle === 'monthly'
                        ? 'month'
                        : 'month, billed yearly'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="mt-1 text-sm text-success-600 font-medium">
                      Save $216 per year
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-gray-900">
                    Everything in Starter, plus:
                  </h4>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100 mt-0.5">
                      <svg
                        className="h-3 w-3 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Unlimited team members
                      </p>
                      <p className="text-sm text-gray-500">
                        Scale your team without limits
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100 mt-0.5">
                      <svg
                        className="h-3 w-3 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Advanced role permissions
                      </p>
                      <p className="text-sm text-gray-500">
                        Granular control over user access
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100 mt-0.5">
                      <svg
                        className="h-3 w-3 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Priority support
                      </p>
                      <p className="text-sm text-gray-500">
                        Get help in under 4 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100 mt-0.5">
                      <svg
                        className="h-3 w-3 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Advanced analytics & reporting
                      </p>
                      <p className="text-sm text-gray-500">
                        Revenue tracking, cohort analysis, and more
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100 mt-0.5">
                      <svg
                        className="h-3 w-3 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Custom integrations
                      </p>
                      <p className="text-sm text-gray-500">
                        Connect with your favorite tools
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100 mt-0.5">
                      <svg
                        className="h-3 w-3 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        White-label options
                      </p>
                      <p className="text-sm text-gray-500">
                        Brand the experience as your own
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="block w-full rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-6 py-4 text-center text-lg font-bold text-white shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]"
                  >
                    Start Free Trial
                  </Link>
                  <p className="mt-3 text-center text-sm text-gray-500">
                    14-day free trial, no credit card required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="relative bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Compare Plans
              <span className="block bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                Choose What's Right for You
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-gray-600">
              Every plan includes our core features. Upgrade for advanced
              functionality and priority support.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left">
                      <span className="text-lg font-semibold text-gray-900">
                        Features
                      </span>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          Starter
                        </div>
                        <div className="text-sm text-gray-500">
                          ${billingCycle === 'monthly' ? '29' : '23'}/month
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center bg-brand-50">
                      <div>
                        <div className="text-lg font-bold text-brand-700">
                          Pro
                        </div>
                        <div className="text-sm text-brand-600">
                          ${billingCycle === 'monthly' ? '89' : '71'}/month
                        </div>
                        <div className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 mt-1">
                          Most Popular
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      Core Features
                    </td>
                    <td></td>
                    <td className="bg-brand-50/30"></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Team Members</td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      Up to 5
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700 bg-brand-50/30">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">
                      Authentication System
                    </td>
                    <td className="px-6 py-4 text-center">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                    <td className="px-6 py-4 text-center bg-brand-50/30">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">
                      Subscription Billing
                    </td>
                    <td className="px-6 py-4 text-center">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                    <td className="px-6 py-4 text-center bg-brand-50/30">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Basic Analytics</td>
                    <td className="px-6 py-4 text-center">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                    <td className="px-6 py-4 text-center bg-brand-50/30">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                  </tr>

                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      Advanced Features
                    </td>
                    <td></td>
                    <td className="bg-brand-50/30"></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">
                      Advanced Role Permissions
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="px-6 py-4 text-center bg-brand-50/30">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">
                      Advanced Analytics & Reporting
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="px-6 py-4 text-center bg-brand-50/30">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">
                      Custom Integrations
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="px-6 py-4 text-center bg-brand-50/30">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">
                      White-label Options
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="px-6 py-4 text-center bg-brand-50/30">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                  </tr>

                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      Support
                    </td>
                    <td></td>
                    <td className="bg-brand-50/30"></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Email Support</td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      Standard
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700 bg-brand-50/30">
                      Priority (4hr response)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Phone Support</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="px-6 py-4 text-center bg-brand-50/30">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">
                      Dedicated Account Manager
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">–</span>
                    </td>
                    <td className="px-6 py-4 text-center bg-brand-50/30">
                      <svg
                        className="mx-auto h-5 w-5 text-success-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative overflow-hidden bg-white px-4 py-20">
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Frequently Asked
              <span className="block bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            <details className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                  What's included in the free trial?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 transition-colors group-hover:bg-brand-100">
                    <svg
                      className="h-4 w-4 text-brand-600 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4">
                  <p className="leading-relaxed text-gray-600">
                    Your 14-day free trial includes full access to all features
                    in your chosen plan. No credit card required to start, and
                    you can cancel anytime during the trial period.
                  </p>
                </div>
              </div>
            </details>

            <details className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                  Can I change plans later?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 transition-colors group-hover:bg-brand-100">
                    <svg
                      className="h-4 w-4 text-brand-600 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4">
                  <p className="leading-relaxed text-gray-600">
                    Absolutely! You can upgrade or downgrade your plan at any
                    time. Changes take effect immediately, and we'll prorate any
                    billing differences.
                  </p>
                </div>
              </div>
            </details>

            <details className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                  Is there a setup fee or hidden costs?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 transition-colors group-hover:bg-brand-100">
                    <svg
                      className="h-4 w-4 text-brand-600 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4">
                  <p className="leading-relaxed text-gray-600">
                    No setup fees, no hidden costs. The price you see is what
                    you pay. All features, integrations, and support are
                    included in your subscription.
                  </p>
                </div>
              </div>
            </details>

            <details className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
              <summary className="flex cursor-pointer list-none items-center justify-between p-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                  What payment methods do you accept?
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 transition-colors group-hover:bg-brand-100">
                    <svg
                      className="h-4 w-4 text-brand-600 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-gray-100 pt-4">
                  <p className="leading-relaxed text-gray-600">
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
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900"></div>
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 transform rounded-full bg-brand-500/10 blur-3xl"></div>

        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            Ready to Get
            <span className="block bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
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
              className="hover:shadow-3xl group relative inline-block rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all duration-200 hover:scale-[1.02] no-underline"
            >
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-700 to-accent-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
            </Link>
            <a
              href="YOUTUBE_VIDEO_URL"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-xl border-2 border-gray-600 bg-transparent px-10 py-5 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-brand-400 hover:bg-brand-500/10 no-underline"
            >
              See It in Action
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-success-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-success-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-success-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
