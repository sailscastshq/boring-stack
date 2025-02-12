module.exports = function inertiaRedirect(url) {
  return this.req._sails.inertia.location(this.req, this.res, url)
}
