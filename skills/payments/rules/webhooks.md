---
name: webhooks
description: Lemon Squeezy webhook handling, signature verification with HMAC SHA256, subscription_created and subscription_updated events, idempotency, security, and route configuration
metadata:
  tags: webhooks, lemon-squeezy, signature, hmac, subscription-created, subscription-updated, security, idempotency
---

# Webhooks

## Webhook Architecture

Lemon Squeezy sends HTTP POST requests to your application when subscription events occur. This is the authoritative source of truth for subscription state changes -- your app should never directly modify subscription status without a corresponding webhook event.

```
Lemon Squeezy event occurs
→ POST /webhooks/lemonsqueezy (your app)
→ Verify X-Signature header (HMAC SHA256)
→ Parse event type and payload
→ Create or update Subscription record
→ Return 200 OK
```

The webhook endpoint must be publicly accessible (no authentication policy) and exempt from CSRF protection.

## The Webhook Controller

```js
// api/controllers/webhook/lemonsqueezy.js
const crypto = require('crypto')

module.exports = {
  fn: async function () {
    const req = this.req
    const res = this.res

    // 1. Get the raw request body and signature
    const rawBody = req.body
    const signature = req.get('X-Signature')

    if (!signature) {
      sails.log.warn('Webhook received without X-Signature header')
      return res.status(401).json({ error: 'Missing signature' })
    }

    // 2. Verify the signature
    const signingSecret = sails.config.pay.providers.lemonsqueezy.signingSecret
    const hmac = crypto.createHmac('sha256', signingSecret)
    const digest = hmac
      .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
      sails.log.warn('Webhook signature verification failed')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // 3. Parse the webhook payload
    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    const eventName = payload.meta.event_name
    const subscriptionData = payload.data.attributes
    const customData = payload.meta.custom_data

    sails.log.info(`Lemon Squeezy webhook received: ${eventName}`)

    // 4. Handle events
    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(subscriptionData, customData, payload)
        break

      case 'subscription_updated':
        await handleSubscriptionUpdated(subscriptionData, payload)
        break

      default:
        sails.log.info(`Unhandled webhook event: ${eventName}`)
    }

    // 5. Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true })
  }
}

/**
 * Handle subscription_created event.
 * Creates or updates the local Subscription record.
 */
async function handleSubscriptionCreated(
  subscriptionData,
  customData,
  payload
) {
  const subscriptionId = payload.data.id.toString()
  const teamId = parseInt(customData.team)
  const variantId = subscriptionData.variant_id.toString()

  // Resolve the plan and billing cycle from the variant ID
  const planInfo = getPlanFromVariantId(variantId)
  if (!planInfo) {
    sails.log.warn(`Unknown variant ID in webhook: ${variantId}`)
    return
  }

  // Use findOrCreate for idempotency (webhook may be delivered more than once)
  const existingSubscription = await Subscription.findOne({
    subscriptionId: subscriptionId
  })

  if (existingSubscription) {
    // Update the existing record
    await Subscription.updateOne({ id: existingSubscription.id }).set({
      status: subscriptionData.status,
      planName: planInfo.planSlug,
      billingCycle: planInfo.billingCycle,
      currentPeriodStart: subscriptionData.current_period_start,
      currentPeriodEnd: subscriptionData.current_period_end,
      nextBillingDate: subscriptionData.renews_at
    })
    sails.log.info(
      `Updated existing subscription ${subscriptionId} for team ${teamId}`
    )
  } else {
    // Create a new subscription record
    await Subscription.create({
      subscriptionId: subscriptionId,
      status: subscriptionData.status,
      planName: planInfo.planSlug,
      billingCycle: planInfo.billingCycle,
      currentPeriodStart: subscriptionData.current_period_start,
      currentPeriodEnd: subscriptionData.current_period_end,
      nextBillingDate: subscriptionData.renews_at,
      team: teamId
    })
    sails.log.info(`Created subscription ${subscriptionId} for team ${teamId}`)
  }
}

/**
 * Handle subscription_updated event.
 * Updates the local Subscription record with new status and billing dates.
 */
async function handleSubscriptionUpdated(subscriptionData, payload) {
  const subscriptionId = payload.data.id.toString()
  const variantId = subscriptionData.variant_id.toString()

  const subscription = await Subscription.findOne({
    subscriptionId: subscriptionId
  })

  if (!subscription) {
    sails.log.warn(
      `Received subscription_updated for unknown subscription: ${subscriptionId}`
    )
    return
  }

  // Resolve plan info in case the user changed plans
  const planInfo = getPlanFromVariantId(variantId)

  const updateData = {
    status: subscriptionData.status,
    currentPeriodStart: subscriptionData.current_period_start,
    currentPeriodEnd: subscriptionData.current_period_end,
    nextBillingDate: subscriptionData.renews_at
  }

  // If plan info resolved, update the plan as well (handles upgrades/downgrades)
  if (planInfo) {
    updateData.planName = planInfo.planSlug
    updateData.billingCycle = planInfo.billingCycle
  }

  await Subscription.updateOne({ id: subscription.id }).set(updateData)
  sails.log.info(
    `Updated subscription ${subscriptionId}: status=${subscriptionData.status}`
  )
}

/**
 * Map a Lemon Squeezy variant ID to a plan slug and billing cycle.
 * Iterates through all plans in config to find the matching variant.
 */
function getPlanFromVariantId(variantId) {
  const plans = sails.config.pay.plans

  for (const [planSlug, planConfig] of Object.entries(plans)) {
    for (const [billingCycle, variant] of Object.entries(planConfig.variants)) {
      if (variant.id === variantId) {
        return { planSlug, billingCycle, planConfig }
      }
    }
  }

  return null
}
```

