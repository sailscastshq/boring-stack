const render = require('../render')
const { INERTIA } = require('../helpers/inertia-headers')

/**
 * @typedef {import('../types').InertiaRequest} InertiaRequest
 * @typedef {import('../types').InertiaResponse} InertiaResponse
 * @typedef {{ message?: string, stack?: string, name?: string, status?: number, statusCode?: number }} ErrorLike
 * @typedef {{ statusCode?: number, error?: ErrorLike|string|Record<string, any>|null, page?: string }} ErrorPageOptions
 */

const DEFAULT_ERROR_STATUSES = [403, 404, 500, 503]

/** @type {Record<number, { title: string, message: string }>} */
const STATUS_TEXT = {
  403: {
    title: 'Forbidden',
    message: 'You do not have permission to access this page.'
  },
  404: {
    title: 'Page not found',
    message: 'The page you are looking for could not be found.'
  },
  500: {
    title: 'Server error',
    message: 'Something went wrong on our end.'
  },
  503: {
    title: 'Service unavailable',
    message: 'The service is temporarily unavailable.'
  }
}

const SECRET_PATTERN =
  /authorization|cookie|csrf|xsrf|token|secret|password|passwd|session/i

/**
 * @param {ErrorLike|string|Record<string, any>|null|undefined} error
 * @param {number} fallbackStatusCode
 * @returns {number}
 */
function resolveStatusCode(error, fallbackStatusCode) {
  const statusCode =
    typeof error === 'object' && error
      ? Number(error.statusCode || error.status)
      : Number.NaN

  return Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599
    ? statusCode
    : fallbackStatusCode
}

/**
 * @param {number} statusCode
 * @returns {{ title: string, message: string }}
 */
function getStatusText(statusCode) {
  return (
    STATUS_TEXT[statusCode] || {
      title: 'Error',
      message: 'Something went wrong.'
    }
  )
}

/**
 * @param {InertiaRequest} req
 * @returns {boolean}
 */
function isInertiaRequest(req) {
  return Boolean(req.get?.(INERTIA) || req.header?.(INERTIA))
}

/**
 * @param {InertiaRequest} req
 * @returns {boolean}
 */
function wantsJson(req) {
  if (isInertiaRequest(req)) {
    return false
  }

  const request = /** @type {any} */ (req)
  if (request.wantsJSON) {
    return true
  }

  const accept = String(
    req.get?.('Accept') || req.header?.('Accept') || req.headers?.accept || ''
  ).toLowerCase()

  return accept.includes('application/json') && !accept.includes('text/html')
}

/**
 * @param {any} value
 * @param {number} [depth]
 * @returns {any}
 */
function sanitizeValue(value, depth = 0) {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === 'string') {
    return value.length > 500 ? `${value.slice(0, 500)}...` : value
  }

  if (typeof value !== 'object') {
    return value
  }

  if (depth >= 3) {
    return '[object]'
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((entry) => sanitizeValue(entry, depth + 1))
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      SECRET_PATTERN.test(key) ? '[redacted]' : sanitizeValue(entry, depth + 1)
    ])
  )
}

/**
 * @param {Record<string, any>|undefined} record
 * @returns {Record<string, any>}
 */
function sanitizeRecord(record) {
  return sanitizeValue(record || {})
}

/**
 * @param {Record<string, any>|undefined} record
 * @returns {{ key: string, value: any }[]}
 */
function toMetadataRows(record) {
  return Object.entries(sanitizeRecord(record)).map(([key, value]) => ({
    key,
    value
  }))
}

/**
 * @param {InertiaRequest} req
 * @param {any} youch
 * @returns {void}
 */
function addRequestMetadata(req, youch) {
  const request = /** @type {any} */ (req)

  youch.metadata.group('Sails request', {
    request: [
      { key: 'Method', value: req.method || 'GET' },
      { key: 'URL', value: req.originalUrl || req.url || '/' }
    ],
    headers: toMetadataRows(req.headers),
    params: toMetadataRows(request.params),
    query: toMetadataRows(req.query),
    body: toMetadataRows(request.body),
    session: toMetadataRows(req.session)
  })
}

