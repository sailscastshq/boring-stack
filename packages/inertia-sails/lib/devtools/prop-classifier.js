const {
  INFINITE_SCROLL_MERGE_INTENT,
  RESET
} = require('../helpers/inertia-headers')
const AlwaysProp = require('../props/always-prop')
const DeferProp = require('../props/defer-prop')
const MergeProp = require('../props/merge-prop')
const OnceProp = require('../props/once-prop')
const OptionalProp = require('../props/optional-prop')
const ScrollProp = require('../props/scroll-prop')
const { HEADERS, PROP_TYPES } = require('./constants')

/**
 * @param {any} req
 * @param {string} name
 * @returns {string|null}
 */
function readHeader(req, name) {
  const value =
    typeof req.get === 'function'
      ? req.get(name)
      : req.headers?.[name.toLowerCase()]
  return typeof value === 'string' && value !== '' ? value : null
}

/**
 * @param {any} req
 * @param {string} header
 * @returns {string[]}
 */
function headerList(req, header) {
  return (readHeader(req, header) || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

/**
 * @param {any} prop
 * @returns {'append'|'prepend'|null}
 */
function mergeDirection(prop) {
  if (prop instanceof ScrollProp) return null
  if (!prop?.shouldMerge) return null

  const operations = Array.isArray(prop.mergeOperations)
    ? /** @type {Array<{direction: string}>} */ (prop.mergeOperations)
    : []
  const prepends = operations.filter(
    (operation) => operation.direction === 'prepend'
  )
  const appends = operations.filter(
    (operation) => operation.direction === 'append'
  )

  if (prepends.length > 0 && appends.length === 0) return 'prepend'
  return 'append'
}

/**
 * @param {any} prop
 * @param {boolean} deferredDelivery
 * @returns {string|null}
 */
function inertiaType(prop, deferredDelivery) {
  if (prop instanceof AlwaysProp) return PROP_TYPES.ALWAYS
  if (prop instanceof DeferProp) {
    return deferredDelivery ? PROP_TYPES.DEFER : null
  }
  if (prop instanceof OptionalProp) return PROP_TYPES.OPTIONAL
  if (prop instanceof ScrollProp) return PROP_TYPES.SCROLL
  if (prop instanceof MergeProp) return PROP_TYPES.MERGE
  if (prop instanceof OnceProp) return PROP_TYPES.ONCE
  return null
}

/**
 * @param {string} path
 * @param {any} prop
 * @param {any} req
 * @returns {Record<string, any>}
 */
module.exports = function classifyProp(path, prop, req) {
  const deferredDelivery =
    prop instanceof DeferProp && readHeader(req, HEADERS.DEFERRED) !== null
  const type = inertiaType(prop, deferredDelivery)
  /** @type {Record<string, any>} */
  const metadata = { inertiaType: type }

  if (headerList(req, RESET).includes(path)) {
    metadata.reset = true
  }

  if (prop instanceof OnceProp) {
    metadata.once = true
  }

  if (deferredDelivery) {
    metadata.deferGroup = prop.getGroup()
  }

  let direction = mergeDirection(prop)
  if (prop instanceof ScrollProp) {
    direction =
      readHeader(req, INFINITE_SCROLL_MERGE_INTENT) === 'prepend'
        ? 'prepend'
        : 'append'
  }
  if (direction !== null) {
    metadata.mergeDirection = direction
  }

  if (prop?.shouldDeepMerge === true) metadata.deepMerge = true
  if (Array.isArray(prop?.matchOnPaths) && prop.matchOnPaths.length > 0) {
    metadata.matchOn = [...prop.matchOnPaths]
  } else if (prop instanceof ScrollProp && prop.matchOnPath) {
    metadata.matchOn = [prop.matchOnPath]
  }

  return metadata
}

module.exports.readHeader = readHeader
