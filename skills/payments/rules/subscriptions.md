---
name: subscriptions
description: Subscription model, status lifecycle, checkPlan helper, plan limits and enforcement, free tier handling, billing settings page
metadata:
  tags: subscriptions, subscription-model, status, checkPlan, billing, plan-limits, free-tier, team
---

# Subscriptions

## Subscription Model Overview

The `Subscription` model is the central record for tracking a team's billing state. Each team has at most one active subscription. The model stores the external Lemon Squeezy subscription ID, the current plan, billing cycle, status, and billing period dates.

```js
// api/models/Subscription.js
module.exports = {
  attributes: {
    subscriptionId: {
      type: 'string',
      columnName: 'subscription_id'
    },
    status: {
      type: 'string',
      isIn: ['active', 'cancelled', 'expired', 'past_due', 'unpaid']
    },
    planName: {
      type: 'string',
      isIn: ['starter', 'pro'],
      columnName: 'plan_name'
    },
    billingCycle: {
      type: 'string',
      isIn: ['monthly', 'yearly'],
      columnName: 'billing_cycle'
    },
    currentPeriodStart: {
      type: 'string',
      columnName: 'current_period_start'
    },
    currentPeriodEnd: {
      type: 'string',
      columnName: 'current_period_end'
    },
    nextBillingDate: {
      type: 'string',
      columnName: 'next_billing_date'
    },
    team: {
      model: 'Team'
    }
  }
}
```

## Status Lifecycle

Subscription status tracks the billing state from Lemon Squeezy:

| Status      | Meaning                                                                    | What Happens                                           |
| ----------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| `active`    | Subscription is current and paid.                                          | Full access to plan features.                          |
| `cancelled` | User cancelled, but the subscription remains active until the period ends. | Full access until `currentPeriodEnd`.                  |
| `past_due`  | A payment failed. Lemon Squeezy is retrying.                               | Access may continue during retry window (your choice). |
| `unpaid`    | All payment retries exhausted.                                             | Restrict access. Prompt user to update payment method. |
| `expired`   | The subscription period ended after cancellation or unpaid status.         | Downgrade to free tier.                                |

### Status Transitions

```
New checkout → active
active → cancelled       (user cancels via portal)
active → past_due        (payment fails)
cancelled → expired      (period ends)
past_due → active        (retry succeeds)
past_due → unpaid        (retries exhausted)
unpaid → expired         (grace period ends)
```

The status is always updated via webhooks from Lemon Squeezy. Never change subscription status directly in your app -- always let the webhook handler process the authoritative events from the payment provider.

## The checkPlan Helper

The `checkPlan` helper is the primary way to check a team's subscription status and enforce plan limits. It returns a standardized object with the current plan details, usage, and limits.

```js
// api/helpers/subscription/check-plan.js
module.exports = {
  friendlyName: 'Check plan',

  description: 'Check the current plan and limits for a team.',

  inputs: {
    teamId: {
      type: 'number',
      required: true,
      description: 'The team ID to check.'
    }
  },

  exits: {
    success: {
      description: 'Returns the plan info.'
    }
  },

  fn: async function ({ teamId }) {
    // Find active subscription for this team
    const subscription = await Subscription.findOne({
      team: teamId,
      status: 'active'
    })

    // Count current team members
    const memberCount = await Membership.count({ team: teamId })

    // No active subscription = free tier
    if (!subscription) {
      return {
        plan: 'free',
        planName: 'Free',
        memberLimit: 1,
        memberCount,
        canAddMember: memberCount < 1,
        subscription: null,
        billingCycle: null
      }
    }

    // Look up plan config
    const planConfig = sails.config.pay.plans[subscription.planName]
    const memberLimit = planConfig.memberLimit

    return {
      plan: subscription.planName,
      planName: planConfig.name,
      memberLimit,
      memberCount,
      canAddMember: memberLimit === -1 || memberCount < memberLimit,
      subscription: {
        id: subscription.id,
        subscriptionId: subscription.subscriptionId,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        nextBillingDate: subscription.nextBillingDate
      },
      billingCycle: subscription.billingCycle
    }
  }
}
```

### checkPlan Return Value

| Field          | Type        | Description                                                     |
| -------------- | ----------- | --------------------------------------------------------------- |
| `plan`         | string      | The plan slug: `'free'`, `'starter'`, or `'pro'`.               |
| `planName`     | string      | The display name: `'Free'`, `'Starter'`, or `'Pro'`.            |
| `memberLimit`  | number      | Maximum team members. `-1` means unlimited.                     |
| `memberCount`  | number      | Current number of team members.                                 |
| `canAddMember` | boolean     | Whether the team can add another member under the current plan. |
| `subscription` | object/null | The subscription details, or `null` for free tier.              |
| `billingCycle` | string/null | `'monthly'`, `'yearly'`, or `null` for free tier.               |

### Using checkPlan in Actions

