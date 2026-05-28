module.exports = function notFound(error) {
  return this.req._sails.inertia.handleErrorPage(this.req, this.res, {
    statusCode: 404,
    error
  })
}
