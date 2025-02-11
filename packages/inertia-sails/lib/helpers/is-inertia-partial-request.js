const { PARTIAL_COMPONENT } = require('./inertia-headers')
module.exports = function isInertiaPartialRequest(req, component) {
  return req.get(PARTIAL_COMPONENT) === component
}
