const { encode } = require('querystring')
const inertiaHeaders = require('./helpers/inertia-headers')
const buildPageObject = require('./helpers/build-page-object')
const requestContext = require('./helpers/request-context')
const resolveAssetVersion = require('./helpers/resolve-asset-version')

/**
 * @typedef {import('./types').InertiaRequest} InertiaRequest
 * @typedef {import('./types').InertiaResponse} InertiaResponse
 * @typedef {import('./types').InertiaProps} InertiaProps
 *
 * @typedef {Object} RenderData
 * @property {string} page
 * @property {InertiaProps} [props]
 * @property {InertiaProps} [locals]
 */

/**
 * @param {InertiaRequest} req
 * @returns {string}
 */
function getRequestUrl(req) {
  let url = req.url || req.originalUrl || '/'
  const queryParams = req.query || {}

  if (req.method === 'GET' && Object.keys(queryParams).length) {
    // Only append query params if the URL doesn't already contain them
    // This prevents duplication when redirecting with query parameters
    if (!url.includes('?')) {
      url += `?${encode(queryParams)}`
    }
  }

  return url
}

/**
 * @param {InertiaRequest} req
 * @param {any} currentVersion
 * @returns {boolean}
 */
function hasAssetVersionMismatch(req, currentVersion) {
  const requestVersion = req.get(inertiaHeaders.VERSION)

  if (req.method !== 'GET') return false
  if (!req.get(inertiaHeaders.INERTIA)) return false
  if (requestVersion === undefined || requestVersion === null) return false
  if (currentVersion === undefined || currentVersion === null) return false

  return String(requestVersion) !== String(currentVersion)
}

/**
 * @param {InertiaRequest} req
 * @param {InertiaResponse} res
 * @param {RenderData} data
 * @returns {Promise<any>}
 */
module.exports = async function render(req, res, data) {
  const sails = req._sails
  // Use request-scoped rootView if set, otherwise fall back to config
  const rootView = requestContext.getRootView() || sails.config.inertia.rootView

  // Use request-scoped locals merged with global locals
  // This prevents locals from leaking between concurrent requests
  const allLocals = {
    ...sails.inertia.getLocals(), // Merges global + request-scoped
    ...data.locals
  }

  const currentVersion = resolveAssetVersion(sails)
  const requestUrl = getRequestUrl(req)

  if (hasAssetVersionMismatch(req, currentVersion)) {
    res.set('Vary', 'X-Inertia')
    res.set(inertiaHeaders.LOCATION, requestUrl)
    return res.status(409).end()
  }

  let page = await buildPageObject(
    /** @type {any} */ (req),
    data.page,
    data.props
  )

  page.url = requestUrl

  if (req.get(inertiaHeaders.INERTIA)) {
    res.set(inertiaHeaders.INERTIA, true)
    res.set('Vary', 'X-Inertia')
    return res.json(page)
  } else {
    // Implements full page reload
    //
    // We pass locals both as top-level properties AND nested under a `locals`
    // key. This is necessary because Sails's default EJS renderer creates an
    // `options.locals` object (for blocks, layout, partial helpers). EJS wraps
    // templates in `with(data) { ... }`, so inside the template `locals`
    // resolves to `data.locals` (the nested object) rather than the `locals`
    // function parameter. By pre-populating `data.locals` with our values,
    // `<%= locals.title %>` in the EJS template correctly resolves to the
    // dynamic value instead of undefined.
    return res.view(rootView, { page, ...allLocals, locals: { ...allLocals } })
  }
}
