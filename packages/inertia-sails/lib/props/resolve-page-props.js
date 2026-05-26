const DeferProp = require('./defer-prop')
const resolveProp = require('./resolve-prop')

/**
 * @typedef {import('../types').InertiaProps} InertiaProps
 * @typedef {import('../types').ResolvedPageProps} ResolvedPageProps
 *
 * @typedef {((props?: InertiaProps) => Promise<InertiaProps>) & {
 *   withMetadata: (props?: InertiaProps) => Promise<ResolvedPageProps>
 * }} ResolvePageProps
 */

/**
 * @param {any} value
 * @returns {boolean}
 */
function shouldRescueProp(value) {
  return value instanceof DeferProp && value.shouldRescueProp()
}

/**
 * @param {InertiaProps} [props]
 * @returns {Promise<ResolvedPageProps>}
 */
async function resolvePagePropsWithMetadata(props = {}) {
  const resolved = await Promise.all(
    Object.entries(props).map(async ([key, value]) => {
      try {
        if (typeof value === 'function') {
          const result = await value()
          return { entry: await resolveProp(key, result) }
        }
        return { entry: await resolveProp(key, value) }
      } catch (error) {
        if (shouldRescueProp(value)) {
          return { rescuedProp: key }
        }
        throw error
      }
    })
  )

  /** @type {Array<[string, any]>} */
  const entries = []
  /** @type {string[]} */
  const rescuedProps = []

  for (const result of resolved) {
    if (result.rescuedProp) {
      rescuedProps.push(result.rescuedProp)
      continue
    }
    entries.push(result.entry)
  }

  return {
    props: Object.fromEntries(entries),
    rescuedProps
  }
}

/**
 * Resolve all page props.
 *
 * This function iterates over each property in the given object.
 * If a property is a function, it is invoked with the provided context.
 * Then, every property is passed to resolveProp() to see if it needs
 * any special handling.
 *
 * @param {InertiaProps} [props={}] - An object containing page props.
 * @returns {Promise<InertiaProps>} A promise that resolves to a new object with resolved props.
 */
async function resolvePageProps(props = {}) {
  const resolved = await resolvePagePropsWithMetadata(props)
  return resolved.props
}

/** @type {ResolvePageProps} */
const exportedResolvePageProps = Object.assign(resolvePageProps, {
  withMetadata: resolvePagePropsWithMetadata
})

module.exports = exportedResolvePageProps
