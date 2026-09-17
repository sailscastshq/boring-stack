const path = require('path')
const { detectFramework } = require('./page-resolution')

const RUNTIME_PATH = path.join(__dirname, '..', 'runtime', 'interstitials.js')
const CREATE_INERTIA_APP_RE = /\bcreateInertiaApp\s*\(/
const NODE_MODULES_RE = /[\\/]node_modules[\\/]/

/**
 * @typedef {Object} InterstitialTransformOptions
 * @property {boolean} enabled
 * @property {string} [target]
 * @property {string} [runtimePath]
 */

/**
 * Adds the interstitial runtime to the browser module that boots Inertia.
 *
 * The import is appended rather than prepended: static imports are hoisted, so
 * the listener is still registered before createInertiaApp() runs, and the
 * app's own line numbers stay intact.
 *
 * @param {string} code
 * @param {string} resourcePath
 * @param {InterstitialTransformOptions} options
 */
function injectInterstitialRuntime(code, resourcePath, options) {
  if (!options.enabled) return code
  if (options.target !== 'web') return code
  if (NODE_MODULES_RE.test(resourcePath)) return code
  if (!CREATE_INERTIA_APP_RE.test(code)) return code
  if (!detectFramework(code)) return code

  const runtimePath = options.runtimePath || RUNTIME_PATH
  const specifier = JSON.stringify(runtimePath)

  if (code.includes(specifier)) return code

  const separator = code.endsWith('\n') ? '' : '\n'

  return `${code}${separator}import ${specifier}\n`
}

module.exports = {
  RUNTIME_PATH,
  injectInterstitialRuntime
}
