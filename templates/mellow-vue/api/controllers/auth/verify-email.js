module.exports = {
  friendlyName: 'Verify email',

  description: `Confirm a new user's email address, or an existing user's request for an email address change,
  then redirect to either a special landing page (for newly-signed up users), or the account page
  (for existing users who just changed their email address).`,

  inputs: {
    token: {
      description: 'The verification token from the email.',
      example: 'lyCap0N9i8wKYz7rhrEPog'
    }
  },

  exits: {
    success: {
      description:
        'Email address confirmed and requesting user logged in.  Since this looks like a browser, redirecting...',
      responseType: 'redirect'
    },
    invalidOrExpiredToken: {
      responseType: 'expired',
      description: 'The provided token is expired, invalid, or already used up.'
    },
    emailAlreadyInUse: {
      statusCode: 409,
      viewTemplatePath: '500',
      description: 'The email address is no longer available.',
      extendedDescription:
        'This is an edge case that is not always anticipated by websites and APIs.  Since it is pretty rare, the 500 server error page is used as a simple catch-all.  If this becomes important in the future, this could easily be expanded into a custom error page or resolution flow.  But for context: this behavior of showing the 500 server error page mimics how popular apps like Slack behave under the same circumstances.'
    }
  },

  fn: async function ({ token }) {
    if (!token) {
      throw 'invalidOrExpiredToken'
    }

    const user = await User.findOne({ emailProofToken: token })

    if (!user || user.emailProofTokenExpiresAt <= Date.now()) {
      throw 'invalidOrExpiredToken'
    }

    if (user.emailStatus == 'unverified') {
      await User.updateOne({ id: user.id }).set({
        emailStatus: 'verified',
        emailProofToken: '',
        emailProofTokenExpiresAt: 0
      })

      this.req.session.userId = user.id
      delete this.req.session.userEmail

      return '/verify-email/success'
    } else if (user.emailStatus == 'change-requested') {
      if (!user.emailChangeCandidate) {
        throw new Error(
          `Consistency violation: Could not update user because this user record's emailChangeCandidate ("${user.emailChangeCandidate}") is missing.  (This should never happen.)`
        )
      }

      if ((await User.count({ email: user.emailChangeCandidate })) > 0) {
        throw 'emailAlreadyInUse'
      }

      await User.updateOne({ id: user.id }).set({
        emailStatus: 'confirmed',
        emailProofToken: '',
        emailProofTokenExpiresAt: 0,
        email: user.emailChangeCandidate,
        emailChangeCandidate: ''
      })
      this.req.session.userId = user.id
      return '/'
    } else {
      throw new Error(
        `Consistency violation: User ${user.id} has an email proof token, but somehow also has an emailStatus of "${user.emailStatus}"!  (This should never happen.)`
      )
    }
  }
}