/**
 * @param {ErrorLike|string|Record<string, any>|null|undefined} error
 * @param {number} statusCode
 * @returns {Error}
 */
function normalizeError(error, statusCode) {
  if (error instanceof Error) {
    return error
  }

  const statusText = getStatusText(statusCode)
  const message =
    typeof error === 'string'
      ? error
      : typeof error === 'object' && error && typeof error.message === 'string'
      ? error.message
      : statusText.message

  const normalizedError = new Error(message)
  normalizedError.name =
    typeof error === 'object' && error && typeof error.name === 'string'
      ? error.name
      : statusText.title

  return normalizedError
}

/**
 * Youch's theme switcher reads and writes localStorage. Inertia renders
 * development error HTML inside a sandboxed iframe, where localStorage can
 * throw a SecurityError. Swap Youch's direct localStorage calls for a small
 * storage shim so the theme toggle still works in the Inertia error modal.
 *
 * @param {string} html
 * @returns {string}
 */
function makeYouchHtmlInertiaModalSafe(html) {
  const storageShim = `<script id="inertia-sails-youch-storage">
(function () {
  var fallback = {}
  window.__youchStorage = {
    getItem: function (key) {
      try {
        return window.localStorage.getItem(key)
      } catch (error) {
        return Object.prototype.hasOwnProperty.call(fallback, key) ? fallback[key] : null
      }
    },
    setItem: function (key, value) {
      try {
        window.localStorage.setItem(key, value)
      } catch (error) {
        fallback[key] = String(value)
      }
    },
    removeItem: function (key) {
      try {
        window.localStorage.removeItem(key)
      } catch (error) {
        delete fallback[key]
      }
    }
  }
})()
</script>`

  return html
    .replaceAll('localStorage.', 'window.__youchStorage.')
    .replace('</head>', `${storageShim}</head>`)
}

/**
 * @param {InertiaRequest} req
 * @param {Error} error
 * @param {number} statusCode
 * @returns {Promise<string>}
 */
async function renderYouchHtml(req, error, statusCode) {
  const { Youch } = await import('youch')
  const youch = new Youch()

  addRequestMetadata(req, youch)

  const html = await youch.toHTML(error, {
    title: `${statusCode} - ${getStatusText(statusCode).title}`,
    request: {
      url: req.originalUrl || req.url || '/',
      method: req.method || 'GET',
      headers: sanitizeRecord(req.headers)
    }
  })

  return makeYouchHtmlInertiaModalSafe(html)
}

/**
 * @param {InertiaRequest} req
 * @param {InertiaResponse} res
 * @param {number} statusCode
 * @param {Error} error
 * @returns {Promise<any>}
 */
async function sendDevelopmentHtml(req, res, statusCode, error) {
  const html = await renderYouchHtml(req, error, statusCode)

  res.status(statusCode)
  res.type?.('text/html')
  return res.send?.(html)
}

/**
 * @param {InertiaResponse} res
 * @param {number} statusCode
 * @param {Error} error
 * @param {boolean} isDevelopment
 * @returns {*}
 */
function sendJsonError(res, statusCode, error, isDevelopment) {
  const statusText = getStatusText(statusCode)
  /** @type {{ error: { status: number, title: string, message: string, name?: string, stack?: string } }} */
  const payload = {
    error: {
      status: statusCode,
      title: statusText.title,
      message: isDevelopment ? error.message : statusText.message
    }
  }

  if (isDevelopment) {
    payload.error.name = error.name
    payload.error.stack = error.stack
  }

  return res.status?.(statusCode).json?.(payload)
}

/**
 * @param {any} sails
 * @returns {string|null}
 */
