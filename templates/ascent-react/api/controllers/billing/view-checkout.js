module.exports = {
  friendlyName: 'View checkout',

  description: 'Generate checkout URL for a specific plan and billing cycle.',

  inputs: {
    plan: {
      type: 'string',
      required: true,
      isIn: ['starter', 'pro']
    },
    billingCycle: {
      type: 'string',
      required: true,
      isIn: ['monthly', 'yearly']
    }
  },

  exits: {
    success: {
      responseType: 'inertiaRedirect'
    },
    badRequest: {
      responseType: 'badRequest'
    },
    serverError: {
      responseType: 'serverError'
    }
  },

  fn: async function ({ plan, billingCycle }) {
    let checkoutUrl
    const planConfig = sails.config.pay.plans[plan]

    if (!planConfig) {
      throw {
        invalidPlan: {
          problems: [{ plan: 'Invalid plan selected.' }]
        }
      }
    }
    const variant = planConfig.variants[billingCycle]
    if (!variant || !variant.id) {
      throw {
        invalidVariant: {
          problems: [
            { billingCycle: 'Invalid billing cycle or variant not configured.' }
          ]
        }
      }
    }
    try {
      checkoutUrl = await sails.pay.checkout({
        variant: variant.id,
        productOptions: {
          enabled_variants: [variant.id]
        },
        checkoutData: {
          email: this.req.session.userId
            ? (
                await User.findOne(this.req.session.userId)
              ).emailAddress
            : undefined
        }
      })
    } catch (error) {
      sails.log.error('Checkout error:', error)
      throw 'serverError'
    }
    return checkoutUrl
  }
}
