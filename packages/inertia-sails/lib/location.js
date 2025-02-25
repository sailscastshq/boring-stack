const { INERTIA, LOCATION } = require('./helpers/inertia-headers')

module.exports = function (req, res, url) {
  if (req.get(INERTIA)) {
    // If the method is PUT, PATCH, or DELETE, force a 303 redirect (so the next request is a GET)
    if (['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return res.redirect(303, url)
    }
    // If this is an Inertia request, send a 409 Conflict response
    // with the X-Inertia-Location header so the client performs a full window.location visit.
    res.set(LOCATION, url)
    return res.status(409).end()
  }

  // Otherwise, perform a standard redirect (default is typically a 302)
  return res.redirect(url)
}
