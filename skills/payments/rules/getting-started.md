---
name: getting-started
description: sails-pay hook overview, installation, config/pay.js structure, Lemon Squeezy setup, Subscription model, plan definitions, and environment variables
metadata:
  tags: sails-pay, setup, config, lemon-squeezy, subscription-model, plans, variants, environment
---

# Getting Started with Payments

## What is sails-pay?

`sails-pay` is a Sails.js hook that provides a unified payment API. It abstracts payment provider details behind a consistent interface, so your application code works the same regardless of the underlying provider. The Boring JavaScript Stack uses Lemon Squeezy as the default payment provider through the `@sails-pay/lemonsqueezy` adapter.

When the hook loads, it registers itself on the `sails` object as `sails.pay`, giving you access to methods like `sails.pay.checkout()` from any action, helper, or hook in your application.

## Installation

Install the core hook and the Lemon Squeezy adapter:

```bash
npm install sails-pay @sails-pay/lemonsqueezy
```

The hook is automatically loaded by Sails because `sails-pay` declares itself as a Sails hook in its `package.json`. No `.sailsrc` changes are needed.

## Configuration: config/pay.js

All payment configuration lives in `config/pay.js`. This file defines the active provider, provider credentials, and your subscription plans:

```js
// config/pay.js
module.exports.pay = {
  // The active payment provider
  provider: 'lemonsqueezy',

  // Provider-specific configuration
  providers: {
    lemonsqueezy: {
      adapter: '@sails-pay/lemonsqueezy',
      apiKey: process.env.LEMON_SQUEEZY_API_KEY,
      store: process.env.LEMON_SQUEEZY_STORE_ID,
      redirectUrl: process.env.LEMON_SQUEEZY_REDIRECT_URL,
      signingSecret: process.env.LEMON_SQUEEZY_SIGNING_SECRET
    }
  },

  // Subscription plan definitions
  plans: {
    starter: {
      name: 'Starter',
      memberLimit: 5,
      variants: {
        monthly: {
          amount: 29,
          id: process.env.LEMON_SQUEEZY_STARTER_MONTHLY_VARIANT_ID
        },
        yearly: {
          amount: 23,
          id: process.env.LEMON_SQUEEZY_STARTER_YEARLY_VARIANT_ID
        }
      }
    },
    pro: {
      name: 'Pro',
      memberLimit: -1,
      variants: {
        monthly: {
          amount: 89,
          id: process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID
        },
        yearly: {
          amount: 71,
          id: process.env.LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID
        }
      }
    }
  }
}
```

### Configuration Structure

| Key                                    | Description                                                             |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `provider`                             | The active provider name. Must match a key in `providers`.              |
| `providers`                            | Object of provider configurations keyed by provider name.               |
| `providers.lemonsqueezy.adapter`       | The npm package that implements the provider adapter.                   |
| `providers.lemonsqueezy.apiKey`        | Lemon Squeezy API key for server-side API calls.                        |
| `providers.lemonsqueezy.store`         | Lemon Squeezy store ID that owns the products.                          |
| `providers.lemonsqueezy.redirectUrl`   | URL the customer returns to after completing checkout.                  |
| `providers.lemonsqueezy.signingSecret` | Secret used to verify webhook signatures from Lemon Squeezy.            |
| `plans`                                | Object of plan definitions keyed by plan slug (e.g., `starter`, `pro`). |

## Lemon Squeezy Setup

### 1. Create a Lemon Squeezy Account

