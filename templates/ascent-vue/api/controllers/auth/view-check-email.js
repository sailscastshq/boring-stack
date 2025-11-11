module.exports = {
  friendlyName: 'View check email',

  description:
    'Display "Check email" page for verification or magic link emails.',

  inputs: {
    type: {
      type: 'string',
      isIn: ['verification', 'magic-link', 'password-reset'],
      defaultsTo: 'verification'
    },
    email: {
      type: 'string',
      isEmail: true
    },
    title: {
      type: 'string'
    },
    backUrl: {
      type: 'string',
      defaultsTo: '/login'
    },
    backText: {
      type: 'string',
      defaultsTo: 'Back to login'
    }
  },

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function ({ type, email, title, backUrl, backText }) {
    // Get email from session if not provided (for signup flow)
    const emailToShow = email

    // Get stored returnUrl for resend functionality
    const storedReturnUrl = await sails.helpers.returnUrl.get(this.req)

    return {
      page: 'auth/check-email',
      props: {
        type,
        email: emailToShow,
        title,
        backUrl,
        backText,
        returnUrl: storedReturnUrl !== '/dashboard' ? storedReturnUrl : null
      }
    }
  }
}
