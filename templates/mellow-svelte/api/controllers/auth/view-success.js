module.exports = {
  friendlyName: 'View success email',

  description: 'Display "Success" page.',
  inputs: {
    operation: {
      isIn: ['verify-email', 'check-email', 'reset-password']
    }
  },
  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function ({ operation }) {
    let message
    const pageTitle = `${sails.helpers.capitalize(operation)}`
    let pageHeading
    switch (operation) {
      case 'verify-email':
        message = 'Email has been successfully verified'
        pageHeading = 'Email verification successful'
        break
      case 'check-email':
        message = 'An email has been sent to your inbox'
        pageHeading = 'Please check your email'
        break
      case 'reset-password':
        message = 'Password has been successfully reset'
        pageHeading = 'Password reset successful'
    }
    return {
      page: 'auth/success',
      props: {
        pageTitle,
        pageHeading,
        message
      }
    }
  }
}
