const OptionalProp = require('./optional-prop')
const MergeProp = require('./merge-prop')
const DeferProp = require('./defer-prop')
const AlwaysProp = require('./always-prop')
/**
 * Resolve a single prop.
 *
 * If the value is an instance of one of our special prop types,
 * we assume it has a "callback" property that should be executed
 * to retrieve the final value.
 *
 * @param {string} key - The key for the prop.
 * @param {any} value - The value to resolve.
 * @returns {Promise<[string, any]>} A promise that resolves to a key-value pair.
 */
module.exports = async function resolveProp(key, value) {
  if (
    value instanceof OptionalProp ||
    value instanceof MergeProp ||
    value instanceof DeferProp ||
    value instanceof AlwaysProp
  ) {
    return [key, await value.callback()]
  }

  return [key, value]
}
