const resolveProp = require('./resolve-prop')
/**
 * Resolve all page props.
 *
 * This function iterates over each property in the given object.
 * If a property is a function, it is invoked with the provided context.
 * Then, every property is passed to resolveProp() to see if it needs
 * any special handling.
 *
 * @param {Object} [props={}] - An object containing page props.
 * @returns {Promise<Object>} A promise that resolves to a new object with resolved props.
 */
module.exports = async function resolvePageProps(props = {}) {
  const entries = await Promise.all(
    Object.entries(props).map(async ([key, value]) => {
      if (typeof value === 'function') {
        const result = await value()
        return await resolveProp(key, result)
      }
      return await resolveProp(key, value)
    })
  )
  return Object.fromEntries(entries)
}
