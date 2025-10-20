module.exports = {
  friendlyName: 'Lemon Squeezy webhook',

  description: 'Handle Lemon Squeezy webhook events',

  inputs: {
    meta: {
      type: 'ref',
      required: true
    },
    data: {
      type: 'ref',
      required: true
    },
    webhookSecret: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      description: 'Webhook processed successfully'
    },
    missingLemonSqueezyHeader: {
      responseType: 'unauthorized'
    }
  },

  fn: async function ({ meta, data, webhookSecret }) {
    if (!this.req.get('X-Signature')) {
      throw 'missingLemonSqueezyHeader'
    }

    const provider = sails.config.pay.provider
    const providerSecret = sails.config.pay.providers[provider].signingSecret

    if (providerSecret !== webhookSecret) {
      throw new Error(`Invalid webhook secret: ${webhookSecret}`)
    }

    if (data.type !== 'subscriptions') {
      return
    }

    switch (meta.event_name) {
      case 'subscription_created':
        const teamId = parseInt(meta.custom_data?.team)
        if (!teamId) {
          sails.log.warn('Subscription created without team_id')
          return
        }

        const planInfo = getPlanFromVariantId(data.attributes.variant_id)
        if (!planInfo) {
          sails.log.warn(`Unknown variant_id: ${data.attributes.variant_id}`)
          return
        }

        await Subscription.create({
          subscriptionId: data.id,
          status: data.attributes.status,
          planName: planInfo.plan,
          billingCycle: planInfo.cycle,
          currentPeriodStart: new Date(
            data.attributes.created_at
          ).toISOString(),
          currentPeriodEnd: data.attributes.renews_at,
          nextBillingDate: data.attributes.renews_at,
          team: teamId
        })

        sails.log.info(
          `Subscription created for team ${teamId}: ${planInfo.plan}/${planInfo.cycle}`
        )
        break

      case 'subscription_updated':
        await Subscription.updateOne({ subscriptionId: data.id }).set({
          status: data.attributes.status,
          nextBillingDate: data.attributes.renews_at
        })

        sails.log.info(
          `Subscription updated: ${data.id} - ${data.attributes.status}`
        )
        break
    }

    return
  }
}

function getPlanFromVariantId(variantId) {
  const plans = sails.config.pay.plans

  for (const [planName, planConfig] of Object.entries(plans)) {
    for (const [cycle, variant] of Object.entries(planConfig.variants)) {
      if (variant.id === variantId) {
        return { plan: planName, cycle }
      }
    }
  }

  return null
}
