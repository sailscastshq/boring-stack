# Payments Skills for Claude Code

Integrate subscription billing into The Boring JavaScript Stack with Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/payments
```

## Usage

After installing, Claude will automatically apply payment best practices when you work on billing-related code:

> "Set up subscription billing with Lemon Squeezy"

> "Add a checkout flow for the Pro plan"

> "Handle webhook events for subscription changes"

> "Build a billing settings page showing the current plan"

## Skills Included

- **getting-started** - sails-pay hook, config/pay.js, Lemon Squeezy setup, Subscription model
- **checkout** - Checkout flow, sails.pay.checkout(), variant selection
- **subscriptions** - Subscription management, status lifecycle, plan checking
- **webhooks** - Webhook controller, signature verification, event handling
- **customer-portal** - Lemon Squeezy hosted portal, subscription management

## What is sails-pay?

[sails-pay](https://github.com/nicedoc/sails-pay) is a Sails.js hook that provides a unified API for payment processing. It currently supports [Lemon Squeezy](https://lemonsqueezy.com) as a payment provider, handling checkout sessions, subscription management, and webhook processing.

## Links

- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)
- [Lemon Squeezy Documentation](https://docs.lemonsqueezy.com)
- [sails-pay](https://github.com/nicedoc/sails-pay)

## License

MIT
