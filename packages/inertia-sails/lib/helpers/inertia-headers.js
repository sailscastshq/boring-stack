/**
 * Inertia.js protocol headers
 *
 * These headers are used for communication between the Inertia client and server.
 * @see https://inertiajs.com/the-protocol
 */

/** @type {string} - Indicates an Inertia request */
const INERTIA = 'X-Inertia'
/** @type {string} - Asset version for cache invalidation */
const VERSION = 'X-Inertia-Version'
/** @type {string} - Comma-separated list of props to include in partial reload */
const PARTIAL_DATA = 'X-Inertia-Partial-Data'
/** @type {string} - Comma-separated list of props to exclude in partial reload */
const PARTIAL_EXCEPT = 'X-Inertia-Partial-Except'
/** @type {string} - Error bag name for validation errors */
const ERROR_BAG = 'X-Inertia-Error-Bag'
/** @type {string} - Comma-separated list of merge props to reset */
const RESET = 'X-Inertia-Reset'
/** @type {string} - Component name for partial reload validation */
const PARTIAL_COMPONENT = 'X-Inertia-Partial-Component'
/** @type {string} - URL for external redirects */
const LOCATION = 'X-Inertia-Location'
/** @type {string} - Comma-separated list of once-props client already has */
const EXCEPT_ONCE_PROPS = 'X-Inertia-Except-Once-Props'

module.exports = {
  INERTIA,
  VERSION,
  PARTIAL_DATA,
  PARTIAL_EXCEPT,
  ERROR_BAG,
  RESET,
  PARTIAL_COMPONENT,
  LOCATION,
  EXCEPT_ONCE_PROPS
}
