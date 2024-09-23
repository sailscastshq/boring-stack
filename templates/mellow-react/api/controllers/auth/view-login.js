module.exports = {
  friendlyName: 'View login',

  description: 'Display "Login" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'auth/login' }
  }
}
