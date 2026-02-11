---
name: checkout
description: Checkout flow with sails.pay.checkout(), Lemon Squeezy hosted checkout, variant selection, inertiaRedirect response, custom data, and pricing page
metadata:
  tags: checkout, sails-pay, lemon-squeezy, inertia-redirect, pricing, variants, checkout-url
---

# Checkout

## Checkout Flow Overview

The checkout flow in The Boring Stack follows this sequence:

```
User selects plan → Frontend POSTs to /checkout → Server generates checkout URL
→ Server returns inertiaRedirect (409) → Inertia performs full page redirect
→ User completes payment on Lemon Squeezy's hosted checkout page
→ Lemon Squeezy redirects user back to your app's redirect URL
→ Lemon Squeezy sends webhook to confirm subscription creation
```

The key architectural decision is that checkout happens on Lemon Squeezy's hosted page, not on your app. Your server generates a checkout URL with pre-filled data (email, plan, custom metadata) and redirects the user there. This approach avoids PCI compliance requirements and gives you Lemon Squeezy's optimized checkout UI.

## The Checkout Controller

The checkout controller receives the selected plan and billing cycle, looks up the corresponding variant, and generates a Lemon Squeezy checkout URL:

```js
// api/controllers/billing/view-checkout.js
module.exports = {
  inputs: {
    plan: {
      type: 'string',
      required: true,
      isIn: ['starter', 'pro'],
      description: 'The plan slug to check out.'
    },
    billingCycle: {
      type: 'string',
      required: true,
      isIn: ['monthly', 'yearly'],
      description: 'The billing cycle for the subscription.'
    }
  },

  exits: {
    success: {
      responseType: 'inertiaRedirect'
    }
  },

  fn: async function ({ plan, billingCycle }) {
    // Look up the plan configuration
    const planConfig = sails.config.pay.plans[plan]
    const variant = planConfig.variants[billingCycle]

    // Get the logged-in user's email for pre-filling checkout
    const loggedInUser = await User.findOne({
      id: this.req.session.userId
    }).select(['email'])

    // Generate a Lemon Squeezy checkout URL
    const checkoutUrl = await sails.pay.checkout({
      variant: variant.id,
      productOptions: {
        enabledVariants: [variant.id]
      },
      checkoutData: {
        email: loggedInUser.email,
        custom: {
          team: this.req.session.teamId.toString()
        }
      }
    })

    // Return the checkout URL -- inertiaRedirect sends a 409 response
    // that tells Inertia to do a full page redirect to the external URL
    return checkoutUrl
  }
}
```

### Why inertiaRedirect Instead of redirect?

The checkout URL points to an external domain (`lemonsqueezy.com`). With Inertia.js, a standard `redirect` response type sends a 302, but Inertia intercepts 302 responses and tries to follow them as Inertia requests (sending the `X-Inertia` header). This fails for external URLs because the external server does not return an Inertia response.

The `inertiaRedirect` response type sends a **409 Conflict** status with a `X-Inertia-Location` header. Inertia recognizes this as a signal to perform a **full page redirect** (like `window.location.href = url`), which correctly navigates the browser to the external checkout page.

```
responseType: 'redirect'        → 302 → Inertia tries XHR follow → FAILS for external URLs
responseType: 'inertiaRedirect' → 409 → Inertia does window.location redirect → WORKS
```

Use `inertiaRedirect` whenever you need to redirect to an external URL from an Inertia action.

## sails.pay.checkout() API

The `sails.pay.checkout()` method creates a checkout session and returns a URL:

```js
const checkoutUrl = await sails.pay.checkout({
  // Required: the Lemon Squeezy variant ID to purchase
  variant: '123456',

  // Optional: restrict which variants are shown on the checkout page
  productOptions: {
    enabledVariants: ['123456']
  },

  // Optional: pre-fill checkout form data
  checkoutData: {
    email: 'user@example.com',

    // Custom data attached to the subscription (available in webhooks)
    custom: {
      team: '42',
      referral: 'partner-abc'
    }
  }
})
```

