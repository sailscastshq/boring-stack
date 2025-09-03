module.exports = {
  friendlyName: 'Delete profile',

  description:
    "Delete the logged-in user's account after verifying the password.",

  inputs: {
    password: {
      type: 'string',
      required: true,
      description: 'The current password of the user to verify before deletion.'
    }
  },

  exits: {
    success: {
      responseType: 'inertiaRedirect',
      description: 'User account deleted successfully.'
    },
    unauthorized: {
      responseType: 'inertiaRedirect',
      description: 'User is not logged in.'
    }
  },

  fn: async function ({ password }) {
    const userId = this.req.session.userId
    const user = await User.findOne({ id: userId }).intercept(
      'notFound',
      () => {
        delete this.req.session.userId
        return { unauthorized: '/login' }
      }
    )

    const passwordMatch = await sails.helpers.passwords
      .checkPassword(password, user.password)
      .intercept('incorrect', () => {
        delete this.req.session.userId
        return { unauthorized: '/login' }
      })

    await User.destroy({ id: userId }).intercept('error', (err) => {
      sails.log.error('Error deleting account:', err)
      throw 'error'
    })

    delete this.req.session.userId

    return '/login'
  }
}
