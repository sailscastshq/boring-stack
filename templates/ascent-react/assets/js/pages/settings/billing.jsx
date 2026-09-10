import CheckCircle from '@/components/ui/icons/CheckCircle.jsx'
import DocumentText from '@/components/ui/icons/DocumentText.jsx'
import ExternalLink from '@/components/ui/icons/ExternalLink.jsx'
import ArrowRight from '@/components/ui/icons/ArrowRight.jsx'
import CreditCard from '@/components/ui/icons/CreditCard.jsx'
import { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { useConfirmation } from '@/hooks/useConfirmation'
import ConfirmationDialog from '@/components/ConfirmationDialog.jsx'

import DashboardLayout from '@/layouts/DashboardLayout'

BillingSettings.layout = [
  DashboardLayout,
  { title: 'Billing', maxWidth: 'narrow' }
]

export default function BillingSettings({ subscription, plans }) {
  const confirmation = useConfirmation()

  const isSubscribed = !!subscription

  const planConfig = subscription ? plans[subscription.planName] : null
  const planPrice = planConfig
    ? planConfig.variants[subscription.billingCycle]?.amount
    : 0

  if (!isSubscribed) {
    return (
      <>
        <Head title="Billing Settings | Ascent React"></Head>

        <div className="mx-auto max-w-2xl py-16 text-center">
          <header className="mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <CreditCard
                aria-hidden="true"
                className={'h-[1em] w-[1em] shrink-0 text-3xl text-gray-400'}
              ></CreditCard>
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              No Active Subscription
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Upgrade to unlock premium features and grow your business.
            </p>
          </header>

          <Link
            href="/pricing"
            className="inline-flex items-center rounded-lg border border-transparent bg-brand-600 px-6 py-3 text-base font-medium text-white no-underline transition-colors duration-200 hover:bg-brand-700"
          >
            <ArrowRight
              className={'mr-2 h-[1em] w-[1em] shrink-0'}
            ></ArrowRight>
            View Pricing Plans
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <>
        <Head title="Billing Settings | Ascent React"></Head>

        <div className="max-w-4xl space-y-8">
          {/* Current Plan */}
          <section className="space-y-6">
            <header>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Current Plan
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your subscription and billing preferences.
              </p>
            </header>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
                    <CheckCircle className="h-4 w-4 text-brand-600 dark:text-brand-300" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {subscription.planName.charAt(0).toUpperCase() +
                          subscription.planName.slice(1)}{' '}
                        Plan
                      </h4>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          subscription.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                        }`}
                      >
                        {subscription.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${planPrice}/{subscription.billingCycle} • Next billing:{' '}
                      {new Date(
                        subscription.nextBillingDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  {subscription.customerPortalUpdateSubscriptionUrl && (
                    <a
                      href={subscription.customerPortalUpdateSubscriptionUrl}
                      target="_blank"
                      className="inline-flex items-center rounded-lg border border-brand-600 bg-brand-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-brand-700"
                    >
                      <ExternalLink
                        className={'mr-2 h-[1em] w-[1em] shrink-0'}
                      ></ExternalLink>
                      Manage Subscription
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          {subscription.cardBrand && subscription.cardLastFour && (
            <section className="space-y-6">
              <header>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Payment Method
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your current payment method for this subscription.
                </p>
              </header>

              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-950">
                      <CreditCard
                        className={'h-[1em] w-[1em] shrink-0 text-gray-400'}
                      ></CreditCard>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium capitalize text-gray-900 dark:text-gray-100">
                          {subscription.cardBrand} ••••{' '}
                          {subscription.cardLastFour}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950/40 dark:text-green-300">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Processed by {subscription.paymentProcessor}
                      </p>
                    </div>
                  </div>
                  {subscription.updatePaymentMethodUrl && (
                    <a
                      href={subscription.updatePaymentMethodUrl}
                      target="_blank"
                      className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ExternalLink
                        className={'mr-2 h-[1em] w-[1em] shrink-0'}
                      ></ExternalLink>
                      Update
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Billing Management */}
          <section className="space-y-6">
            <header>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Full Billing Management
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Access your complete billing history, invoices, and subscription
                settings.
              </p>
            </header>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="text-center">
                <div className="mb-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
                    <DocumentText
                      className={'h-[1em] w-[1em] shrink-0 text-brand-600'}
                    ></DocumentText>
                  </div>
                </div>
                <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                  Customer Portal
                </h4>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  View invoices, download receipts, update payment methods, and
                  manage your subscription.
                </p>
                {subscription.customerPortalUrl && (
                  <a
                    href={subscription.customerPortalUrl}
                    target="_blank"
                    className="inline-flex items-center rounded-lg border border-brand-600 bg-brand-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-brand-700"
                  >
                    <ExternalLink
                      className={'mr-2 h-[1em] w-[1em] shrink-0'}
                    ></ExternalLink>
                    Open Customer Portal
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>
      </>
      <ConfirmationDialog state={confirmation} />
    </>
  )
}
