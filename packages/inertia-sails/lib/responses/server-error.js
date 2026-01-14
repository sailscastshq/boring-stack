/**
 * Server Error Response for Inertia.js
 *
 * For Inertia requests, this sends a properly formatted error response that
 * triggers the Inertia error modal in development mode. In production, it
 * returns a generic error page.
 *
 * The error modal is a built-in Inertia.js feature that displays server errors
 * in a modal overlay during development, allowing developers to see stack traces
 * without losing their page state.
 *
 * @param {Object} req - Express/Sails request object
 * @param {Object} res - Express/Sails response object
 * @param {Object|Error} [error] - Optional error data or Error object
 * @returns {*} - Response
 *
 * @example
 * // In an action
 * return sails.inertia.handleServerError(req, res, new Error('Something went wrong'))
 *
 * @example
 * // Using as a response type
 * exits: {
 *   serverError: {
 *     responseType: 'serverError'
 *   }
 * }
 */
module.exports = function handleServerError(req, res, error) {
  const sails = req._sails
  const statusCode = 500
  const isInertiaRequest = req.header('X-Inertia')
  const isDevelopment = process.env.NODE_ENV !== 'production'

  // Log the error
  if (error) {
    sails.log.error('Server error:', error)
  }

  // For Inertia requests in development, send HTML that Inertia displays in a modal
  if (isInertiaRequest && isDevelopment) {
    const errorMessage = error?.message || 'Internal Server Error'
    const errorStack = error?.stack || ''
    const errorName = error?.name || 'Error'

    // Build an HTML error page that Inertia will display in a modal
    const html = buildErrorHtml({
      statusCode,
      errorName,
      errorMessage,
      errorStack,
      url: req.url,
      method: req.method
    })

    res.status(statusCode)
    res.type('text/html')
    return res.send(html)
  }

  // For Inertia requests in production, redirect to error page with flash
  if (isInertiaRequest) {
    sails.inertia.flash(
      'error',
      'An unexpected error occurred. Please try again.'
    )
    return res.redirect(303, req.get('Referrer') || '/')
  }

  // For non-Inertia requests, use the standard Sails error view
  res.status(statusCode)

  // If there's a 500 view, render it
  return res.view(
    '500',
    {
      error: isDevelopment ? error : null
    },
    (err, html) => {
      if (err) {
        // If view doesn't exist, send a basic response
        if (isDevelopment && error) {
          return res.send(`<pre>${error.stack || error.message}</pre>`)
        }
        return res.send('Internal Server Error')
      }
      return res.send(html)
    }
  )
}

/**
 * Build an HTML error page for the Inertia modal
 */
function buildErrorHtml({
  statusCode,
  errorName,
  errorMessage,
  errorStack,
  url,
  method
}) {
  const escapedMessage = escapeHtml(errorMessage)
  const escapedStack = escapeHtml(errorStack)
  const escapedUrl = escapeHtml(url)
  const escapedMethod = escapeHtml(method)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusCode} - ${escapedMessage}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #1a1a2e;
      color: #e0e0e0;
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #333;
    }
    .status-code {
      font-size: 3rem;
      font-weight: 700;
      color: #ef4444;
    }
    .error-type {
      font-size: 0.875rem;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .error-name {
      font-size: 1.5rem;
      font-weight: 600;
      color: #f87171;
    }
    .request-info {
      background: #16213e;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      font-size: 0.875rem;
    }
    .request-method {
      color: #60a5fa;
      font-weight: 600;
    }
    .request-url {
      color: #a5b4fc;
    }
    .message {
      background: #1e1e3f;
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      border-left: 4px solid #ef4444;
    }
    .message-title {
      font-size: 0.75rem;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .message-text {
      font-size: 1.125rem;
      color: #fca5a5;
      word-break: break-word;
    }
    .stack-trace {
      background: #0f0f1a;
      padding: 1.5rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }
    .stack-title {
      font-size: 0.75rem;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .stack-content {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      font-size: 0.8125rem;
      line-height: 1.6;
      white-space: pre-wrap;
      color: #a1a1aa;
    }
    .stack-content .at-line {
      color: #6b7280;
    }
    .stack-content .file-path {
      color: #60a5fa;
    }
    .footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #333;
      font-size: 0.75rem;
      color: #6b7280;
    }
    .footer a {
      color: #60a5fa;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="status-code">${statusCode}</span>
      <div>
        <div class="error-type">Server Error</div>
        <div class="error-name">${errorName}</div>
      </div>
    </div>

    <div class="request-info">
      <span class="request-method">${escapedMethod}</span>
      <span class="request-url">${escapedUrl}</span>
    </div>

    <div class="message">
      <div class="message-title">Error Message</div>
      <div class="message-text">${escapedMessage}</div>
    </div>

    ${
      escapedStack
        ? `
    <div class="stack-trace">
      <div class="stack-title">Stack Trace</div>
      <div class="stack-content">${formatStackTrace(escapedStack)}</div>
    </div>
    `
        : ''
    }

    <div class="footer">
      <p>This error page is only shown in development mode.</p>
      <p>Powered by <a href="https://docs.sailscasts.com/boring-stack">The Boring JavaScript Stack</a></p>
    </div>
  </div>
</body>
</html>`
}

/**
 * Format stack trace with syntax highlighting
 */
function formatStackTrace(stack) {
  return stack
    .split('\n')
    .map((line) => {
      if (line.trim().startsWith('at ')) {
        // Highlight file paths
        return line
          .replace(
            /(\s+at\s+)([^\s]+)\s+\(([^)]+)\)/,
            '<span class="at-line">$1</span>$2 (<span class="file-path">$3</span>)'
          )
          .replace(
            /(\s+at\s+)([^\s(]+)$/,
            '<span class="at-line">$1</span><span class="file-path">$2</span>'
          )
      }
      return line
    })
    .join('\n')
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
