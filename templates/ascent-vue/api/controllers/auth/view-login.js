module.exports = {
  friendlyName: 'View login',

  description: 'Display "Login" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    const passkeyChallenge = this.req.session.passkeyChallenge || null
    // Clear challenge from session after retrieving
    if (passkeyChallenge) {
      delete this.req.session.passkeyChallenge
    }

    return {
      page: 'auth/login',
      props: {
        passkeyChallenge
      }
    }
  }
}
