const {
  INFINITE_SCROLL_MERGE_INTENT,
  RESET
} = require('../helpers/inertia-headers')
const MergeableProp = require('./mergeable-prop')
const ScrollProp = require('./scroll-prop')

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
  const infiniteScrollMergeIntent = req.get(INFINITE_SCROLL_MERGE_INTENT)

  const mergeProps = []
  const prependProps = []
  const deepMergeProps = []
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

      if (value.matchOn) {
        matchPropsOn.push(resolvePropPath(propPath, value.matchOn))
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

  const result = {}
  if (mergeProps.length) result.mergeProps = unique(mergeProps)
  if (prependProps.length) result.prependProps = unique(prependProps)
  if (deepMergeProps.length) result.deepMergeProps = unique(deepMergeProps)
  if (matchPropsOn.length) result.matchPropsOn = unique(matchPropsOn)

  return result
}

function resolvePropPath(key, path) {
  return path ? `${key}.${path}` : key
}

function unique(values) {
  return [...new Set(values)]
}
