/**
 * @typedef {import('../types').SailsLike} SailsLike
 */

/**
 * @param {SailsLike} sails
 * @returns {any}
 */
module.exports = function resolveAssetVersion(sails) {
  const assetVersion = sails.config.inertia.version
  return typeof assetVersion === 'function' ? assetVersion() : assetVersion
}
