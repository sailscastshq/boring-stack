module.exports = {
  friendlyName: 'View contact',
  description: 'Display the contact page.',

  exits: {
    success: {
      responseType: 'inertia'
    }
  },

  fn: async function () {
    return {
      page: 'contact',
      props: {
        internalEmail: sails.config.custom.internalEmail
      }
    }
  }
}
