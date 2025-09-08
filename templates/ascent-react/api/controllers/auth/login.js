module.exports = {
  friendlyName: 'Login',
  description: 'Log in using the provided email and password combination.',
  extendedDescription: `This action attempts to look up the user record in the database with the
specified email address.  Then, if such a user exists, it uses
bcrypt to compare the hashed password from the database with the provided
password attempt.`,

  inputs: {
    email: {
      description: 'The email to try in this attempt, e.g. "irl@example.com".',
      type: 'string',
      isEmail: true,
      required: true
    },
    password: {
      description:
        'The unencrypted password to try in this attempt, e.g. "passwordlol".',
      type: 'string',
      required: true
    },
    rememberMe: {
      description: "Whether to extend the lifetime of the user's session.",
      type: 'boolean'
    }
  },

  exits: {
    success: {
      description: 'The requesting user agent has been successfully logged in.',
      responseType: 'redirect'
    },
    twoFactorRequired: {
      description: 'User has 2FA enabled and needs to complete verification.',
      responseType: 'redirect'
    },
    badCombo: {
      responseType: 'badRequest'
    }
  },

  fn: async function ({ email, password, rememberMe }) {
    const user = await User.findOne({
      email: email.toLowerCase()
    })

    if (!user || !user.password) {
      throw {
        badCombo: {
          problems: [{ login: 'Wrong email/password.' }]
        }
      }
    }

    await sails.helpers.passwords
      .checkPassword(password, user.password)
      .intercept('incorrect', () => {
        return {
          badCombo: {
            problems: [{ login: 'Wrong email/password.' }]
          }
        }
      })

    if (user.twoFactorEnabled) {
      this.req.session.partialLogin = {
        userId: user.id,
        rememberMe: rememberMe,
        intendedDestination: '/dashboard',
        loginTimestamp: Date.now()
      }

      const twoFactorMethods = {
        totp: user.totpEnabled,
        email: user.emailTwoFactorEnabled,
        defaultMethod: user.totpEnabled ? 'totp' : 'email'
      }

      this.req.session.twoFactorMethods = twoFactorMethods

      throw { twoFactorRequired: '/verify-2fa' }
    }

    if (rememberMe) {
      this.req.session.cookie.maxAge =
        sails.config.custom.rememberMeCookieMaxAge
    }

    this.req.session.userId = user.id
    return '/dashboard'
  }
}
