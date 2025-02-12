const isInertiaPartialRequest = require('../helpers/is-inertia-partial-request')
const DeferProp = require('./defer-prop')
module.exports = function resolveDeferredProps(req, component, pageProps) {
  if (isInertiaPartialRequest(req, component)) return {}
  const deferredProps = Object.entries(pageProps || {})
    .filter(([_, value]) => value instanceof DeferProp)
    .map(([key, value]) => ({ key, group: value.getGroup() }))
    .reduce((groups, { key, group }) => {
      if (!groups[group]) groups[group] = []
      groups[group].push(key)
      return groups
    }, {})

  return Object.keys(deferredProps).length ? { deferredProps } : {}
}
