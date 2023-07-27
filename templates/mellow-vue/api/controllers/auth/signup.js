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
      description: 'The provided email address is already in use.'
    },
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ fullName, email: userEmail, password }) {
    const email = userEmail.toLowerCase()

    const unverifiedUser = await User.create({
      id: sails.helpers.strings.uuid(),
      email,
      password: await sails.helpers.passwords.hashPassword(password),
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
