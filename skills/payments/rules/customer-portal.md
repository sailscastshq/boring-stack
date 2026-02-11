---
name: customer-portal
description: Lemon Squeezy hosted customer portal, subscription management URLs, payment method updates, cancellation, plan changes, and billing settings integration
metadata:
  tags: customer-portal, lemon-squeezy, subscription-management, cancel, payment-method, invoices, plan-change
---

# Customer Portal

## Overview

Lemon Squeezy provides a hosted customer portal where subscribers can manage their subscriptions without you building custom UI for sensitive billing operations. The portal handles:

- Updating payment methods
- Cancelling subscriptions
- Resuming cancelled subscriptions
- Changing plans (upgrades and downgrades)
- Viewing invoices and receipts

Your app links to the portal from the billing settings page. When the user makes changes in the portal (e.g., cancels or changes plan), Lemon Squeezy sends a `subscription_updated` webhook to your app, which updates the local Subscription record.

## Subscription Management URLs

Lemon Squeezy provides customer portal URLs through the subscription object returned by its API. These URLs are specific to each subscription and allow the customer to manage that subscription.

### Fetching Portal URLs

Use the Lemon Squeezy API to get the subscription's management URLs:

```js
// api/helpers/subscription/get-portal-url.js
module.exports = {
  friendlyName: 'Get portal URL',

  description: 'Get the Lemon Squeezy customer portal URL for a subscription.',

  inputs: {
    subscriptionId: {
      type: 'string',
      required: true,
      description: 'The Lemon Squeezy subscription ID.'
    }
  },

  exits: {
    success: {
      description: 'Returns the portal URLs.'
    },
    notFound: {
      description: 'Subscription not found on Lemon Squeezy.'
    }
  },

  fn: async function ({ subscriptionId }) {
    const apiKey = sails.config.pay.providers.lemonsqueezy.apiKey

    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/vnd.api+json'
        }
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw 'notFound'
      }
      throw new Error(`Lemon Squeezy API error: ${response.status}`)
    }

    const data = await response.json()
    const urls = data.data.attributes.urls

    return {
      updatePaymentMethod: urls.update_payment_method,
      customerPortal: urls.customer_portal
    }
  }
}
```

### Portal URL Structure

The Lemon Squeezy subscription object includes these URLs in its `urls` attribute:

| URL                          | Purpose                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `urls.update_payment_method` | Direct link to update the payment method for this subscription.                              |
| `urls.customer_portal`       | Full customer portal page where the subscriber can manage all aspects of their subscription. |

These URLs are unique to each subscription and contain authentication tokens, so the subscriber does not need to log in to Lemon Squeezy separately.

## Building the Billing Settings Page with Portal Links

### Controller

```js
// api/controllers/billing/view-billing.js
module.exports = {
  exits: {
    success: { responseType: 'inertia' }
  },

  fn: async function () {
    const teamId = this.req.session.teamId
    const planInfo = await sails.helpers.subscription.checkPlan(teamId)

    let portalUrls = null

    // Only fetch portal URLs if there is an active or cancelled subscription
    if (planInfo.subscription) {
      try {
        portalUrls = await sails.helpers.subscription.getPortalUrl(
          planInfo.subscription.subscriptionId
        )
      } catch (err) {
        sails.log.warn('Could not fetch portal URLs:', err.message)
        // Continue without portal URLs -- the page still renders
      }
    }

    return {
      page: 'billing/settings',
      props: {
        planInfo,
        portalUrls,
        plans: sails.config.pay.plans
      }
    }
  }
}
```

### React Component with Portal Links

