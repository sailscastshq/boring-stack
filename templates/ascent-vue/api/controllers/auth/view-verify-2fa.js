module.exports = {
  friendlyName: 'View verify 2FA',
  description: 'Display the 2FA verification page for login.',

  exits: {
    success: {
      responseType: 'inertia'
    },
    redirect: {
      responseType: 'redirect'
    }
  },

  fn: async function () {
    if (!this.req.session.partialLogin) {
      return '/login'
    }

    const partialLogin = this.req.session.partialLogin
    const twoFactorMethods = this.req.session.twoFactorMethods

    if (Date.now() - partialLogin.loginTimestamp > 10 * 60 * 1000) {
      delete this.req.session.partialLogin
      delete this.req.session.twoFactorMethods
      throw { redirect: '/login' }
    }

    const user = await User.findOne({ id: partialLogin.userId }).select([
      'email'
    ])

    return {
      page: 'auth/verify-2fa',
      props: {
        twoFactorMethods,
        userEmail: user.email
      }
    }
  }
}
