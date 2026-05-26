const {
  INFINITE_SCROLL_MERGE_INTENT,
  RESET
} = require('../helpers/inertia-headers')
const MergeableProp = require('./mergeable-prop')
const { resolvePropPath, unique } = require('./merge-targets')
const ScrollProp = require('./scroll-prop')

/**
 * @typedef {import('../types').InertiaProps} InertiaProps
 * @typedef {{ get: (header: string) => any }} HeaderRequest
 *
 * @typedef {Object} MergePropsMetadata
 * @property {string[]} [mergeProps]
 * @property {string[]} [prependProps]
 * @property {string[]} [deepMergeProps]
 * @property {string[]} [matchPropsOn]
 */

/**
 * Resolve merge props metadata for the page response.
 * Returns mergeProps and deepMergeProps arrays for the client.
 * @param {HeaderRequest} req - The request object
 * @param {InertiaProps} pageProps - The page props
 * @returns {MergePropsMetadata} - Object with mergeProps and/or deepMergeProps arrays
 */
module.exports = function resolveMergeProps(req, pageProps) {
  const inertiaResetHeader = req.get(RESET)
  const resetProps = new Set(inertiaResetHeader?.split(',').filter(Boolean))
  const infiniteScrollMergeIntent = req.get(INFINITE_SCROLL_MERGE_INTENT)

  /** @type {string[]} */
  const mergeProps = []
  /** @type {string[]} */
  const prependProps = []
  /** @type {string[]} */
  const deepMergeProps = []
  /** @type {string[]} */
  const matchPropsOn = []

  Object.entries(pageProps || {}).forEach(([key, value]) => {
    if (!(value instanceof MergeableProp) || !value.shouldMerge) return
    if (resetProps.has(key)) return

    if (value instanceof ScrollProp) {
      const propPath = resolvePropPath(key, value.wrapper)
      if (resetProps.has(propPath)) return

      if (infiniteScrollMergeIntent === 'prepend') {
        prependProps.push(propPath)
      } else {
        mergeProps.push(propPath)
      }

      if (value.matchOnPath) {
        matchPropsOn.push(resolvePropPath(propPath, value.matchOnPath))
      }

      return
    }

    if (value.shouldDeepMerge) {
      deepMergeProps.push(key)
      value.matchOnPaths.forEach((path) => {
        matchPropsOn.push(resolvePropPath(key, path))
      })
      return
    }

    value.mergeOperations.forEach((operation) => {
      const propPath = resolvePropPath(key, operation.path)
      if (resetProps.has(propPath)) return

      if (operation.direction === 'prepend') {
        prependProps.push(propPath)
      } else {
        mergeProps.push(propPath)
      }

      if (operation.matchOn) {
        matchPropsOn.push(resolvePropPath(propPath, operation.matchOn))
      }
    })

    value.matchOnPaths.forEach((path) => {
      matchPropsOn.push(resolvePropPath(key, path))
    })
  })

  /** @type {MergePropsMetadata} */
  const result = {}
  if (mergeProps.length) result.mergeProps = unique(mergeProps)
  if (prependProps.length) result.prependProps = unique(prependProps)
  if (deepMergeProps.length) result.deepMergeProps = unique(deepMergeProps)
  if (matchPropsOn.length) result.matchPropsOn = unique(matchPropsOn)

  return result
}