## Signature Verification

Every webhook from Lemon Squeezy includes an `X-Signature` header containing an HMAC SHA256 hash of the request body, computed using your signing secret.

### How It Works

1. Lemon Squeezy computes `HMAC-SHA256(signingSecret, requestBody)` and sends it as the `X-Signature` header
2. Your app computes the same HMAC using the signing secret from `config/pay.js`
3. If the two values match, the webhook is authentic

### Implementation Details

```js
const crypto = require('crypto')

// Get the signing secret from config
const signingSecret = sails.config.pay.providers.lemonsqueezy.signingSecret

// Compute the expected signature
const hmac = crypto.createHmac('sha256', signingSecret)
const digest = hmac
  .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
  .digest('hex')

// Use timing-safe comparison to prevent timing attacks
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(digest)
)
```

Key points:

- Always use `crypto.timingSafeEqual()` for the comparison. A simple `===` comparison is vulnerable to timing attacks where an attacker can determine the correct signature byte-by-byte based on response timing.
- The raw request body must be used for signature computation. If the body has been parsed and re-serialized, the signature will not match. Access the raw body from `req.body` in the action.
- If the signing secret is wrong or the body was tampered with, the signature check fails and the webhook is rejected with a 401 status.

## Event Handling

### subscription_created

Fired when a new subscription is successfully created after checkout. The payload includes:

```js
{
  meta: {
    event_name: 'subscription_created',
    custom_data: {
      team: '42'           // The custom data you passed during checkout
    }
  },
  data: {
    id: '12345',            // Lemon Squeezy subscription ID
    attributes: {
      status: 'active',
      variant_id: 123456,
      current_period_start: '2026-02-10T00:00:00.000Z',
      current_period_end: '2026-03-10T00:00:00.000Z',
      renews_at: '2026-03-10T00:00:00.000Z',
      // ... other fields
    }
  }
}
```

Your handler should:

1. Extract the team ID from `custom_data`
2. Map the `variant_id` to a plan slug and billing cycle using `getPlanFromVariantId()`
3. Create a Subscription record linked to the team

### subscription_updated

Fired when a subscription changes state (renewal, cancellation, payment failure, plan change). The payload structure is the same as `subscription_created` but `custom_data` may not be present.