```jsx
// assets/js/pages/billing/settings.jsx
import { Link } from '@inertiajs/react'

export default function BillingSettings({ planInfo, portalUrls, plans }) {
  return (
    <div>
      <h1>Billing Settings</h1>

      {/* Current Plan Section */}
      <section>
        <h2>Current Plan</h2>
        <p>
          <strong>{planInfo.planName}</strong>
          {planInfo.billingCycle && ` (billed ${planInfo.billingCycle})`}
        </p>

        {planInfo.subscription && (
          <div>
            <p>Status: {planInfo.subscription.status}</p>
            {planInfo.subscription.nextBillingDate && (
              <p>
                Next billing date:{' '}
                {new Date(
                  planInfo.subscription.nextBillingDate
                ).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {planInfo.plan === 'free' && (
          <div>
            <p>You are on the Free plan.</p>
            <Link href="/pricing">View plans and upgrade</Link>
          </div>
        )}
      </section>

      {/* Subscription Management Section */}
      {portalUrls && (
        <section>
          <h2>Manage Subscription</h2>

          {/* Customer Portal -- full management page */}
          <a
            href={portalUrls.customerPortal}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open customer portal
          </a>

          {/* Direct action links */}
          <div>
            <a
              href={portalUrls.updatePaymentMethod}
              target="_blank"
              rel="noopener noreferrer"
            >
              Update payment method
            </a>
          </div>
        </section>
      )}

      {/* Cancellation Notice */}
      {planInfo.subscription?.status === 'cancelled' && (
        <section>
          <h2>Subscription Cancelled</h2>
          <p>
            Your subscription has been cancelled. You will retain access to{' '}
            {planInfo.planName} features until{' '}
            {new Date(
              planInfo.subscription.currentPeriodEnd
            ).toLocaleDateString()}
            .
          </p>
          {portalUrls && (
            <p>
              Changed your mind?{' '}
              <a
                href={portalUrls.customerPortal}
                target="_blank"
                rel="noopener noreferrer"
              >
                Resume your subscription
              </a>
            </p>
          )}
        </section>
      )}

      {/* Payment Issue Notice */}
      {planInfo.subscription?.status === 'past_due' && portalUrls && (
        <section>
          <h2>Payment Issue</h2>
          <p>
            Your last payment failed. Please update your payment method to avoid
            losing access to {planInfo.planName} features.
          </p>
          <a
            href={portalUrls.updatePaymentMethod}
            target="_blank"
            rel="noopener noreferrer"
          >
            Update payment method
          </a>
        </section>
      )}

      {/* Usage Section */}
      <section>
        <h2>Usage</h2>
        <p>
          Team members: {planInfo.memberCount}
          {planInfo.memberLimit !== -1 && ` / ${planInfo.memberLimit}`}
        </p>
      </section>
    </div>
  )
}
```

### Vue Component with Portal Links

```vue
<!-- assets/js/pages/billing/settings.vue -->
<script setup>
import { Link } from '@inertiajs/vue3'

const props = defineProps({
  planInfo: Object,
  portalUrls: Object,
  plans: Object
})
</script>

<template>
  <div>
    <h1>Billing Settings</h1>

    <section>
      <h2>Current Plan</h2>
      <p>
        <strong>{{ planInfo.planName }}</strong>
        <span v-if="planInfo.billingCycle">
          (billed {{ planInfo.billingCycle }})</span
        >
      </p>

      <div v-if="planInfo.subscription">
        <p>Status: {{ planInfo.subscription.status }}</p>
        <p v-if="planInfo.subscription.nextBillingDate">
          Next billing date:
          {{
            new Date(planInfo.subscription.nextBillingDate).toLocaleDateString()
          }}
        </p>
      </div>

      <div v-if="planInfo.plan === 'free'">
        <p>You are on the Free plan.</p>
        <Link href="/pricing">View plans and upgrade</Link>
      </div>
    </section>

    <section v-if="portalUrls">
      <h2>Manage Subscription</h2>
      <a
        :href="portalUrls.customerPortal"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open customer portal
      </a>
      <div>
        <a
          :href="portalUrls.updatePaymentMethod"
          target="_blank"
          rel="noopener noreferrer"
        >
          Update payment method
        </a>
      </div>
    </section>

    <section v-if="planInfo.subscription?.status === 'cancelled'">
      <h2>Subscription Cancelled</h2>
      <p>
        Your subscription has been cancelled. You will retain access to
        {{ planInfo.planName }} features until
        {{
          new Date(planInfo.subscription.currentPeriodEnd).toLocaleDateString()
        }}.
      </p>
      <p v-if="portalUrls">
        Changed your mind?
        <a
          :href="portalUrls.customerPortal"
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume your subscription
        </a>
      </p>
    </section>

    <section v-if="planInfo.subscription?.status === 'past_due' && portalUrls">
      <h2>Payment Issue</h2>
      <p>
        Your last payment failed. Please update your payment method to avoid
        losing access to {{ planInfo.planName }} features.
      </p>
      <a
        :href="portalUrls.updatePaymentMethod"
        target="_blank"
        rel="noopener noreferrer"
      >
        Update payment method
      </a>
    </section>

    <section>
      <h2>Usage</h2>
      <p>
        Team members: {{ planInfo.memberCount }}
        <span v-if="planInfo.memberLimit !== -1">
          / {{ planInfo.memberLimit }}</span
        >
      </p>
    </section>
  </div>
</template>
```

## Plan Changes Through the Portal

When a subscriber wants to upgrade or downgrade their plan, direct them to the Lemon Squeezy customer portal. The portal handles proration calculations and payment adjustments automatically.

### How Plan Changes Work

1. User clicks "Open customer portal" on your billing settings page
2. In the Lemon Squeezy portal, user selects a different plan or variant
3. Lemon Squeezy processes the change (prorates the charge)
4. Lemon Squeezy sends a `subscription_updated` webhook to your app
5. Your webhook handler updates the local Subscription record with the new `planName` and `billingCycle`
6. The next time the user visits the billing page, it shows the updated plan

### Webhook Processing for Plan Changes

The `subscription_updated` event includes the new `variant_id`. The webhook handler calls `getPlanFromVariantId()` to resolve the new plan:

