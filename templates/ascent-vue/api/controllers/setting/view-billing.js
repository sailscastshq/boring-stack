module.exports = {
  friendlyName: 'View billing settings',

  description: 'Display "Billing Settings" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    const teamId = this.req.session.teamId
    const subscription = await Subscription.findOne({
      team: teamId,
      status: ['active', 'past_due']
    })

    let subscriptionWithPortal = null

    if (subscription && subscription.subscriptionId) {
      try {
        const { data } = await sails.pay.subscription.get({
          id: subscription.subscriptionId
        })

        subscriptionWithPortal = {
          ...subscription,
          productName: data.attributes.product_name,
          variantName: data.attributes.variant_name,
          cardBrand: data.attributes.card_brand,
          cardLastFour: data.attributes.card_last_four,
          paymentProcessor: data.attributes.payment_processor,
          cancelled: data.attributes.cancelled,
          customerPortalUrl: data.attributes.urls.customer_portal,
          customerPortalUpdateSubscriptionUrl:
            data.attributes.urls.customer_portal_update_subscription,
          updatePaymentMethodUrl: data.attributes.urls.update_payment_method
        }
      } catch (error) {
        sails.log.warn(
          'Failed to fetch Lemon Squeezy subscription data:',
          error
        )
        subscriptionWithPortal = subscription
      }
    }
    return {
      page: 'settings/billing',
      props: {
        plans: sails.config.pay.plans,
        subscription: subscriptionWithPortal
      }
    }
  }
}