```js
// api/controllers/team/add-member.js
module.exports = {
  inputs: {
    email: { type: 'string', required: true, isEmail: true }
  },

  exits: {
    success: { responseType: 'redirect' },
    badRequest: { responseType: 'badRequest' }
  },

  fn: async function ({ email }) {
    const teamId = this.req.session.teamId
    const planInfo = await sails.helpers.subscription.checkPlan(teamId)

    if (!planInfo.canAddMember) {
      throw {
        badRequest: {
          problems: [
            {
              email: `Your ${planInfo.planName} plan allows up to ${planInfo.memberLimit} members. Please upgrade to add more.`
            }
          ]
        }
      }
    }

    // Proceed to add the member...
    await Membership.create({ team: teamId, email })
    sails.inertia.flash('success', `Invited ${email} to the team.`)
    return '/team/members'
  }
}
```

### Using checkPlan in the Custom Hook

Share plan information with every Inertia page:

```js
// api/hooks/custom/index.js (inside routes.before)
sails.inertia.share(
  'planInfo',
  sails.inertia.once(async () => {
    if (!req.session.teamId) return null
    return await sails.helpers.subscription.checkPlan(req.session.teamId)
  })
)
```

This makes `planInfo` available as a prop on every page, so the frontend can show upgrade prompts, disable features, or display usage information.

## Free Tier Handling

When a team has no active subscription, they are on the free tier. The `checkPlan` helper returns a standardized free tier response:

```js
{
  plan: 'free',
  planName: 'Free',
  memberLimit: 1,
  memberCount: 1,
  canAddMember: false,
  subscription: null,
  billingCycle: null,
}
```

The free tier is not stored in the database. It is the implicit default when no Subscription record exists (or all subscriptions have a non-active status).

### Checking for Free Tier in Code

```js
const planInfo = await sails.helpers.subscription.checkPlan(teamId)

if (planInfo.plan === 'free') {
  // Show upgrade prompt
}

if (!planInfo.subscription) {
  // No active subscription -- same as free tier
}
```

## Querying Subscriptions

### Finding a Team's Active Subscription

```js
const subscription = await Subscription.findOne({
  team: teamId,
  status: 'active'
})
```

### Finding a Subscription by Lemon Squeezy ID

Used in webhook handlers to find the local subscription record:

```js
const subscription = await Subscription.findOne({
  subscriptionId: lemonSqueezySubscriptionId
})
```

### Finding All Subscriptions for a Team (Including Expired)

```js
const subscriptions = await Subscription.find({
  team: teamId
}).sort('createdAt DESC')
```

### Checking If a Subscription Is Still Usable

A subscription in `cancelled` status is still usable until the period ends:

```js
function isSubscriptionUsable(subscription) {
  if (!subscription) return false
  if (subscription.status === 'active') return true
  if (subscription.status === 'cancelled') {
    // Still active until the period ends
    return new Date(subscription.currentPeriodEnd) > new Date()
  }
  return false
}
```

## Plan Limits and Enforcement

### Member Limits

Enforce member limits when adding new team members:

```js
const planInfo = await sails.helpers.subscription.checkPlan(teamId)

if (!planInfo.canAddMember) {
  // Block the operation and prompt upgrade
}
```

### Feature Gating

For features that are only available on certain plans:

```js
const planInfo = await sails.helpers.subscription.checkPlan(teamId)

// Only Pro plan gets advanced analytics
if (planInfo.plan !== 'pro') {
  throw {
    forbidden: {
      problems: [{ feature: 'Advanced analytics requires the Pro plan.' }]
    }
  }
}
```

### A Plan-Check Policy

Create a reusable policy for routes that require a specific plan:

```js
// api/policies/has-plan.js
module.exports = async function (req, res, proceed) {
  if (!req.session.teamId) {
    return res.forbidden()
  }

  const planInfo = await sails.helpers.subscription.checkPlan(
    req.session.teamId
  )

  if (planInfo.plan === 'free') {
    sails.inertia.flash('error', 'This feature requires a paid plan.')
    return res.redirect('/pricing')
  }

  // Attach plan info to the request for use in the action
  req.planInfo = planInfo
  return proceed()
}
```

```js
// config/policies.js
module.exports.policies = {
  'analytics/*': ['is-authenticated', 'has-plan']
}
```

## The Billing Settings Page

The billing page shows the team's current plan, subscription details, and usage:

```js
// api/controllers/billing/view-billing.js
module.exports = {
  exits: {
    success: { responseType: 'inertia' }
  },

  fn: async function () {
    const teamId = this.req.session.teamId
    const planInfo = await sails.helpers.subscription.checkPlan(teamId)
    const plans = sails.config.pay.plans

    return {
      page: 'billing/settings',
      props: {
        planInfo,
        plans
      }
    }
  }
}
```

### React Billing Settings Component

