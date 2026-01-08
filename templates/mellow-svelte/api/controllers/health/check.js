module.exports = {
  friendlyName: 'Health check',

  description: 'Returns a 200 OK response for health check monitoring.',

  exits: {
    success: {
      statusCode: 200,
      description: 'Service is healthy.'
    }
  },

  fn: async function () {
    return { status: 'ok' }
  }
}
