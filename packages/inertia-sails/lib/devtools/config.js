const path = require('path')

const DEFAULT_REDACT_KEYS = [
  'password',
  'password_confirmation',
  'current_password',
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'secret',
  'client_secret'
]

const DEFAULT_REDACT_HEADERS = [
  'cookie',
  'set-cookie',
  'authorization',
  'proxy-authorization',
  'x-api-key',
  'x-csrf-token',
  'x-xsrf-token'
]

const DEFAULT_PAGE_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.vue',
  '.svelte'
]

/**
 * Return a fresh copy because Sails merges application configuration into hook
 * defaults during startup.
 *
 * @returns {Record<string, any>}
 */
function createDevToolsDefaults() {
  return {
    enabled: null,
    except: ['/_inertia/devtools*'],
    storage: {
      path: '.tmp/inertia-devtools',
      ttl: 24,
      pruneInterval: 300_000,
      limit: 100,
      circuitBreaker: 30_000
    },
    authorize: null,
    redact: {
      keys: [...DEFAULT_REDACT_KEYS],
      headers: [...DEFAULT_REDACT_HEADERS]
    },
    pages: {
      paths: ['assets/js/pages'],
      extensions: [...DEFAULT_PAGE_EXTENSIONS]
    },
    bodyLimit: 256_000
  }
}

/**
 * @typedef {Object} DevToolsStorageConfig
 * @property {string} path
 * @property {number} ttl
 * @property {number} pruneInterval
 * @property {number} limit
 * @property {number} circuitBreaker
 *
 * @typedef {Object} DevToolsConfig
 * @property {boolean} enabled
 * @property {boolean} isDevelopment
 * @property {string[]} except
 * @property {DevToolsStorageConfig} storage
 * @property {((req: any) => boolean|Promise<boolean>)|null} authorize
 * @property {{keys: string[], headers: string[]}} redact
 * @property {{paths: string[], extensions: string[]}} pages
 * @property {number} bodyLimit
 */

/**
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
function positiveNumber(value, fallback) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback
}

/**
 * @param {unknown} value
 * @param {string[]} fallback
 * @returns {string[]}
 */
function stringList(value, fallback) {
  if (!Array.isArray(value)) return [...fallback]
  return value.filter((item) => typeof item === 'string' && item !== '')
}

/**
 * Normalize public Sails configuration into the internal recorder shape.
 *
 * @param {any} sails
 * @returns {DevToolsConfig}
 */
module.exports = function normalizeDevToolsConfig(sails) {
  const defaults = createDevToolsDefaults()
  const inertiaConfig = sails.config?.inertia || {}
  const configured = inertiaConfig.devtools || {}
  const storage = configured.storage || {}
  const redact = configured.redact || {}
  const pages = configured.pages || {}
  const appPath = sails.config?.appPath || process.cwd()
  const environment = sails.config?.environment || process.env.NODE_ENV
  const isDevelopment = environment === 'development'
  const enabled =
    configured.enabled === null || configured.enabled === undefined
      ? isDevelopment
      : configured.enabled === true
  const configuredStoragePath =
    typeof storage.path === 'string' && storage.path !== ''
      ? storage.path
      : defaults.storage.path

  const configuredExcept = stringList(configured.except, [])

  return {
    enabled,
    isDevelopment,
    except: [...new Set([...defaults.except, ...configuredExcept])],
    storage: {
      path: path.isAbsolute(configuredStoragePath)
        ? configuredStoragePath
        : path.resolve(appPath, configuredStoragePath),
      ttl: positiveNumber(storage.ttl, defaults.storage.ttl),
      pruneInterval: positiveNumber(
        storage.pruneInterval,
        defaults.storage.pruneInterval
      ),
      limit: positiveNumber(storage.limit, defaults.storage.limit),
      circuitBreaker: positiveNumber(
        storage.circuitBreaker,
        defaults.storage.circuitBreaker
      )
    },
    authorize:
      typeof configured.authorize === 'function' ? configured.authorize : null,
    redact: {
      keys: stringList(redact.keys, defaults.redact.keys),
      headers: stringList(redact.headers, defaults.redact.headers)
    },
    pages: {
      paths: stringList(pages.paths, defaults.pages.paths),
      extensions: stringList(pages.extensions, defaults.pages.extensions)
    },
    bodyLimit: positiveNumber(configured.bodyLimit, defaults.bodyLimit)
  }
}

module.exports.createDevToolsDefaults = createDevToolsDefaults
