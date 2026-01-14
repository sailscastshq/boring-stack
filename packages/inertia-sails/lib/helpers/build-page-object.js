const pickPropsToResolve = require('../props/pick-props-to-resolve')
const resolveDeferredProps = require('../props/resolve-deferred-props')
const resolveMergeProps = require('../props/resolve-merge-props')
const { resolveOncePropsMetadata } = require('../props/resolve-once-props')
const resolvePageProps = require('../props/resolve-page-props')

module.exports = async function buildPageObject(req, component, pageProps) {
  const sails = req._sails
  let url = req.url || req.originalUrl
  const assetVersion = sails.config.inertia.version
  const currentVersion =
    typeof assetVersion === 'function' ? assetVersion() : assetVersion

  const allProps = {
    ...sails.inertia.sharedProps,
    ...pageProps
  }

  const propsToResolve = pickPropsToResolve(req, component, allProps)

  // Build the page object with all metadata
  const page = {
    component,
    url,
    version: currentVersion,
    props: await resolvePageProps(propsToResolve),
    clearHistory: sails.inertia.shouldClearHistory,
    encryptHistory: sails.inertia.shouldEncryptHistory,
    ...resolveMergeProps(req, pageProps),
    ...resolveDeferredProps(req, component, pageProps),
    ...resolveOncePropsMetadata(allProps)
  }

  // Add flash data if present (not persisted in browser history)
  if (
    sails.inertia._flashData &&
    Object.keys(sails.inertia._flashData).length > 0
  ) {
    page.flash = sails.inertia._flashData
    // Clear flash data after adding to response
    sails.inertia._flashData = {}
  }

  return page
}
