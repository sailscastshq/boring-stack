module.exports = function badRequest(optionalData) {
  return this.req._sails.inertia.handleBadRequest(
    this.req,
    this.res,
    optionalData
  )
}
