/**
 * Append a value to the Vary response header without duplicating entries.
 *
 * @typedef {import('../types').InertiaResponse} InertiaResponse
 */

/**
 * @param {InertiaResponse} res
 * @param {string} value
 * @returns {void}
 */
function appendVaryHeader(res, value) {
  const headers = /** @type {Record<string, any>|undefined} */ (res.headers)
  const current = headers?.Vary || headers?.vary
  const values = new Set(
    String(current || '')
      .split(',')
      .map((header) => header.trim())
      .filter(Boolean)
  )

  values.add(value)
  res.set?.('Vary', Array.from(values).join(', '))
}

module.exports = appendVaryHeader
