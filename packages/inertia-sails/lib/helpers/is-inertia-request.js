const { INERTIA } = require('./inertia-headers')

/**
 * @typedef {import('../types').InertiaRequest} InertiaRequest
 */

/**
 * @param {InertiaRequest} req
 * @returns {any}
 */
module.exports = function isInertiaRequest(req) {
  return req.get(INERTIA)
}