### Parameters

| Parameter                        | Type     | Description                                                                                                                  |
| -------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `variant`                        | string   | The Lemon Squeezy variant ID to purchase. Required.                                                                          |
| `productOptions.enabledVariants` | string[] | Restrict checkout to show only these variants. Prevents the user from switching to a different variant on the checkout page. |
| `checkoutData.email`             | string   | Pre-fill the email field on the checkout form.                                                                               |
| `checkoutData.custom`            | object   | Key-value pairs attached as custom metadata. Available in webhook payloads as `custom_data`. All values must be strings.     |

### Custom Data

The `custom` object is critical for linking the Lemon Squeezy subscription back to your application data. In the Ascent template, the team ID is passed as custom data:

```js
checkoutData: {
  custom: {
    team: this.req.session.teamId.toString()
  }
}
```

When the `subscription_created` webhook fires, the team ID is available in the payload's `custom_data` field, allowing the webhook handler to create the Subscription record with the correct team association.

All custom data values must be **strings**. Convert numbers and other types with `.toString()`.

## The Pricing Page

The pricing page displays available plans and lets users select one for checkout. It reads plan data from `sails.config.pay.plans`:

```js
// api/controllers/billing/view-pricing.js
module.exports = {
  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    const plans = sails.config.pay.plans

    return {
      page: 'billing/pricing',
      props: {
        plans
      }
    }
  }
}
```

### React Pricing Page Component

```jsx
// assets/js/pages/billing/pricing.jsx
import { useForm } from '@inertiajs/react'

export default function Pricing({ plans }) {
  const [billingCycle, setBillingCycle] = useState('monthly')

  return (
    <div>
      <h1>Choose your plan</h1>

      {/* Billing cycle toggle */}
      <div>
        <button onClick={() => setBillingCycle('monthly')}>Monthly</button>
        <button onClick={() => setBillingCycle('yearly')}>
          Yearly (save 20%)
        </button>
      </div>

      {/* Plan cards */}
      <div>
        {Object.entries(plans).map(([slug, plan]) => (
          <PlanCard
            key={slug}
            slug={slug}
            plan={plan}
            billingCycle={billingCycle}
          />
        ))}
      </div>
    </div>
  )
}

function PlanCard({ slug, plan, billingCycle }) {
  const form = useForm({
    plan: slug,
    billingCycle: billingCycle
  })

  function handleCheckout(e) {
    e.preventDefault()
    form
      .transform((data) => ({
        ...data,
        billingCycle
      }))
      .post('/checkout')
  }

  return (
    <div>
      <h2>{plan.name}</h2>
      <p>${plan.variants[billingCycle].amount}/mo</p>
      <p>
        {plan.memberLimit === -1
          ? 'Unlimited members'
          : `Up to ${plan.memberLimit} members`}
      </p>
      <button onClick={handleCheckout} disabled={form.processing}>
        {form.processing ? 'Redirecting...' : `Subscribe to ${plan.name}`}
      </button>
    </div>
  )
}
```

### Vue Pricing Page Component

```vue
<!-- assets/js/pages/billing/pricing.vue -->
<script setup>
import { ref } from 'vue'
import { useForm } from '@inertiajs/vue3'

const props = defineProps({
  plans: Object
})

const billingCycle = ref('monthly')

function checkout(slug) {
  const form = useForm({
    plan: slug,
    billingCycle: billingCycle.value
  })
  form.post('/checkout')
}
</script>

<template>
  <div>
    <h1>Choose your plan</h1>

    <div>
      <button @click="billingCycle = 'monthly'">Monthly</button>
      <button @click="billingCycle = 'yearly'">Yearly (save 20%)</button>
    </div>

    <div v-for="(plan, slug) in plans" :key="slug">
      <h2>{{ plan.name }}</h2>
      <p>${{ plan.variants[billingCycle].amount }}/mo</p>
      <p>
        {{
          plan.memberLimit === -1
            ? 'Unlimited members'
            : `Up to ${plan.memberLimit} members`
        }}
      </p>
      <button @click="checkout(slug)">Subscribe to {{ plan.name }}</button>
    </div>
  </div>
</template>
```

