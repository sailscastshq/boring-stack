module.exports = {
  friendlyName: 'Disable passkeys',
  description: 'Disable all passkeys for the logged-in user.',
  inputs: {},
  exits: {
    success: {
      responseType: 'redirect',
      description: 'All passkeys disabled successfully.'
    }
  },

  fn: async function () {
    await User.updateOne(this.req.session.userId).set({
      passkeys: null,
      passkeyEnabled: false,
      passkeyChallenge: null,
      passkeyChallengeExpiresAt: null
    })

    this.req.flash(
      'success',
      'All passkeys have been disabled. You can set them up again anytime.'
    )
    return '/settings/security'
  }
}
