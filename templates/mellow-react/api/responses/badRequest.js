/**
 * badRequest.js
 *
 * A custom response.
 *
 * Example usage:
 * ```
 *     return res.badRequest();
 *     // -or-
 *     return res.badRequest(optionalData);
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       somethingHappened: {
 *         responseType: 'badRequest'
 *       }
 *     }
 * ```
 *
 * ```
 *     throw 'somethingHappened';
 *     // -or-
 *     throw { somethingHappened: optionalData }
 * ```
 */

module.exports = function badRequest(optionalData) {
  // Get access to `req` and `res`
  const req = this.req
  const res = this.res

  // Define the status code to send in the response.
  const statusCodeToSet = 400

  // Check if it's an Inertia request
  if (req.header('X-Inertia')) {
    if (optionalData && optionalData.problems) {
      const errors = {}
      optionalData.problems.forEach((problem) => {
        if (typeof problem === 'object') {
          Object.keys(problem).forEach((propertyName) => {
            const sanitizedProblem = problem[propertyName].replace(/\.$/, '') // Trim trailing dot
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
  } else if (_.isError(optionalData)) {
    sails.log.info(
      'Custom response `res.badRequest()` called with an Error:',
      optionalData
    )

    if (!_.isFunction(optionalData.toJSON)) {
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
