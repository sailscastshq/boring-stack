// Injected by rsbuild-plugin-inertia into the browser module that calls
// createInertiaApp(). A visit answered by something other than the app (a
// Cloudflare challenge, a WAF block, a proxy error page) is a real page that
// belongs to the browser, not to Inertia's error dialog.

const INSTALLED_FLAG = '__inertiaInterstitialsInstalled'
const STORAGE_KEY = 'inertia:interstitial-navigation'
const LOOP_WINDOW_MS = 15000
const INTERSTITIAL_STATUSES = [403, 429, 503]

/**
 * @typedef {Object} InertiaHttpResponse
 * @property {number} status
 * @property {Record<string, string>} [headers]
 *
 * @typedef {Object} TrackedVisit
 * @property {string} url
 * @property {string} method
 *
 * @typedef {Object} InterstitialStorage
 * @property {(key: string) => string|null} getItem
 * @property {(key: string, value: string) => void} setItem
 * @property {(key: string) => void} removeItem
 */

/**
 * @param {InertiaHttpResponse} response
 * @param {string} name
 */
function getHeader(response, name) {
  const value = response.headers?.[name]
  return typeof value === 'string' ? value : undefined
}

/**
 * Only HTML pages the app did not render are navigated to. JSON errors and
 * Inertia's own error responses keep Inertia's default handling.
 *
 * In development the dialog is useful for debugging server errors, so only
 * responses that clearly came from something in front of the app navigate.
 *
 * @param {InertiaHttpResponse} response
 * @param {{ production: boolean }} options
 */
function shouldNavigate(response, options) {
  if (!response || typeof response.status !== 'number') return false
  if (getHeader(response, 'x-inertia') !== undefined) return false

  const contentType = getHeader(response, 'content-type') || ''
  if (!contentType.toLowerCase().includes('text/html')) return false

  if (options.production) return true

  return (
    getHeader(response, 'cf-mitigated') !== undefined ||
    INTERSTITIAL_STATUSES.includes(response.status)
  )
}

/**
 * A GET visit can be replayed as a full page load of its URL. Any other method
 * cannot, so the current page is reloaded instead and the browser handles the
 * interstitial there.
 *
 * @param {TrackedVisit|null} visit
 * @param {string} currentUrl
 */
function resolveTarget(visit, currentUrl) {
  if (visit && visit.method.toLowerCase() === 'get') {
    return visit.url
  }

  return currentUrl
}

/**
 * Records the navigation and reports whether it is safe to perform. A second
 * interstitial for the same URL shortly after navigating to it means the full
 * page load did not clear it (for example deferred props or polling hitting a
 * WAF rule), so Inertia's default handling takes over instead of looping.
 *
 * @param {InterstitialStorage} storage
 * @param {string} target
 * @param {number} now
 */
function claimNavigation(storage, target, now) {
  const previous = readRecord(storage)

  if (
    previous &&
    previous.url === target &&
    now - previous.at >= 0 &&
    now - previous.at < LOOP_WINDOW_MS
  ) {
    storage.removeItem(STORAGE_KEY)
    return false
  }

  storage.setItem(STORAGE_KEY, JSON.stringify({ url: target, at: now }))
  return true
}

/**
 * @param {InterstitialStorage} storage
 * @returns {{ url: string, at: number }|null}
 */
function readRecord(storage) {
  try {
    const record = JSON.parse(storage.getItem(STORAGE_KEY) || 'null')

    if (
      record &&
      typeof record.url === 'string' &&
      typeof record.at === 'number'
    ) {
      return record
    }
  } catch {}

  return null
}

/**
 * @param {any} visit
 * @returns {TrackedVisit|null}
 */
function toTrackedVisit(visit) {
  if (!visit || visit.prefetch || !visit.url) return null

  return {
    url: String(visit.url.href || visit.url),
    method: String(visit.method || 'get')
  }
}

/**
 * @param {{
 *   document: Document,
 *   window: any,
 *   production: boolean,
 *   now?: () => number
 * }} environment
 */
function installInterstitialNavigation(environment) {
  const { document, window, production } = environment
  const now = environment.now || Date.now

  if (window[INSTALLED_FLAG]) return false
  window[INSTALLED_FLAG] = true

  /** @type {TrackedVisit|null} */
  let lastVisit = null

  document.addEventListener('inertia:before', (/** @type {any} */ event) => {
    const visit = toTrackedVisit(event.detail?.visit)
    if (visit) lastVisit = visit
  })

  document.addEventListener(
    'inertia:httpException',
    (/** @type {any} */ event) => {
      const response = event.detail?.response
      if (!shouldNavigate(response, { production })) return

      const target = resolveTarget(lastVisit, window.location.href)

      try {
        if (!claimNavigation(window.sessionStorage, target, now())) return
      } catch {
        // Without storage there is no loop guard, so keep Inertia's default.
        return
      }

      event.preventDefault()
      window.location.assign(target)
    }
  )

  return true
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installInterstitialNavigation({
    document,
    window,
    production: process.env.NODE_ENV === 'production'
  })
}

module.exports = {
  STORAGE_KEY,
  LOOP_WINDOW_MS,
  shouldNavigate,
  resolveTarget,
  claimNavigation,
  installInterstitialNavigation
}
