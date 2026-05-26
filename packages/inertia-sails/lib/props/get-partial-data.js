/**
 * @typedef {import('../types').InertiaProps} InertiaProps
 */

/**
 * @param {InertiaProps} props
 * @param {string[]} [only]
 * @returns {InertiaProps}
 */
module.exports = function getPartialData(props, only = []) {
  return Object.assign({}, ...only.map((key) => ({ [key]: props[key] })))
}
