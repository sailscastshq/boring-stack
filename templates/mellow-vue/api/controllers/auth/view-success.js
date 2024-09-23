module.exports = {
  friendlyName: 'View success email',

  description: 'Display "Success" page.',
  inputs: {
    operation: {
      isIn: ['verify-email', 'reset-password']
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
