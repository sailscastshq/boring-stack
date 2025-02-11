const { PARTIAL_EXCEPT } = require('../helpers/inertia-headers')
module.exports = function resolveExceptProps(req, props) {
  const partialExceptHeader = req.get(PARTIAL_EXCEPT)
  const except = partialExceptHeader.split(',').filter(Boolean)

  for (const key of except) delete props[key]

  return props
}
