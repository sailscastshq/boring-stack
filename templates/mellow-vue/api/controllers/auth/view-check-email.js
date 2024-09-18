module.exports = {
  friendlyName: 'View verify email',

  description: 'Display "Verify email" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    let message = `We sent a link to the email address you provided. Please check your inbox and follow the instructions.`
    return {
      page: 'auth/check-email',
      props: {
        message
      }
    }
  }
}
