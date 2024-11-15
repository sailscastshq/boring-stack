// @ts-nocheck

const inertiaHeaders = {
  INERTIA: 'X-Inertia',
  LOCATION: 'X-Inertia-Location'
}

module.exports = function inertiaRedirect(url) {
  const req = this.req
  const res = this.res

  if (url === 'back') {
    url = req.get('referer') || '/'
  }

  if (req.get(inertiaHeaders.INERTIA)) {
    res.set(inertiaHeaders.LOCATION, url)
  }

  return res.redirect(
    ['PUT', 'PATCH', 'DELETE'].includes(req.method) ? 303 : 409,
    url
  )
}
