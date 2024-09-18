module.exports = {
  friendlyName: 'View forgot password',

  description: 'Display "Forgot password" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'auth/forgot-password' }
  }
}
