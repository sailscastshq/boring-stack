module.exports = {
  friendlyName: 'View pricing',

  description: 'Display the pricing page with plan data.',

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
