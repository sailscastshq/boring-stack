module.exports = function serverError(error) {
  return this.req._sails.inertia.handleServerError(this.req, this.res, error)
}
