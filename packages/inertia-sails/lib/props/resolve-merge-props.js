const { RESET } = require('../helpers/inertia-headers')
const MergeableProp = require('./mergeable-prop')

/**
 * Resolve merge props metadata for the page response.
 * Returns mergeProps and deepMergeProps arrays for the client.
 * @param {Object} req - The request object
 * @param {Object} pageProps - The page props
 * @returns {Object} - Object with mergeProps and/or deepMergeProps arrays
 */
module.exports = function resolveMergeProps(req, pageProps) {
  const inertiaResetHeader = req.get(RESET)
  const resetProps = new Set(inertiaResetHeader?.split(',').filter(Boolean))

  const mergeableEntries = Object.entries(pageProps || {}).filter(
    ([key, value]) =>
      value instanceof MergeableProp &&
      value.shouldMerge &&
      !resetProps.has(key)
  )

  // Props that should be shallow merged (appended)
  const mergeProps = mergeableEntries
    .filter(([_, value]) => !value.shouldDeepMerge)
    .map(([key]) => key)

  // Props that should be deep merged
  const deepMergeProps = mergeableEntries
    .filter(([_, value]) => value.shouldDeepMerge)
    .map(([key]) => key)

  const result = {}
  if (mergeProps.length) result.mergeProps = mergeProps
  if (deepMergeProps.length) result.deepMergeProps = deepMergeProps

  return result
}
