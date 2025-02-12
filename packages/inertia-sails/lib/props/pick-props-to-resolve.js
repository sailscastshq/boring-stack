const isInertiaPartialRequest = require('../helpers/is-inertia-partial-request')
const ignoreFirstLoadSymbol = require('../helpers/ignore-first-load-symbol')
const { PARTIAL_DATA, PARTIAL_EXCEPT } = require('../helpers/inertia-headers')
const resolveOnlyProps = require('./resolve-only-props')
const resolveExceptProps = require('./resolve-except-props')
const AlwaysProp = require('./always-prop')

module.exports = function pickPropsToResolve(req, component, props = {}) {
  const isPartial = isInertiaPartialRequest(req, component)
  let newProps = props

  if (!isPartial) {
    newProps = Object.fromEntries(
      Object.entries(props).filter(([_, value]) => {
        if (value && value[ignoreFirstLoadSymbol]) return false
        return true
      })
    )
  }

  if (isPartial && req.get(PARTIAL_DATA)) {
    newProps = resolveOnlyProps(req, newProps)
  }

  if (isPartial && req.get(PARTIAL_EXCEPT)) {
    newProps = resolveExceptProps(req, newProps)
  }

  for (const [key, value] of Object.entries(props)) {
    if (value instanceof AlwaysProp) newProps[key] = props[key]
  }

  return newProps
}