```jsx
// assets/js/pages/billing/settings.jsx
import { Link } from '@inertiajs/react'

export default function BillingSettings({ planInfo, plans }) {
  return (
    <div>
      <h1>Billing</h1>

      {/* Current Plan */}
      <section>
        <h2>Current Plan</h2>
        <p>
          <strong>{planInfo.planName}</strong>
          {planInfo.billingCycle && ` (${planInfo.billingCycle})`}
        </p>

        {planInfo.subscription && (
          <div>
            <p>
              Status: <span>{planInfo.subscription.status}</span>
            </p>
            <p>
              Current period:{' '}
              {new Date(
                planInfo.subscription.currentPeriodStart
              ).toLocaleDateString()}{' '}
              &ndash;{' '}
              {new Date(
                planInfo.subscription.currentPeriodEnd
              ).toLocaleDateString()}
            </p>
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
            <p>You are on the free plan.</p>
            <Link href="/pricing">Upgrade your plan</Link>
          </div>
        )}
      </section>

      {/* Usage */}
      <section>
        <h2>Usage</h2>
        <p>
          Team members: {planInfo.memberCount}
          {planInfo.memberLimit !== -1 && ` / ${planInfo.memberLimit}`}
        </p>
        {!planInfo.canAddMember && (
          <p>
            You have reached your member limit.{' '}
            <Link href="/pricing">Upgrade</Link> to add more members.
          </p>
        )}
      </section>

      {/* Plan Comparison */}
      {planInfo.plan !== 'pro' && (
        <section>
          <h2>Available Plans</h2>
          {Object.entries(plans).map(([slug, plan]) => (
            <div key={slug}>
              <h3>{plan.name}</h3>
              <p>From ${plan.variants.monthly.amount}/mo</p>
              <p>
                {plan.memberLimit === -1
                  ? 'Unlimited members'
                  : `Up to ${plan.memberLimit} members`}
              </p>
            </div>
          ))}
          <Link href="/pricing">View pricing</Link>
        </section>
      )}
    </div>
  )
}
```

### Vue Billing Settings Component

```vue
<!-- assets/js/pages/billing/settings.vue -->
<script setup>
import { Link } from '@inertiajs/vue3'

const props = defineProps({
  planInfo: Object,
  plans: Object
})
</script>

<template>
  <div>
    <h1>Billing</h1>

    <section>
      <h2>Current Plan</h2>
      <p>
        <strong>{{ planInfo.planName }}</strong>
        <span v-if="planInfo.billingCycle"> ({{ planInfo.billingCycle }})</span>
      </p>

      <div v-if="planInfo.subscription">
        <p>Status: {{ planInfo.subscription.status }}</p>
        <p>
          Current period:
          {{
            new Date(
              planInfo.subscription.currentPeriodStart
            ).toLocaleDateString()
          }}
          &ndash;
          {{
            new Date(
              planInfo.subscription.currentPeriodEnd
            ).toLocaleDateString()
          }}
        </p>
        <p v-if="planInfo.subscription.nextBillingDate">
          Next billing date:
          {{
            new Date(planInfo.subscription.nextBillingDate).toLocaleDateString()
          }}
        </p>
      </div>

      <div v-if="planInfo.plan === 'free'">
        <p>You are on the free plan.</p>
        <Link href="/pricing">Upgrade your plan</Link>
      </div>
    </section>

    <section>
      <h2>Usage</h2>
      <p>
        Team members: {{ planInfo.memberCount }}
        <span v-if="planInfo.memberLimit !== -1">
          / {{ planInfo.memberLimit }}</span
        >
      </p>
      <p v-if="!planInfo.canAddMember">
        You have reached your member limit.
        <Link href="/pricing">Upgrade</Link> to add more members.
      </p>
    </section>
  </div>
</template>
```

## Handling Cancelled Subscriptions

When a user cancels, the subscription status changes to `cancelled` but the user retains access until `currentPeriodEnd`. Your UI should reflect this:

```jsx
{
  planInfo.subscription?.status === 'cancelled' && (
    <div>
      <p>
        Your subscription has been cancelled. You will retain access to{' '}
        {planInfo.planName} features until{' '}
        {new Date(planInfo.subscription.currentPeriodEnd).toLocaleDateString()}.
      </p>
      <p>After that, you will be downgraded to the Free plan.</p>
    </div>
  )
}
```

## Handling Past Due Subscriptions

When a payment fails, the status becomes `past_due`. You should prompt the user to update their payment method:

```jsx
{
  planInfo.subscription?.status === 'past_due' && (
    <div>
      <p>
        Your last payment failed. Please update your payment method to avoid
        losing access.
      </p>
      <a href={customerPortalUrl}>Update payment method</a>
    </div>
  )
}
```

## Upgrading and Downgrading

Plan changes are handled through the Lemon Squeezy customer portal, not through your checkout flow. When a user changes their plan in the portal, Lemon Squeezy sends a `subscription_updated` webhook that updates the local Subscription record. See [webhooks.md](webhooks.md) for details on processing these events and [customer-portal.md](customer-portal.md) for generating portal links.
