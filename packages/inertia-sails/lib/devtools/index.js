const normalizeConfig = require('./config')
const EntryRepository = require('./entry-repository')
const createRedactor = require('./redactor')
const RequestRecorder = require('./request-recorder')
const SourceLocator = require('./source-locator')
const requestContext = require('../helpers/request-context')

/**
 * @param {string} pattern
 * @returns {RegExp}
 */
function patternToRegExp(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escaped.replace(/\*/g, '.*')}$`)
}

/**
 * @param {any} res
 * @param {number} status
 * @param {any} body
 * @returns {any}
 */
function respondJson(res, status, body) {
  if (typeof res.status === 'function') res.status(status)
  else res.statusCode = status

  if (typeof res.json === 'function') return res.json(body)
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json')
  }
  return res.end(JSON.stringify(body))
}

/**
 * @param {any} sails
 */
module.exports = function createDevTools(sails) {
  const config = normalizeConfig(sails)
  const redactor = createRedactor(config.redact)
  const repository = new EntryRepository(
    config.storage,
    sails.log,
    redactor.redactStoragePayload
  )
  const sourceLocator = new SourceLocator(sails, config.pages)
  /** @type {Record<string, {file: string, line: number}>} */
  const globalShareSources = {}

  /**
   * @param {any} req
   * @returns {boolean}
   */
  function isExcluded(req) {
    const requestPath = String(
      req.path || req.originalUrl || req.url || '/'
    ).split('?')[0]
    return config.except.some((pattern) =>
      patternToRegExp(pattern).test(requestPath)
    )
  }

  /**
   * @param {any} req
   * @returns {Promise<boolean>}
   */
  async function isAuthorized(req) {
    if (!config.enabled) return false
    if (config.isDevelopment) return true
    if (config.authorize === null) return false

    try {
      return (await config.authorize(req)) === true
    } catch {
      return false
    }
  }

  const devTools = {
    config,
    repository,

    /**
     * @param {any} req
     * @returns {boolean}
     */
    enabledForRequest(req) {
      return config.enabled && !isExcluded(req)
    },

    /**
     * @param {any} req
     * @param {any} res
     * @param {() => any} next
     * @returns {any}
     */
    middleware(req, res, next) {
      if (!devTools.enabledForRequest(req) || req.isSocket) return next()

      try {
        const recorder = new RequestRecorder({
          req,
          res,
          repository,
          sourceLocator,
          redactor,
          config,
          shareSources: globalShareSources
        })
        recorder.start()
        requestContext.setDevToolsRecorder(recorder)
      } catch {
        // A diagnostics failure must not prevent the application from running.
      }
      return next()
    },

    /**
     * Capture application source for shared props.
     *
     * @param {string[]} keys
     * @param {boolean} [global]
     */
    propsShared(keys, global = false) {
      if (!config.enabled) return
      try {
        const source = sourceLocator.captureCallerSource()
        if (source === null) return

        if (global) {
          for (const key of keys) {
            globalShareSources[key] = {
              file: source.file,
              line:
                sourceLocator.findPropKeyLine(source.file, source.line, key) ||
                source.line
            }
          }
        }

        requestContext.getDevToolsRecorder()?.propsShared(keys, source)
      } catch {
        // Source inspection must not interfere with shared application data.
      }
    },

    /**
     * Return the stored buffer in protocol order. Query filters are optional.
     * @param {any} req
     * @param {any} res
     * @returns {Promise<any>}
     */
    async index(req, res) {
      if (!(await isAuthorized(req))) {
        return respondJson(res, config.enabled ? 403 : 404, {
          message: config.enabled ? 'Forbidden' : 'Not found'
        })
      }
      repository.pruneIfDue()
      const entries = repository
        .entriesFromDisk()
        .map(({ entry }) => entry)
        .sort(
          (left, right) =>
            Number(right.__meta.utime) - Number(left.__meta.utime)
        )
      return respondJson(res, 200, entries)
    },

    /**
     * @param {any} req
     * @param {any} res
     * @returns {Promise<any>}
     */
    async show(req, res) {
      if (!(await isAuthorized(req))) {
        return respondJson(res, config.enabled ? 403 : 404, {
          message: config.enabled ? 'Forbidden' : 'Not found'
        })
      }

      const entry = repository.get(String(req.params?.id || ''))
      return entry
        ? respondJson(res, 200, entry)
        : respondJson(res, 404, { message: 'Not found' })
    }
  }

  return devTools
}

module.exports.patternToRegExp = patternToRegExp
