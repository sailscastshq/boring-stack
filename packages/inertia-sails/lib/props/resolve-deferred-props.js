const isInertiaPartialRequest = require('../helpers/is-inertia-partial-request')
const DeferProp = require('./defer-prop')

/**
 * @typedef {import('../types').InertiaRequest} InertiaRequest
 * @typedef {import('../types').InertiaProps} InertiaProps
 *
 * @typedef {Object} DeferredPropsMetadata
 * @property {Record<string, string[]>} [deferredProps]
 */

/**
 * @param {InertiaRequest} req
 * @param {string} component
 * @param {InertiaProps} pageProps
 * @returns {DeferredPropsMetadata}
 */
module.exports = function resolveDeferredProps(req, component, pageProps) {
  if (isInertiaPartialRequest(req, component)) return {}
  /** @type {Record<string, string[]>} */
  const deferredProps = Object.entries(pageProps || {})
    .filter(([_, value]) => value instanceof DeferProp)
    .map(([key, value]) => ({ key, group: value.getGroup() }))
    .reduce((groups, { key, group }) => {
      if (!groups[group]) groups[group] = []
      groups[group].push(key)
      return groups
    }, /** @type {Record<string, string[]>} */ ({}))

  return Object.keys(deferredProps).length ? { deferredProps } : {}
}
