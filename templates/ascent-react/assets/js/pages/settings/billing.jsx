import { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { confirmDialog } from 'primereact/confirmdialog'
import { ProgressBar } from 'primereact/progressbar'

import DashboardLayout from '@/layouts/DashboardLayout'
import SettingsLayout from '@/layouts/SettingsLayout.jsx'

BillingSettings.layout = (page) => (
  <DashboardLayout title="Billing" maxWidth="narrow">
    {page}
  </DashboardLayout>
)

export default function BillingSettings({ subscription, plans }) {
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
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <i
                className="pi pi-credit-card text-3xl text-gray-400"
                aria-hidden="true"
              ></i>
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              No Active Subscription
            </h2>
            <p className="text-gray-600">
              Upgrade to unlock premium features and grow your business.
            </p>
          </header>

          <Link
            href="/pricing"
            className="inline-flex items-center rounded-lg border border-transparent bg-brand-600 px-6 py-3 text-base font-medium text-white no-underline transition-colors duration-200 hover:bg-brand-700"
          >
            <i className="pi pi-arrow-right mr-2"></i>
            View Pricing Plans
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Head title="Billing Settings | Ascent React"></Head>
      <ConfirmDialog style={{ width: '32rem' }} />

      <div className="max-w-4xl space-y-8">
        {/* Current Plan */}
        <section className="space-y-6">
          <header>
            <h3 className="text-sm font-medium text-gray-900">Current Plan</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your subscription and billing preferences.
            </p>
          </header>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                  <i className="pi pi-star text-brand-600"></i>
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {subscription.planName.charAt(0).toUpperCase() +
                        subscription.planName.slice(1)}{' '}
                      Plan
                    </h4>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {subscription.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
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
                    <i className="pi pi-external-link mr-2"></i>
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
              <h3 className="text-sm font-medium text-gray-900">
                Payment Method
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your current payment method for this subscription.
              </p>
            </header>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                    <i className="pi pi-credit-card text-gray-400"></i>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium capitalize text-gray-900">
                        {subscription.cardBrand} ••••{' '}
                        {subscription.cardLastFour}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Processed by {subscription.paymentProcessor}
                    </p>
                  </div>
                </div>
                {subscription.updatePaymentMethodUrl && (
                  <a
                    href={subscription.updatePaymentMethodUrl}
                    target="_blank"
                    className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-50"
                  >
                    <i className="pi pi-external-link mr-2"></i>
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
            <h3 className="text-sm font-medium text-gray-900">
              Full Billing Management
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Access your complete billing history, invoices, and subscription
              settings.
            </p>
          </header>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                  <i className="pi pi-receipt text-brand-600"></i>
                </div>
              </div>
              <h4 className="mb-2 text-lg font-medium text-gray-900">
                Customer Portal
              </h4>
              <p className="mb-4 text-sm text-gray-500">
                View invoices, download receipts, update payment methods, and
                manage your subscription.
              </p>
              {subscription.customerPortalUrl && (
                <a
                  href={subscription.customerPortalUrl}
                  target="_blank"
                  className="inline-flex items-center rounded-lg border border-brand-600 bg-brand-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors duration-200 hover:bg-brand-700"
                >
                  <i className="pi pi-external-link mr-2"></i>
                  Open Customer Portal
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
