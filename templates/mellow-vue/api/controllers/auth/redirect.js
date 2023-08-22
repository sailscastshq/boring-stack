module.exports = {
  friendlyName: 'Redirect',

  description: 'Redirect auth.',

  inputs: {
    provider: {
      isIn: ['google'],
      required: true
    }
  },

  exits: {
    success: {
      responseType: 'redirect'
    }
  },

  fn: async function ({ provider }) {
    return sails.wish.provider(provider).redirect()
  }
}
