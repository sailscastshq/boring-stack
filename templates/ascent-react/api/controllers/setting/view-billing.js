module.exports = {
  friendlyName: 'View billing settings',

  description: 'Display "Billing Settings" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    const teamId = this.req.session.currentTeamId

    const subscription = await Subscription.findOne({
      team: teamId,
      status: ['active', 'past_due']
    })

    return {
      page: 'settings/billing',
      props: {
        plans: sails.config.pay.plans,
        subscription: subscription || null
      }
    }
  }
}