function getConfiguredErrorPage(sails) {
  const configured = sails.config?.inertia?.errorPage

  if (typeof configured === 'string') {
    return configured
  }

  if (configured && typeof configured.page === 'string') {
    return configured.page
  }

  return null
}

/**
 * @param {any} sails
 * @returns {number[]}
 */
function getConfiguredErrorStatuses(sails) {
  const configured = sails.config?.inertia?.errorStatuses

  if (!Array.isArray(configured)) {
    return DEFAULT_ERROR_STATUSES
  }

  return configured
    .map(Number)
    .filter((statusCode) => Number.isInteger(statusCode))
}

/**
 * @param {InertiaRequest} req
 * @param {InertiaResponse} res
 * @param {number} statusCode
 * @param {string} page
 * @returns {Promise<any>}
 */
function renderInertiaErrorPage(req, res, statusCode, page) {
  const statusText = getStatusText(statusCode)

  res.status?.(statusCode)
  return render(req, res, {
    page,
    props: {
      status: statusCode,
      title: statusText.title,
      message: statusText.message
    }
  })
}

/**
 * @param {InertiaRequest} req
 * @param {InertiaResponse} res
 * @param {number} statusCode
 * @param {Error} error
 * @param {boolean} isDevelopment
 * @returns {*}
 */
function renderSailsErrorView(req, res, statusCode, error, isDevelopment) {
  const viewName = String(statusCode)

  res.status?.(statusCode)
  return res.view?.(
    viewName,
    {
      error: isDevelopment && statusCode >= 500 ? error : null
    },
    /**
     * @param {Error|null} viewError
     * @param {string} html
     * @returns {*}
     */
    (viewError, html) => {
      if (viewError) {
        return res.send?.(getStatusText(statusCode).message)
      }

      return res.send?.(html)
    }
  )
}

/**
 * Render an application error response.
 *
 * In development, 500-level HTML responses use Youch. In production, apps can
 * opt into Inertia status pages with `sails.config.inertia.errorPage`.
 *
 * @param {InertiaRequest} req
 * @param {InertiaResponse} res
 * @param {ErrorPageOptions} options
 * @returns {Promise<any>|*}
 */
function handleErrorPage(req, res, options = {}) {
  const sails = req._sails
  const isDevelopment = process.env.NODE_ENV !== 'production'
  const statusCode = resolveStatusCode(
    options.error,
    Number(options.statusCode || 500)
  )
  const error = normalizeError(options.error, statusCode)
  const hasExplicitErrorPage = typeof options.page === 'string'

  if (statusCode >= 500) {
    sails.log?.error?.('Server error:', options.error || error)
  }

  if (wantsJson(req)) {
    return sendJsonError(res, statusCode, error, isDevelopment)
  }

  if (isDevelopment && statusCode >= 500 && !hasExplicitErrorPage) {
    return sendDevelopmentHtml(req, res, statusCode, error)
  }

  const errorPage = options.page || getConfiguredErrorPage(sails)
  const errorStatuses = getConfiguredErrorStatuses(sails)

  if (errorPage && errorStatuses.includes(statusCode)) {
    return renderInertiaErrorPage(req, res, statusCode, errorPage)
  }

  if (isInertiaRequest(req)) {
    sails.inertia.flash?.(
      'error',
      'An unexpected error occurred. Please try again.'
    )
    return res.redirect?.(303, req.get?.('Referrer') || '/')
  }

  return renderSailsErrorView(req, res, statusCode, error, isDevelopment)
}

/**
 * Server Error Response for Inertia.js.
 *
 * @param {InertiaRequest} req - Express/Sails request object
 * @param {InertiaResponse} res - Express/Sails response object
 * @param {ErrorLike|string|Record<string, any>|null} [error] - Optional error data or Error object
 * @returns {Promise<any>|*} - Response
 */
function handleServerError(req, res, error) {
  return handleErrorPage(req, res, {
    statusCode: 500,
    error
  })
}

module.exports = Object.assign(handleServerError, { handleErrorPage })
