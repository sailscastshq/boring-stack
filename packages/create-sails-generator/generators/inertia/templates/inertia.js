// @ts-nocheck
const { encode } = require('querystring')
module.exports = function inertia(data) {
  const req = this.req
  const res = this.res
  const sails = req._sails

  const sharedProps = sails.inertia.sharedProps
  const sharedViewData = sails.inertia.sharedViewData
  const rootView = sails.config.inertia.rootView

  const allProps = {
    ...sharedProps,
    ...data.props
  }

  const allViewData = {
    ...sharedViewData,
    ...data.viewData
  }

  let url = req.url || req.originalUrl
  const assetVersion = sails.config.inertia.version
  const currentVersion =
    typeof assetVersion === 'function' ? assetVersion() : assetVersion

  const page = {
    component: data.page,
    version: currentVersion,
    props: allProps,
    url
  }

  // Implements inertia partial reload. See https://inertiajs.com/partial-reload
  if (
    req.get(inertiaHeaders.PARTIAL_DATA) &&
    req.get(inertiaHeaders.PARTIAL_COMPONENT) === page.component
  ) {
    const only = req.get(inertiaHeaders.PARTIAL_DATA).split(',')
    page.props = only.length ? getPartialData(data.props, only) : page.props
  }

  const queryParams = req.query
  if (req.method === 'GET' && Object.keys(queryParams).length) {
    // Keep original request query params
    url += `?${encode(queryParams)}`
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

function getPartialData(props, only = []) {
  return Object.assign({}, ...only.map((key) => ({ [key]: props[key] })))
}

const inertiaHeaders = {
  INERTIA: 'X-Inertia',
  VERSION: 'X-Inertia-Version',
  PARTIAL_DATA: 'X-Inertia-Partial-Data',
  PARTIAL_COMPONENT: 'X-Inertia-Partial-Component',
  LOCATION: 'X-Inertia-Location'
}
