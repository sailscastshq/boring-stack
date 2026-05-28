module.exports = function forbidden(error) {
  return this.req._sails.inertia.handleErrorPage(this.req, this.res, {
    statusCode: 403,
    error
  })
}
