const { PARTIAL_COMPONENT } = require('./inertia-headers')

/**
 * @typedef {import('../types').InertiaRequest} InertiaRequest
 */

/**
 * @param {InertiaRequest} req
 * @param {string} component
 * @returns {boolean}
 */
module.exports = function isInertiaPartialRequest(req, component) {
  return req.get(PARTIAL_COMPONENT) === component
}
