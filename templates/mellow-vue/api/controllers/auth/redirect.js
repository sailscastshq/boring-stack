module.exports = {
  friendlyName: 'Redirect',

  description: 'Redirect auth.',

  inputs: {},

  exits: {
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function () {
    return sails.wish.provider('google').redirect()
  }
}
