const { PARTIAL_DATA } = require('../helpers/inertia-headers')
/**
 * Extracts only the props specified by the partial header from the given props object.
 *
 * This function reads the header defined by the PARTIAL_DATA constant from the request,
 * which should contain a comma-separated list of property keys. It then constructs and returns
 * a new object that includes only those keys from the provided props object.
 *
 * @param {Object} req - The Express-style request object. It must have a `get` method to retrieve headers.
 * @param {Object} props - The complete set of props.
 * @returns {Object} An object containing only the properties whose keys were specified in the partial header.
 */
module.exports = function resolveOnlyProps(req, props) {
  const partialOnlyHeader = req.get(PARTIAL_DATA)
  const only = partialOnlyHeader.split(',').filter(Boolean)
  let newProps = {}

  for (const key of only) newProps[key] = props[key]

  return newProps
}
