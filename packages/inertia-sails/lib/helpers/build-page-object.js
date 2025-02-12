const pickPropsToResolve = require('../props/pick-props-to-resolve')
const resolveDeferredProps = require('../props/resolve-deferred-props')
const resolveMergeProps = require('../props/resolve-merge-props')
const resolvePageProps = require('../props/resolve-page-props')

module.exports = async function buildPageObject(req, component, pageProps) {
  const sails = req._sails
  let url = req.url || req.originalUrl
  const assetVersion = sails.config.inertia.version
  const currentVersion =
    typeof assetVersion === 'function' ? assetVersion() : assetVersion
  const propsToResolve = pickPropsToResolve(req, component, {
    ...sails.inertia.sharedProps,
    ...pageProps
  })

  return {
    component,
    url,
    version: currentVersion,
    props: await resolvePageProps(propsToResolve),
    clearHistory: sails.inertia.shouldClearHistory,
    encryptHistory: sails.inertia.shouldEncryptHistory,
    ...resolveMergeProps(req, pageProps),
    ...resolveDeferredProps(req, component, pageProps)
  }
}