Sign up at [lemonsqueezy.com](https://lemonsqueezy.com) and create a store. Note your **Store ID** from the store settings.

### 2. Create Products and Variants

In the Lemon Squeezy dashboard:

1. Create a product for each plan (e.g., "Starter", "Pro")
2. For each product, create variants for billing cycles (monthly, yearly)
3. Note the **Variant ID** for each variant -- these are used in `config/pay.js`

Variants are the specific purchasable items. A product like "Starter" has two variants: "Starter Monthly" and "Starter Yearly". The variant ID is what gets passed to the checkout session.

### 3. Generate an API Key

Go to **Settings > API** in the Lemon Squeezy dashboard and create an API key. This key is used for server-side operations like creating checkout sessions.

### 4. Set Up Webhook Signing Secret

Go to **Settings > Webhooks** in the Lemon Squeezy dashboard:

1. Create a new webhook endpoint pointing to your app's webhook URL (e.g., `https://yourapp.com/webhooks/lemonsqueezy`)
2. Select the events: `subscription_created`, `subscription_updated`
3. Note the **Signing Secret** -- this is used to verify that incoming webhooks are genuinely from Lemon Squeezy

### 5. Configure the Redirect URL

Set the redirect URL to the page users should land on after completing checkout (e.g., `https://yourapp.com/billing`). This is where Lemon Squeezy sends the customer after a successful payment.

## Environment Variables

All sensitive values are stored as environment variables. Add these to your `.env` file:

```bash
# Lemon Squeezy credentials
LEMON_SQUEEZY_API_KEY=your_api_key_here
LEMON_SQUEEZY_STORE_ID=your_store_id_here
LEMON_SQUEEZY_SIGNING_SECRET=your_signing_secret_here
LEMON_SQUEEZY_REDIRECT_URL=https://yourapp.com/billing

# Starter plan variant IDs
LEMON_SQUEEZY_STARTER_MONTHLY_VARIANT_ID=123456
LEMON_SQUEEZY_STARTER_YEARLY_VARIANT_ID=123457

# Pro plan variant IDs
LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID=123458
LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID=123459
```

In production, set these through your hosting provider's environment variable configuration (e.g., Render, Railway, Fly.io).

## The Subscription Model

The `Subscription` model tracks the state of each team's subscription. Create it at `api/models/Subscription.js`:

```js
// api/models/Subscription.js
module.exports = {
  attributes: {
    subscriptionId: {
      type: 'string',
      description: 'The Lemon Squeezy subscription ID.',
      columnName: 'subscription_id'
    },

    status: {
      type: 'string',
      isIn: ['active', 'cancelled', 'expired', 'past_due', 'unpaid'],
      description: 'Current subscription status from Lemon Squeezy.'
    },

    planName: {
      type: 'string',
      isIn: ['starter', 'pro'],
      description: 'The plan slug matching a key in sails.config.pay.plans.',
      columnName: 'plan_name'
    },

    billingCycle: {
      type: 'string',
      isIn: ['monthly', 'yearly'],
      description: 'Whether the subscription bills monthly or yearly.',
      columnName: 'billing_cycle'
    },

    currentPeriodStart: {
      type: 'string',
      description:
        'ISO 8601 date string for the start of the current billing period.',
      columnName: 'current_period_start'
    },

    currentPeriodEnd: {
      type: 'string',
      description:
        'ISO 8601 date string for the end of the current billing period.',
      columnName: 'current_period_end'
    },

    nextBillingDate: {
      type: 'string',
      description: 'ISO 8601 date string for the next billing date.',
      columnName: 'next_billing_date'
    },

    // Association: each subscription belongs to a team
    team: {
      model: 'Team',
      description: 'The team this subscription belongs to.'
    }
  }
}
```

### Subscription Fields

| Field                | Type        | Description                                                                                             |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `subscriptionId`     | string      | The external subscription ID from Lemon Squeezy. Used to identify the subscription in webhook payloads. |
| `status`             | string      | Current lifecycle status. One of: `active`, `cancelled`, `expired`, `past_due`, `unpaid`.               |
| `planName`           | string      | The plan slug (e.g., `starter`, `pro`). Matches a key in `sails.config.pay.plans`.                      |
| `billingCycle`       | string      | Billing frequency: `monthly` or `yearly`.                                                               |
| `currentPeriodStart` | string      | ISO date when the current billing period began.                                                         |
| `currentPeriodEnd`   | string      | ISO date when the current billing period ends.                                                          |
| `nextBillingDate`    | string      | ISO date of the next scheduled charge.                                                                  |
| `team`               | association | Foreign key to the Team model. Each team has at most one active subscription.                           |

### Status Lifecycle

Subscriptions move through these statuses based on Lemon Squeezy events:

```
checkout complete → active
active → cancelled (user cancels, remains active until period end)
active → past_due (payment failed)
past_due → active (payment retried successfully)
past_due → unpaid (all retries exhausted)
cancelled → expired (billing period ended)
unpaid → expired (grace period ended)
```

## Plan Structure

Plans are defined in `config/pay.js` under the `plans` key. Each plan has:

```js
plans: {
  starter: {
    name: 'Starter',       // Display name for the UI
    memberLimit: 5,         // Max team members (-1 for unlimited)
    variants: {
      monthly: {
        amount: 29,         // Price in dollars (for display)
        id: '...'           // Lemon Squeezy variant ID (for checkout)
      },
      yearly: {
        amount: 23,         // Per-month price when billed yearly
        id: '...'
      }
    }
  }
}
```

### Key Design Decisions

- **Plan slugs** (`starter`, `pro`) are used as keys and stored in the Subscription model's `planName` field. They must be stable identifiers.
- **Variant IDs** are Lemon Squeezy-specific identifiers that map to purchasable items. Each combination of plan and billing cycle has its own variant.
- **`memberLimit: -1`** means unlimited. The `checkPlan` helper interprets this as no limit on team members.
- **Amount** is the display price. The actual charge amount is configured in Lemon Squeezy's dashboard. Keep these in sync manually.

### Adding a New Plan

To add a new plan:

1. Create the product and variants in Lemon Squeezy's dashboard
2. Add the variant IDs to your environment variables
3. Add the plan to `config/pay.js`:

```js
plans: {
  starter: { /* ... */ },
  pro: { /* ... */ },
  enterprise: {
    name: 'Enterprise',
    memberLimit: -1,
    variants: {
      monthly: {
        amount: 199,
        id: process.env.LEMON_SQUEEZY_ENTERPRISE_MONTHLY_VARIANT_ID
      },
      yearly: {
        amount: 159,
        id: process.env.LEMON_SQUEEZY_ENTERPRISE_YEARLY_VARIANT_ID
      }
    }
  }
}
```

4. Update the Subscription model's `planName` validation:

```js
planName: {
  type: 'string',
  isIn: ['starter', 'pro', 'enterprise'],
}
```

5. Update the `getPlanFromVariantId()` function in the webhook controller to map the new variant IDs

## Accessing Payment Config at Runtime

The payment configuration is available through `sails.config.pay`:

```js
// In any action or helper:
const plans = sails.config.pay.plans
const starterPlan = sails.config.pay.plans.starter
const monthlyPrice = sails.config.pay.plans.starter.variants.monthly.amount
const providerConfig = sails.config.pay.providers.lemonsqueezy
```

The `sails.pay` object provides methods for interacting with the payment provider:

```js
// Generate a checkout URL
const checkoutUrl = await sails.pay.checkout({
  /* ... */
})
```

## Routes for Billing

The typical route configuration for a billing system:

```js
// config/routes.js
module.exports.routes = {
  // Public pricing page (no auth required)
  'GET /pricing': { action: 'billing/view-pricing' },

  // Checkout (requires authentication)
  'POST /checkout': { action: 'billing/view-checkout' },

  // Billing settings (requires authentication)
  'GET /billing': { action: 'billing/view-billing' },

  // Webhook endpoint (no auth, no CSRF -- receives POST from Lemon Squeezy)
  'POST /webhooks/lemonsqueezy': { action: 'webhook/lemonsqueezy' }
}
```

## Policies for Billing

Configure policies in `config/policies.js`:

```js
// config/policies.js
module.exports.policies = {
  'billing/*': 'is-authenticated',

  // Override: pricing page is public
  'billing/view-pricing': true,

  // Webhooks must be publicly accessible (no auth policy)
  'webhook/*': true
}
```

The pricing page is public so unauthenticated users can see plans. The checkout and billing settings pages require authentication. Webhook endpoints must be publicly accessible since they receive POST requests directly from Lemon Squeezy's servers.
