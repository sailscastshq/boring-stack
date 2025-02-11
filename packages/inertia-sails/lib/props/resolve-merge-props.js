const { RESET } = require('../helpers/inertia-headers')
const MergeableProp = require('./mergeable-prop')
module.exports = function resolveMergeProps(req, pageProps) {
  const inertiaResetHeader = req.get(RESET)
  const resetProps = new Set(inertiaResetHeader?.split(',').filter(Boolean))

  const mergeProps = Object.entries(pageProps || {})
    .filter(([_, value]) => value instanceof MergeableProp && value.shouldMerge)
    .map(([key]) => key)
    .filter((key) => !resetProps.has(key))

  return mergeProps.length ? { mergeProps } : {}
}
