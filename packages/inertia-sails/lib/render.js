const { encode } = require('querystring')
const inertiaHeaders = require('./helpers/inertia-headers')
const buildPageObject = require('./helpers/build-page-object')

module.exports = async function render(req, res, data) {
  const sails = req._sails

  const sharedViewData = sails.inertia.sharedViewData
  const rootView = sails.config.inertia.rootView

  const allViewData = {
    ...sharedViewData,
    ...data.viewData
  }

  let page = await buildPageObject(req, data.page, data.props)

  const queryParams = req.query
  if (req.method === 'GET' && Object.keys(queryParams).length) {
    // Only append query params if the URL doesn't already contain them
    // This prevents duplication when redirecting with query parameters
    if (!page.url.includes('?')) {
      page.url += `?${encode(queryParams)}`
    }
  }

  if (req.get(inertiaHeaders.INERTIA)) {
    res.set(inertiaHeaders.INERTIA, true)
    res.set('Vary', 'Accept')
    return res.json(page)
  } else {
    // Implements full page reload
    return res.view(rootView, {
      page,
      viewData: allViewData
    })
  }
}
