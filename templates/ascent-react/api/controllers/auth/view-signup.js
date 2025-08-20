module.exports = {
  friendlyName: 'View signup',

  description: 'Display "Signup" page.',
  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'auth/signup' }
  }
}
