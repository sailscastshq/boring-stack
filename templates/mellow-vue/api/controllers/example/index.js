module.exports = {
  friendlyName: 'Example',

  description: 'Example index.',

  inputs: {},

  exits: {},

  fn: async function () {
    return sails.inertia.render('example', {
      quote: "You can shine no matter what you're made of - Bigweld",
    })
  },
}
