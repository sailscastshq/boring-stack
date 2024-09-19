module.exports = {
  friendlyName: 'Callback',

  description: 'Callback auth.',

  inputs: {
    provider: {
      isIn: ['google'],
      required: true
    },
    code: {
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    }
  },
  fn: async function ({ code, provider }, exits) {
    const req = this.req
    const googleUser = await sails.wish.provider(provider).user(code)

    User.findOrCreate(
      { or: [{ googleId: googleUser.id }, { email: googleUser.email }] },
      {
        googleId: googleUser.id,
        email: googleUser.email,
        fullName: googleUser.name,
        googleAvatarUrl: googleUser.picture,
        googleAccessToken: googleUser.accessToken,
        googleIdToken: googleUser.idToken,
        emailStatus: googleUser.verified_email ? 'verified' : 'unverified'
      }
    ).exec(async (error, user, wasCreated) => {
      if (error) throw error

      if (!wasCreated && googleUser.verified_email) {
        await User.updateOne({ id: user.id }).set({
          emailStatus: 'verified'
        })
      }
      if (!wasCreated && user.googleId !== googleUser.id) {
        // Checks if the user email has changed since last log in
        // And then update the email change candidate which will be used be used to prompt the user to update their email
        await User.updateOne({ id: user.id }).set({
          emailChangeCandidate: googleUser.email
        })
      }
      if (!wasCreated && user.email !== googleUser.email) {
        // Checks if the user email has changed since last log in
        // And then update the email change candidate which will be used be used to prompt the user to update their email
        await User.updateOne({ id: user.id }).set({
          emailChangeCandidate: googleUser.email
        })
      }

      // Checks if the user name has changed since last log in
      // And then update the name if changed
      if (!wasCreated && user.fullName !== googleUser.name) {
        await User.updateOne({ id: user.id }).set({
          fullName: googleUser.name
        })
      }

      if (!wasCreated && user.googleAvatarUrl !== googleUser.picture) {
        await User.updateOne({ id: user.id }).set({
          googleAvatarUrl: googleUser.picture
        })
      }

      if (!wasCreated && user.googleAccessToken !== googleUser.accessToken) {
        await User.updateOne({ id: user.id }).set({
          googleAccessToken: googleUser.accessToken
        })
      }

      if (!wasCreated && user.googleIdToken !== googleUser.idToken) {
        await User.updateOne({ id: user.id }).set({
          googleIdToken: googleUser.idToken
        })
      }

      req.session.userId = user.id
      const urlToRedirectTo = '/dashboard'
      return exits.success(urlToRedirectTo)
    })
  }
}
