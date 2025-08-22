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

  fn: async function ({ email, fullName, redirectUrl }) {
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
      user = await User.create({
        email: normalizedEmail,
        fullName: defaultFullName,
        emailStatus: 'verified',
        magicLinkToken: hashedToken,
        magicLinkTokenExpiresAt: expiresAt,
        magicLinkTokenUsedAt: null
      }).fetch()
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
          magicLinkUrl: `${sails.config.custom.baseUrl}/magic-link/${plainToken}`
        }
      })
      .intercept((error) => {
        sails.log.error('Error sending magic link email:', error)
        throw {
          badRequest: {
            problems: [{ magicLink: 'Failed to send magic link email' }]
          }
        }
      })
    this.req.flash('success', 'Check your email for the magic link.')
    return redirectUrl
  }
}
