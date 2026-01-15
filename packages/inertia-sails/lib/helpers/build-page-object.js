const pickPropsToResolve = require('../props/pick-props-to-resolve')
const resolveDeferredProps = require('../props/resolve-deferred-props')
const resolveMergeProps = require('../props/resolve-merge-props')
const { resolveOncePropsMetadata } = require('../props/resolve-once-props')
const resolvePageProps = require('../props/resolve-page-props')
const resolveScrollProps = require('../props/resolve-scroll-props')

/**
 * @typedef {Object} InertiaPageObject
 * @property {string} component - The component name to render
 * @property {string} url - The current URL
 * @property {string|number} version - Asset version for cache busting
 * @property {Object.<string, *>} props - Resolved page props
 * @property {boolean} clearHistory - Whether to clear browser history
 * @property {boolean} encryptHistory - Whether to encrypt history state
 * @property {string[]} [mergeProps] - Props that should be merged on client
 * @property {string[]} [deepMergeProps] - Props that should be deep merged
 * @property {Object.<string, string[]>} [deferredProps] - Deferred props by group
 * @property {Object.<string, *>} [onceProps] - Once-prop metadata
 * @property {Object.<string, *>} [scrollProps] - Scroll props for InfiniteScroll component
 * @property {Object.<string, *>} [flash] - Flash data (not persisted in history)
 */

/**
 * Build the Inertia page object for a response.
 *
 * Combines shared props with page props, resolves special prop types,
 * and builds the complete page object sent to the client.
 *
 * Uses request-scoped shared props (via AsyncLocalStorage) merged with
 * global shared props to prevent data leaking between concurrent requests.
 *
 * @param {Object} req - Express/Sails request object
 * @param {string} component - The component name to render
 * @param {Object.<string, *>} pageProps - Props specific to this page
 * @returns {Promise<InertiaPageObject>} - The complete page object
 */
module.exports = async function buildPageObject(req, component, pageProps) {
  const sails = req._sails
  let url = req.url || req.originalUrl
  const assetVersion = sails.config.inertia.version
  const currentVersion =
    typeof assetVersion === 'function' ? assetVersion() : assetVersion

  // Merge props: global shared → request-scoped shared → page-specific
  // This ensures user-specific data (from share()) doesn't leak between requests
  const allProps = {
    ...sails.inertia.getShared(), // Merges global + request-scoped
    ...pageProps
  }

  const propsToResolve = pickPropsToResolve(req, component, allProps)

  // Build the page object with all metadata
  // Use request-scoped history settings (prevents race conditions)
  const page = {
    component,
    url,
    version: currentVersion,
    props: await resolvePageProps(propsToResolve),
    clearHistory: sails.inertia.shouldClearHistory(),
    encryptHistory: sails.inertia.shouldEncryptHistory(),
    ...resolveMergeProps(req, allProps),
    ...resolveDeferredProps(req, component, allProps),
    ...resolveOncePropsMetadata(allProps),
    ...resolveScrollProps(allProps)
  }

  // Consume flash data from session and add to props
  // Flash data is included in props.flash so it's accessible via usePage().props.flash
  // Note: Unlike regular props, flash data should NOT be persisted in browser history
  const flash = sails.inertia.consumeFlash(req)
  if (Object.keys(flash).length > 0) {
    page.props.flash = flash
  }

  return page
}
