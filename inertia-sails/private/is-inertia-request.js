const { INERTIA } = require('./inertia-headers')
module.exports = function isInertiaRequest(req) {
  return req.get(INERTIA)
}
