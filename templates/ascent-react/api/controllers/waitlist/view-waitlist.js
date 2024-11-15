module.exports = {
  friendlyName: 'View waitlist',

  description: 'Display "Waitlist" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    // Respond with view.
    return { page: 'waitlist' }
  }
}