## Post-Checkout: The Redirect URL

After the user completes payment on Lemon Squeezy's checkout page, they are redirected back to your app at the URL configured in `config/pay.js`:

```js
providers: {
  lemonsqueezy: {
    redirectUrl: process.env.LEMON_SQUEEZY_REDIRECT_URL
    // e.g., 'https://yourapp.com/billing'
  }
}
```

This redirect happens in the browser (a full page navigation). The redirect URL should point to a page that shows the user's subscription status. Typically this is the billing settings page.

Note that the redirect happens before the webhook is processed. There may be a brief delay between the user returning to your app and the `subscription_created` webhook arriving. Your billing page should handle the case where the subscription record does not yet exist (e.g., show a "Processing your subscription..." message or poll for updates).

## Checkout for Existing Subscribers (Plan Changes)

For users who already have an active subscription and want to upgrade or downgrade, do not create a new checkout session. Instead, direct them to the Lemon Squeezy customer portal where they can manage their subscription. See the [customer-portal](customer-portal.md) rule for details.

## Error Handling

### Invalid Plan or Billing Cycle

The `inputs` validation in the checkout controller handles invalid values:

```js
inputs: {
  plan: {
    type: 'string',
    required: true,
    isIn: ['starter', 'pro']     // Rejects unknown plans
  },
  billingCycle: {
    type: 'string',
    required: true,
    isIn: ['monthly', 'yearly']  // Rejects unknown cycles
  }
}
```

If the input validation fails, Sails automatically returns a `badRequest` response with the validation errors.

### sails.pay.checkout() Failures

If the Lemon Squeezy API call fails (network error, invalid API key, invalid variant ID), `sails.pay.checkout()` throws an error. Handle this with a try/catch or a named exit:

```js
exits: {
  success: { responseType: 'inertiaRedirect' },
  checkoutFailed: { responseType: 'redirect' }
},

fn: async function ({ plan, billingCycle }) {
  const planConfig = sails.config.pay.plans[plan]
  const variant = planConfig.variants[billingCycle]
  const loggedInUser = await User.findOne({
    id: this.req.session.userId
  }).select(['email'])

  let checkoutUrl
  try {
    checkoutUrl = await sails.pay.checkout({
      variant: variant.id,
      productOptions: { enabledVariants: [variant.id] },
      checkoutData: {
        email: loggedInUser.email,
        custom: { team: this.req.session.teamId.toString() }
      }
    })
  } catch (err) {
    sails.log.error('Checkout session creation failed:', err)
    sails.inertia.flash('error', 'Could not start checkout. Please try again.')
    throw { checkoutFailed: '/pricing' }
  }

  return checkoutUrl
}
```

### Preventing Duplicate Subscriptions

Before generating a checkout URL, check whether the team already has an active subscription:

```js
fn: async function ({ plan, billingCycle }) {
  // Check for existing active subscription
  const existingSubscription = await Subscription.findOne({
    team: this.req.session.teamId,
    status: 'active'
  })

  if (existingSubscription) {
    sails.inertia.flash('error', 'You already have an active subscription. Manage it from your billing settings.')
    throw { alreadySubscribed: '/billing' }
  }

  // Proceed with checkout...
}
```

## Complete Route and Policy Configuration

```js
// config/routes.js (billing section)
'GET /pricing': { action: 'billing/view-pricing' },
'POST /checkout': { action: 'billing/view-checkout' },
```

```js
// config/policies.js (billing section)
'billing/view-pricing': true,              // Public
'billing/view-checkout': 'is-authenticated' // Requires login
```

The pricing page is publicly accessible so potential customers can view plans. The checkout action requires authentication because it needs the user's email and team ID.
