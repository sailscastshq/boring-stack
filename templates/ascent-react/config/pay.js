module.exports.pay = {
  // Payment provider configuration
  provider: 'lemonsqueezy',

  providers: {
    lemonsqueezy: {
      adapter: '@sails-pay/lemonsqueezy',
      apiKey: process.env.LEMON_SQUEEZY_API_KEY,
      store: process.env.LEMON_SQUEEZY_STORE_ID,
      redirectUrl: process.env.LEMON_SQUEEZY_REDIRECT_URL,
      signingSecret: process.env.LEMON_SQUEEZY_SIGNING_SECRET
    }
  },
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
      memberLimit: -1, // unlimited
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
