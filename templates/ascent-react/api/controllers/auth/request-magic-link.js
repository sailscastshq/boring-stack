const redirect = require('./redirect')

module.exports = {
  friendlyName: 'Request magic link',

  description:
    'Send a magic link to the provided email address for passwordless authentication.',

  extendedDescription: `This action generates a secure magic link token and sends it via email.
  If the user doesn't exist, they will be created automatically. The magic link expires after 15 minutes
  and can only be used once.`,

  inputs: {
    email: {
      description: 'The email address to send the magic link to',
      type: 'string',
      isEmail: true,
      required: true
    },

    fullName: {
      description:
        'Full name for new user creation (optional, defaults to email prefix)',
      type: 'string',
      maxLength: 120
    },
    redirectUrl: {
      description: 'URL to redirect to after sending the magic link',
      type: 'string',
      defaultsTo: '/login'
    },
    returnUrl: {
      description:
        'URL to redirect to after successful magic link authentication',
      type: 'string'
    }
  },

  exits: {
    success: {
      description: 'Magic link email sent successfully',
      responseType: 'redirect'
    },

    badRequest: {
      description: 'Invalid request parameters',
      responseType: 'badRequest'
    }
  },

  fn: async function ({ email, fullName, redirectUrl, returnUrl }) {
    const normalizedEmail = email.toLowerCase().trim()
    const now = Date.now()
    const rateLimitWindow = 15 * 60 * 1000 // 15 minutes

    // Simple rate limiting: check if user requested magic link recently
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser && existingUser.magicLinkTokenExpiresAt) {
      const timeSinceLastRequest =
        now - (existingUser.magicLinkTokenExpiresAt - 15 * 60 * 1000)
      if (timeSinceLastRequest < 2 * 60 * 1000) {
        // 2 minute cooldown
        throw {
          badRequest: {
            problems: [
              {
                magicLink:
                  'Please wait a moment before requesting another magic link.'
              }
            ]
          }
        }
      }
    }

    const plainToken = await sails.helpers.magicLink.generateToken()
    const hashedToken = await sails.helpers.magicLink.hashToken(plainToken)

    const expiresAt = now + 15 * 60 * 1000

    let user = await User.findOne({ email: normalizedEmail })

    if (
      user &&
      user.magicLinkToken &&
      !user.magicLinkTokenUsedAt &&
      user.magicLinkTokenExpiresAt > Date.now()
    ) {
      // Previous token is still valid, don't send new one
      this.req.flash('message', 'Magic link already sent. Check your email.')
      return redirectUrl
    }

    if (!user) {
      const defaultFullName = fullName || normalizedEmail.split('@')[0]

      // Create user with team using transaction
      const signupResult = await sails.helpers.user.signupWithTeam
        .with({
          fullName: defaultFullName,
          email: normalizedEmail,
          password: await sails.helpers.strings.random('url-friendly'), // Random password for magic link users
          emailProofToken: '', // Not needed for magic link users
          emailProofTokenExpiresAt: 0, // Not needed
          tosAcceptedByIp: this.req.ip
        })
        .intercept('emailTaken', (err) => {
          sails.log.error('Magic link user creation failed - email taken:', err)
          throw {
            badRequest: {
              problems: [
                { magicLink: 'An account with this email already exists' }
              ]
            }
          }
        })
        .intercept('serverError', (err) => {
          sails.log.error('Error creating user via magic link:', err)
          throw {
            badRequest: {
              problems: [{ magicLink: 'Failed to create user account' }]
            }
          }
        })

      user = signupResult.user

      // Update user with magic link token and verified status
      await User.updateOne({ id: user.id })
        .set({
          emailStatus: 'verified',
          magicLinkToken: hashedToken,
          magicLinkTokenExpiresAt: expiresAt,
          magicLinkTokenUsedAt: null
        })
        .intercept((err) => {
          sails.log.error('Error updating magic link token:', err)
          throw {
            badRequest: {
              problems: [{ magicLink: 'Failed to setup magic link' }]
            }
          }
        })
    } else {
      await User.updateOne({ id: user.id }).set({
        magicLinkToken: hashedToken,
        magicLinkTokenExpiresAt: expiresAt,
        magicLinkTokenUsedAt: null
      })
    }

    await sails.helpers.mail.send
      .with({
        subject: 'Your magic link to sign in',
        template: 'email-magic-link',
        to: normalizedEmail,
        templateData: {
          token: plainToken,
          fullName: user.fullName,
          email: normalizedEmail,
          magicLinkUrl:
            returnUrl && returnUrl.startsWith('/')
              ? `${
                  sails.config.custom.baseUrl
                }/magic-link/${plainToken}?returnUrl=${encodeURIComponent(
                  returnUrl
                )}`
              : `${sails.config.custom.baseUrl}/magic-link/${plainToken}`
        }
      })
      .intercept((error) => {
        sails.log.error('Error sending magic link email:', error)
        return {
          badRequest: {
            problems: [{ magicLink: 'Failed to send magic link email' }]
          }
        }
      })
    return `/check-email?type=magic-link&email=${encodeURIComponent(
      normalizedEmail
    )}&backUrl=${encodeURIComponent(redirectUrl)}`
  }
}
