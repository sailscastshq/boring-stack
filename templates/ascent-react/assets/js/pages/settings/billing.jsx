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

export default function BillingSettings() {
  const [isSubscribed] = useState(true) // Set to true to show full billing interface
  const [currentPlan] = useState('Pro')
  const [billingCycle] = useState('monthly')

  // Mock data - replace with real data from your backend
  const subscription = {
    plan: 'Pro',
    status: 'active',
    price: 29,
    currency: 'USD',
    cycle: 'monthly',
    nextBilling: '2024-02-15'
  }

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiry: '12/26',
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      brand: 'mastercard',
      last4: '8888',
      expiry: '09/25',
      isDefault: false
    }
  ]

  const invoices = [
    {
      id: 'inv_001',
      date: 'Jan 15, 2024',
      amount: 29.0,
      status: 'paid',
      description: 'Pro Plan'
    },
    {
      id: 'inv_002',
      date: 'Dec 15, 2023',
      amount: 29.0,
      status: 'paid',
      description: 'Pro Plan'
    },
    {
      id: 'inv_003',
      date: 'Nov 15, 2023',
      amount: 38.75,
      status: 'past_due',
      description: 'Turbo Plan'
    },
    {
      id: 'inv_004',
      date: 'Oct 15, 2023',
      amount: 0.0,
      status: 'paid',
      description: 'Starter Plan'
    }
  ]

  function handleCancelSubscription() {
    confirmDialog({
      message:
        'Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing cycle.',
      header: 'Cancel Subscription',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Cancel Subscription',
      rejectLabel: 'Keep Subscription',
      accept: () => {
        console.log('Subscription cancelled')
      }
    })
  }

  function removePaymentMethod(methodId) {
    confirmDialog({
      message: 'Are you sure you want to remove this payment method?',
      header: 'Remove Payment Method',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => {
        console.log('Payment method removed:', methodId)
      }
    })
  }

  if (!isSubscribed) {
    return (
      <>
        <Head title="Billing Settings | Ascent React"></Head>

        <div className="mx-auto max-w-2xl py-16 text-center">
          <div className="mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <i className="pi pi-credit-card text-3xl text-gray-400"></i>
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              No Active Subscription
            </h2>
            <p className="text-gray-600">
              Upgrade to unlock premium features and grow your business.
            </p>
          </div>

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
      <ConfirmDialog />

      <div className="max-w-4xl space-y-8">
        {/* Current Plan */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Current Plan</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your subscription and billing preferences.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                  <i className="pi pi-star text-brand-600"></i>
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {subscription.plan} Plan
                    </h4>
                    <Tag
                      value={subscription.status.toUpperCase()}
                      style={{ background: '#10B981' }}
                      className="rounded-md border-0 px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    ${subscription.price}/{subscription.cycle} • Next billing:{' '}
                    {subscription.nextBilling}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  label="Change Plan"
                  outlined
                  size="small"
                  icon="pi pi-refresh"
                />
                <Button
                  label="Cancel"
                  size="small"
                  icon="pi pi-times"
                  outlined
                  severity="danger"
                  onClick={handleCancelSubscription}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Payment Methods
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your payment methods and billing information.
              </p>
            </div>
            <Button
              label="Add Method"
              size="small"
              icon="pi pi-plus"
              outlined
              severity="secondary"
            />
          </div>

          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                      <i className="pi pi-credit-card text-gray-400"></i>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium capitalize text-gray-900">
                          {method.brand} •••• {method.last4}
                        </span>
                        {method.isDefault && (
                          <Tag
                            value="DEFAULT"
                            className="rounded-md border-0 bg-gray-200 px-2 py-1 text-xs text-gray-700"
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Expires {method.expiry}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button
                        label="Set Default"
                        size="small"
                        severity="secondary"
                        text
                      />
                    )}
                    <Button
                      icon="pi pi-trash"
                      size="small"
                      severity="danger"
                      onClick={() => removePaymentMethod(method.id)}
                      tooltip="Remove payment method"
                      text
                      disabled={method.isDefault}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-900">
                Invoice History
              </h3>
            </div>
            <Button
              label="View All"
              size="small"
              link
              icon="pi pi-external-link"
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 border-b border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Date
              </div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Amount
              </div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Plan
              </div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Action
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="grid grid-cols-5 gap-4 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="text-sm text-gray-900">{invoice.date}</div>
                  <div className="text-sm font-medium text-gray-900">
                    ${invoice.amount.toFixed(2)}
                  </div>
                  <div className="flex items-center">
                    <Tag
                      value={invoice.status === 'paid' ? 'Paid' : 'Past due'}
                      style={{
                        background:
                          invoice.status === 'paid' ? '#10B981' : '#EF4444'
                      }}
                      className="rounded-md border-0 px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div className="text-sm text-gray-900">
                    {invoice.description}
                  </div>
                  <div className="flex items-center">
                    <Button
                      icon="pi pi-download"
                      size="small"
                      text
                      tooltip="Download invoice"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