Your handler should:

1. Find the existing Subscription record by `subscriptionId`
2. Update the status, billing dates, and plan (if changed)
3. Log the status change

### Common subscription_updated Scenarios

| Scenario                 | Status Change            | Notes                                                                |
| ------------------------ | ------------------------ | -------------------------------------------------------------------- |
| Successful renewal       | `active` stays `active`  | `currentPeriodEnd` and `nextBillingDate` advance                     |
| User cancels             | `active` to `cancelled`  | Subscription stays active until `currentPeriodEnd`                   |
| Period ends after cancel | `cancelled` to `expired` | Full downgrade to free tier                                          |
| Payment fails            | `active` to `past_due`   | Lemon Squeezy retries automatically                                  |
| Retry succeeds           | `past_due` to `active`   | Normal access restored                                               |
| Retries exhausted        | `past_due` to `unpaid`   | Prompt user to update payment                                        |
| Plan upgrade/downgrade   | `active` stays `active`  | `variant_id` changes, new plan resolves via `getPlanFromVariantId()` |

## The getPlanFromVariantId Helper

This function maps a Lemon Squeezy variant ID back to your local plan configuration. It iterates through all plans and their variants to find a match:

```js
function getPlanFromVariantId(variantId) {
  const plans = sails.config.pay.plans

  for (const [planSlug, planConfig] of Object.entries(plans)) {
    for (const [billingCycle, variant] of Object.entries(planConfig.variants)) {
      if (variant.id === variantId) {
        return { planSlug, billingCycle, planConfig }
      }
    }
  }

  return null
}
```

This function lives inside the webhook controller file because it is tightly coupled to webhook processing. If you need plan resolution elsewhere, extract it to a helper:

```js
// api/helpers/subscription/get-plan-from-variant-id.js
module.exports = {
  friendlyName: 'Get plan from variant ID',

  inputs: {
    variantId: { type: 'string', required: true }
  },

  exits: {
    success: { description: 'Returns plan info or null.' }
  },

  fn: async function ({ variantId }) {
    const plans = sails.config.pay.plans
    for (const [planSlug, planConfig] of Object.entries(plans)) {
      for (const [billingCycle, variant] of Object.entries(
        planConfig.variants
      )) {
        if (variant.id === variantId) {
          return { planSlug, billingCycle, planConfig }
        }
      }
    }
    return null
  }
}
```

## Idempotency

Lemon Squeezy may deliver the same webhook more than once (network retries, infrastructure issues). Your handler must be idempotent -- processing the same event twice should produce the same result.

The Ascent template handles this with a find-then-create-or-update pattern:

```js
// Check if this subscription already exists
const existingSubscription = await Subscription.findOne({
  subscriptionId: subscriptionId
})

if (existingSubscription) {
  // Update -- same result whether this is the first or second delivery
  await Subscription.updateOne({ id: existingSubscription.id }).set({
    /* ... */
  })
} else {
  // Create -- only happens on the first delivery
  await Subscription.create({
    /* ... */
  })
}
```

For `subscription_updated`, the handler always calls `updateOne()` which is naturally idempotent -- applying the same update twice produces the same state.

### Why Not findOrCreate?

Waterline's `findOrCreate()` could work but has a race condition: if two webhook deliveries arrive simultaneously, both might try to create, causing a unique constraint violation. The find-then-create pattern with proper error handling is more predictable:

```js
try {
  await Subscription.create({ subscriptionId /* ... */ })
} catch (err) {
  if (err.code === 'E_UNIQUE') {
    // Another delivery already created it -- update instead
    await Subscription.updateOne({ subscriptionId }).set({
      /* ... */
    })
  } else {
    throw err
  }
}
```

## Webhook Security

### No Authentication Policy

Webhook endpoints must be publicly accessible. They receive POST requests from Lemon Squeezy's servers, not from authenticated users:

```js
// config/policies.js
module.exports.policies = {
  'webhook/*': true // No auth policy -- publicly accessible
}
```

