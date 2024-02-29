module.exports = {
  friendlyName: 'View link expired',

  description: 'Display "Link expired" page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return { page: 'link-expired' }
  }
}
