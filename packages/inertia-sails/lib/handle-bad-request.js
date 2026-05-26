/**
 * @typedef {import('./types').InertiaRequest} InertiaRequest
 * @typedef {import('./types').InertiaResponse} InertiaResponse
 * @typedef {import('./types').BadRequestData} BadRequestData
 */

/**
 * Handle bad request responses for Inertia.js
 *
 * For Inertia requests with validation errors, this redirects back to the
 * previous page with errors stored in the session. For non-Inertia requests,
 * it returns a standard 400 response.
 *
 * @param {InertiaRequest} req - Express/Sails request object
 * @param {InertiaResponse} res - Express/Sails response object
 * @param {BadRequestData|Error|Record<string, any>} [optionalData] - Optional error data or Error object
 * @returns {*} - Response (redirect for Inertia, status code for non-Inertia)
 *
 * @example
 * // In an action with validation errors
 * return sails.inertia.handleBadRequest(req, res, {
 *   problems: ['\"email\" is required', '\"password\" must be at least 8 characters']
 * })
 */
module.exports = function handleBadRequest(req, res, optionalData) {
  const sails = req._sails
  // Define the status code to send in the response.
  const statusCodeToSet = 400

  // Check if it's an Inertia request
  if (req.header?.('X-Inertia')) {
    if (
      optionalData &&
      !(optionalData instanceof Error) &&
      Array.isArray(optionalData.problems)
    ) {
      /** @type {Record<string, string[]>} */
      const errors = {}
      optionalData.problems.forEach((problem) => {
        if (typeof problem === 'object') {
          Object.keys(problem).forEach((propertyName) => {
            const sanitizedProblem = String(problem[propertyName]).replace(
              /\.$/,
              ''
            ) // Trim trailing dot
            if (!errors[propertyName]) {
              errors[propertyName] = [sanitizedProblem]
            } else {
              errors[propertyName].push(sanitizedProblem)
            }
          })
        } else {
          const regex = /"(.*?)"/
          const matches = problem.match(regex)

          if (matches && matches.length > 1) {
            const propertyName = matches[1]
            const sanitizedProblem = problem
              .replace(/"([^"]+)"/, '$1')
              .replace('\n', '')
              .replace('·', '')
              .trim()
            if (!errors[propertyName]) {
              errors[propertyName] = [sanitizedProblem]
            } else {
              errors[propertyName].push(sanitizedProblem)
            }
          }
        }
      })
      req.session.errors = errors
      return res.redirect(303, req.get('Referrer') || '/')
    }
  }

  // If not an Inertia request, perform the normal badRequest response
  if (optionalData === undefined) {
    sails.log.info('Ran custom response: res.badRequest()')
    return res.sendStatus(statusCodeToSet)
  } else if (optionalData instanceof Error) {
    sails.log.info(
      'Custom response `res.badRequest()` called with an Error:',
      optionalData
    )

    if (typeof (/** @type {*} */ (optionalData).toJSON) !== 'function') {
      if (process.env.NODE_ENV === 'production') {
        return res.sendStatus(statusCodeToSet)
      } else {
        return res.status(statusCodeToSet).send(optionalData.stack)
      }
    }
  } else {
    return res.status(statusCodeToSet).send(optionalData)
  }
}