### CSRF Exemption

Sails enables CSRF protection by default for POST requests. Webhooks are server-to-server requests that do not carry CSRF tokens. Exempt the webhook route from CSRF:

```js
// config/routes.js
module.exports.routes = {
  'POST /webhooks/lemonsqueezy': { action: 'webhook/lemonsqueezy' }
}
```

If CSRF is enabled globally, you may need to add the route to the CSRF allowlist in `config/security.js`:

```js
// config/security.js
module.exports.security = {
  csrf: {
    routesDisabled: ['/webhooks/lemonsqueezy']
  }
}
```

Or use the route-level override:

```js
// config/routes.js
'POST /webhooks/lemonsqueezy': {
  action: 'webhook/lemonsqueezy',
  csrf: false
}
```

### Signature-Only Verification

The webhook relies entirely on the HMAC signature for authentication. This is standard practice for payment provider webhooks. The signing secret is shared only between your server and Lemon Squeezy. As long as the secret is kept secure (stored as an environment variable, never committed to source code), signature verification provides strong authentication.

## Response Codes

Always return `200 OK` to acknowledge receipt, even if the event type is unhandled:

```js
// Unhandled events still get 200
default:
  sails.log.info(`Unhandled webhook event: ${eventName}`)

return res.status(200).json({ received: true })
```

If you return a non-2xx status, Lemon Squeezy will retry the webhook delivery. This is desirable for transient errors (database timeout, server crash) but problematic for permanent errors (bad code, unknown event types). By returning 200 for unhandled events, you prevent unnecessary retries.

Return non-2xx only for signature verification failures:

| Status | When                                                               |
| ------ | ------------------------------------------------------------------ |
| `200`  | Event processed successfully, or unhandled event type acknowledged |
| `401`  | Missing or invalid signature                                       |

## Route Configuration

```js
// config/routes.js
module.exports.routes = {
  'POST /webhooks/lemonsqueezy': { action: 'webhook/lemonsqueezy' }
}
```

The route uses POST because Lemon Squeezy sends webhooks as POST requests with a JSON body.

## Webhook Payload Reference

The full Lemon Squeezy webhook payload structure:

```js
{
  meta: {
    event_name: 'subscription_created',   // or 'subscription_updated'
    custom_data: {                         // Only present if set during checkout
      team: '42'
    },
    webhook_id: 'wh_abc123'               // Unique webhook delivery ID
  },
  data: {
    type: 'subscriptions',
    id: '12345',                           // Lemon Squeezy subscription ID
    attributes: {
      store_id: 98765,
      customer_id: 54321,
      product_id: 11111,
      variant_id: 123456,
      status: 'active',
      card_brand: 'visa',
      card_last_four: '4242',
      trial_ends_at: null,
      renews_at: '2026-03-10T00:00:00.000Z',
      ends_at: null,
      current_period_start: '2026-02-10T00:00:00.000Z',
      current_period_end: '2026-03-10T00:00:00.000Z',
      created_at: '2026-02-10T00:00:00.000Z',
      updated_at: '2026-02-10T00:00:00.000Z',
    }
  }
}
```

## Testing Webhooks Locally

During development, use a tunneling tool to expose your local server:

```bash
# Using ngrok
ngrok http 1337

# Then update your Lemon Squeezy webhook URL to:
# https://your-ngrok-url.ngrok.io/webhooks/lemonsqueezy
```

Alternatively, manually send test webhook payloads with curl:

```bash
# Compute the signature
BODY='{"meta":{"event_name":"subscription_created","custom_data":{"team":"1"}},"data":{"id":"12345","attributes":{"status":"active","variant_id":"123456","current_period_start":"2026-02-10T00:00:00.000Z","current_period_end":"2026-03-10T00:00:00.000Z","renews_at":"2026-03-10T00:00:00.000Z"}}}'
SECRET="your-signing-secret"
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# Send the test webhook
curl -X POST http://localhost:1337/webhooks/lemonsqueezy \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -d "$BODY"
```
