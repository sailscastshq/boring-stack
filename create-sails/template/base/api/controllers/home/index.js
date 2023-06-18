module.exports = {
  friendlyName: 'Home',

  description: 'Home index.',

  inputs: {},

  exits: {},

  fn: async function () {
    return sails.hooks.inertia.render('index', {
      name: 'Inertia',
    })
  },
}
