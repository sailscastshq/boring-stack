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
    emailTaken: {
      responseType: 'badRequest',
      description: 'An account with this email address already exists.'
    },
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ fullName, email: userEmail, password }) {
    const email = userEmail.toLowerCase()
    const emailProofToken = await sails.helpers.strings.random('url-friendly')

    const signupResult = await sails.helpers.user.signupWithTeam
      .with({
        fullName,
        email,
        password,
        emailProofToken,
        emailProofTokenExpiresAt:
          Date.now() + sails.config.custom.emailProofTokenTTL,
        tosAcceptedByIp: this.req.ip
      })
      .intercept('emailTaken', () => {
        return {
          badSignupRequest: {
            problems: [
              {
                email: 'An account with this email address already exists.'
              }
            ]
          }
        }
      })
      .intercept('serverError', () => {
        return {
          badSignupRequest: {
            problems: [
              {
                signup:
                  'Apologies, but something went wrong with signing you up. Please try again.'
              }
            ]
          }
        }
      })

    const unverifiedUser = signupResult.user

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