```js
// In the webhook handler (subscription_updated case):
const variantId = subscriptionData.variant_id.toString()
const planInfo = getPlanFromVariantId(variantId)

if (planInfo) {
  updateData.planName = planInfo.planSlug
  updateData.billingCycle = planInfo.billingCycle
}
```

This means the same webhook handler that processes renewals and cancellations also handles plan changes automatically.

## Cancellation Handling

### The Cancellation Flow

1. User clicks "Open customer portal" on your billing settings page
2. In the portal, user initiates cancellation
3. Lemon Squeezy processes the cancellation request
4. Lemon Squeezy sends a `subscription_updated` webhook with `status: 'cancelled'`
5. Your webhook handler updates the local Subscription status to `cancelled`
6. The user retains access until `currentPeriodEnd`
7. When the period ends, Lemon Squeezy sends another `subscription_updated` with `status: 'expired'`
8. Your webhook handler updates the status to `expired`
9. The `checkPlan` helper now returns free tier info (no active subscription)

### Cancelled vs Expired

A **cancelled** subscription is still usable. The user paid for the current period and should retain access. An **expired** subscription has reached the end of the paid period and the user should be downgraded.

```js
// In your checkPlan helper or policies:
const subscription = await Subscription.findOne({
  team: teamId,
  status: { in: ['active', 'cancelled'] } // Both are usable
})
```

If you only query for `status: 'active'`, cancelled subscribers will lose access immediately, which is unfair. Include `cancelled` in your usable statuses.

### Resuming a Cancelled Subscription

Users can resume a cancelled subscription before the period ends through the Lemon Squeezy customer portal. When they resume, Lemon Squeezy sends a `subscription_updated` webhook with `status: 'active'`, and your webhook handler restores the status.

## Invoice and Receipt Access

The Lemon Squeezy customer portal provides access to all invoices and receipts. Subscribers can view and download PDF receipts for each payment directly from the portal.

If you need to display invoice history within your app, use the Lemon Squeezy API:

```js
// api/helpers/subscription/get-invoices.js
module.exports = {
  friendlyName: 'Get invoices',

  description: 'Fetch invoice history from Lemon Squeezy for a subscription.',

  inputs: {
    subscriptionId: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: { description: 'Returns array of invoice objects.' }
  },

  fn: async function ({ subscriptionId }) {
    const apiKey = sails.config.pay.providers.lemonsqueezy.apiKey

    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscription-invoices?filter[subscription_id]=${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/vnd.api+json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Lemon Squeezy API error: ${response.status}`)
    }

    const data = await response.json()

    return data.data.map((invoice) => ({
      id: invoice.id,
      status: invoice.attributes.status,
      total: invoice.attributes.total_formatted,
      createdAt: invoice.attributes.created_at,
      receiptUrl: invoice.attributes.urls.invoice_url
    }))
  }
}
```

### Displaying Invoices on the Billing Page

```js
// In the billing controller:
fn: async function () {
  const teamId = this.req.session.teamId
  const planInfo = await sails.helpers.subscription.checkPlan(teamId)

  let portalUrls = null
  let invoices = []

  if (planInfo.subscription) {
    try {
      portalUrls = await sails.helpers.subscription.getPortalUrl(
        planInfo.subscription.subscriptionId
      )
      invoices = await sails.helpers.subscription.getInvoices(
        planInfo.subscription.subscriptionId
      )
    } catch (err) {
      sails.log.warn('Could not fetch billing data:', err.message)
    }
  }

  return {
    page: 'billing/settings',
    props: { planInfo, portalUrls, invoices, plans: sails.config.pay.plans }
  }
}
```

```jsx
{
  /* Invoice History */
}
{
  invoices.length > 0 && (
    <section>
      <h2>Invoice History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
              <td>{invoice.total}</td>
              <td>{invoice.status}</td>
              <td>
                <a
                  href={invoice.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View receipt
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
```

## Caching Portal URLs

Portal URLs are relatively stable but may expire. For performance, you can cache them and refresh periodically rather than fetching on every page load:

```js
// api/helpers/subscription/get-portal-url.js
// Add basic in-memory caching
const cache = new Map()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

module.exports = {
  friendlyName: 'Get portal URL',

  inputs: {
    subscriptionId: { type: 'string', required: true }
  },

  fn: async function ({ subscriptionId }) {
    const cached = cache.get(subscriptionId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.urls
    }

    const apiKey = sails.config.pay.providers.lemonsqueezy.apiKey
    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/vnd.api+json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Lemon Squeezy API error: ${response.status}`)
    }

    const data = await response.json()
    const urls = {
      updatePaymentMethod: data.data.attributes.urls.update_payment_method,
      customerPortal: data.data.attributes.urls.customer_portal
    }

    cache.set(subscriptionId, { urls, timestamp: Date.now() })
    return urls
  }
}
```

This avoids an API call on every billing page load while ensuring the URLs are refreshed at least once per hour.
