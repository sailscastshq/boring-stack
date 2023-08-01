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
    emailAlreadyInUse: {
      statusCode: 409,
      viewTemplatePath: '500',
      description: 'The email address is no longer available.',
      extendedDescription:
        'This is an edge case that is not always anticipated by websites and APIs.  Since it is pretty rare, the 500 server error page is used as a simple catch-all.  If this becomes important in the future, this could easily be expanded into a custom error page or resolution flow.  But for context: this behavior of showing the 500 server error page mimics how popular apps like Slack behave under the same circumstances.'
    },
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ fullName, email: userEmail, password }) {
    const email = userEmail.toLowerCase()

    const unverifiedUser = await User.create({
      email,
      password,
      fullName,
      tosAcceptedByIp: this.req.ip,
      emailProofToken: sails.helpers.strings.random('url-friendly'),
      emailProofTokenExpiresAt:
        Date.now() + sails.config.custom.emailProofTokenTTL
    })
      .intercept('E_UNIQUE', 'emailAlreadyInUse')
      .intercept({ name: 'UsageError' }, () => {
        throw {
          badSignupRequest: {
            problems: [
              `"signup" Apologies, but something went wrong with signing you up. Please try again.`
            ]
          }
        }
      })
      .fetch()

    this.req.session.userId = unverifiedUser.id

    await sails.helpers.mail.send.with({
      subject: 'Verify your email',
      template: 'email-verify-account',
      to: unverifiedUser.email,
      templateData: {
        token: unverifiedUser.emailProofToken,
        fullName: unverifiedUser.fullName
      }
    })
    return '/check-email'
  }
}
