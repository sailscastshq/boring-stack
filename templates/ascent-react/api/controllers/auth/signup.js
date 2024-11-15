module.exports = {
  friendlyName: 'Register',

  description: 'Register auth.',

  inputs: {
    fullName: {
      type: 'string',
      maxLength: 120,
      required: true
    },
    email: {
      type: 'string',
      isEmail: true,
      required: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8
    }
  },

  exits: {
    badSignupRequest: {
      responseType: 'badRequest',
      description:
        'The provided fullName, password and/or email address are invalid.',
      extendedDescription:
        'If this request was sent from a graphical user interface, the request ' +
        'parameters should have been validated/coerced _before_ they were sent.'
    },
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ fullName, email: userEmail, password }) {
    const email = userEmail.toLowerCase()
    const emailProofToken = await sails.helpers.strings.random('url-friendly')
    try {
      unverifiedUser = await User.create({
        email,
        password,
        fullName,
        tosAcceptedByIp: this.req.ip,
        emailProofToken,
        emailProofTokenExpiresAt:
          Date.now() + sails.config.custom.emailProofTokenTTL
      }).fetch()
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw {
          badSignupRequest: {
            problems: [
              {
                email: 'An account with this email address already exists.'
              }
            ]
          }
        }
      } else if (error.name === 'UsageError') {
        throw {
          badSignupRequest: {
            problems: [
              {
                signup:
                  'Apologies, but something went wrong with signing you up. Please try again.'
              }
            ]
          }
        }
      }
    }

    await sails.helpers.mail.send.with({
      subject: 'Verify your email',
      template: 'email-verify-account',
      to: unverifiedUser.email,
      templateData: {
        token: unverifiedUser.emailProofToken,
        fullName: unverifiedUser.fullName
      }
    })
    this.req.session.userEmail = unverifiedUser.email
    return '/check-email'
  }
}
