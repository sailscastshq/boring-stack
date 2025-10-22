module.exports = {
  friendlyName: 'Check subscription plan',

  description: 'Check team subscription status and plan limits',

  inputs: {
    teamId: {
      type: 'string',
      required: true,
      description: 'Team ID to check subscription for'
    }
  },

  exits: {
    success: {
      outputFriendlyName: 'Subscription info',
      outputDescription: 'Team subscription details and limits'
    }
  },

  fn: async function ({ teamId }) {
    // Find active subscription for team
    const subscription = await Subscription.findOne({
      team: teamId,
      status: ['active', 'past_due']
    })

    // If no subscription, return free tier limits
    if (!subscription) {
      return {
        hasSubscription: false,
        planName: 'free',
        memberLimit: 0,
        canAddMembers: false,
        needsUpgrade: true
      }
    }

    // Get plan config
    const planConfig = sails.config.pay.plans[subscription.planName]

    if (!planConfig) {
      return {
        hasSubscription: false,
        planName: 'unknown',
        memberLimit: 0,
        canAddMembers: false,
        needsUpgrade: true
      }
    }

    // Count current team members
    const memberCount = await Membership.count({ team: teamId })

    const memberLimit = planConfig.memberLimit
    const canAddMembers = memberLimit === -1 || memberCount < memberLimit

    return {
      hasSubscription: true,
      subscription,
      planName: subscription.planName,
      memberLimit: memberLimit === -1 ? 'unlimited' : memberLimit,
      memberCount,
      canAddMembers,
      needsUpgrade: !canAddMembers
    }
  }
}
