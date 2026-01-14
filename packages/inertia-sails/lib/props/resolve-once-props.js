const OnceProp = require('./once-prop')
const { EXCEPT_ONCE_PROPS } = require('../helpers/inertia-headers')

/**
 * Get the list of once-props that the client already has cached.
 * These are sent via the X-Inertia-Except-Once-Props header.
 * @param {Object} req - The request object
 * @returns {string[]} - Array of prop keys the client already has
 */
function getExceptOnceProps(req) {
  const header = req.get(EXCEPT_ONCE_PROPS) || ''
  return header
    ? header
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []
}

/**
 * Filter out once-props that the client already has cached.
 * This prevents re-sending data the client doesn't need.
 * @param {Object} req - The request object
 * @param {Object} props - The props object
 * @returns {Object} - Filtered props with cached once-props removed
 */
function filterOnceProps(req, props) {
  const exceptOnceProps = getExceptOnceProps(req)

  if (exceptOnceProps.length === 0) {
    return props
  }

  const filtered = {}
  for (const [key, value] of Object.entries(props)) {
    // Keep the prop if it's not a OnceProp
    if (!(value instanceof OnceProp)) {
      filtered[key] = value
      continue
    }

    // Keep if it should be refreshed (force send)
    if (value.shouldBeRefreshed()) {
      filtered[key] = value
      continue
    }

    // Keep if the client doesn't have it cached
    const propKey = value.getKey() || key
    if (!exceptOnceProps.includes(propKey)) {
      filtered[key] = value
    }
    // If client has it cached, we skip adding it to filtered
  }

  return filtered
}

/**
 * Build the onceProps metadata for the page response.
 * This tells the client which props are "once" props and their expiration.
 * @param {Object} props - The props object
 * @returns {Object} - Object with onceProps key if any exist, empty object otherwise
 */
function resolveOncePropsMetadata(props) {
  const onceProps = {}

  for (const [key, value] of Object.entries(props)) {
    if (value instanceof OnceProp) {
      const propKey = value.getKey() || key
      onceProps[propKey] = {
        prop: key,
        expiresAt: value.expiresAt()
      }
    }
  }

  if (Object.keys(onceProps).length === 0) {
    return {}
  }

  return { onceProps }
}

module.exports = {
  getExceptOnceProps,
  filterOnceProps,
  resolveOncePropsMetadata
}
