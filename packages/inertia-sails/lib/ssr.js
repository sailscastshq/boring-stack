const fs = require('fs')
const path = require('path')
const { pathToFileURL } = require('url')

const DEFAULT_SSR_CONFIG = {
  enabled: false,
  bundle: '.tmp/ssr/inertia.mjs',
  pages: false,
  fallback: true
}

/**
 * @typedef {Object} SsrConfig
 * @property {boolean} enabled
 * @property {string} bundle
 * @property {boolean|string|RegExp|Array<string|RegExp>|((component: string, page: Record<string, any>) => boolean)} pages
 * @property {boolean} fallback
 */

/**
 * @param {Record<string, any>} sails
 * @returns {SsrConfig}
 */
function normalizeSsrConfig(sails) {
  const configured = sails.config?.inertia?.ssr

  if (!configured) {
    return { ...DEFAULT_SSR_CONFIG }
  }

  if (configured === true) {
    return {
      ...DEFAULT_SSR_CONFIG,
      enabled: true,
      pages: true
    }
  }

  if (typeof configured === 'string') {
    return {
      ...DEFAULT_SSR_CONFIG,
      enabled: true,
      bundle: configured,
      pages: true
    }
  }

  const enabled = configured.enabled === true

  return {
    ...DEFAULT_SSR_CONFIG,
    ...configured,
    enabled,
    bundle: configured.bundle || DEFAULT_SSR_CONFIG.bundle,
    pages: configured.pages === undefined ? enabled : configured.pages,
    fallback: configured.fallback !== false
  }
}

/**
 * @param {string} component
 * @param {Record<string, any>} page
 * @param {SsrConfig['pages']} selector
 * @returns {boolean}
 */
function matchesPageSelector(component, page, selector) {
  if (selector === true) return true
  if (!selector) return false

  if (Array.isArray(selector)) {
    return selector.some((candidate) =>
      matchesPageSelector(component, page, candidate)
    )
  }

  if (typeof selector === 'function') {
    return selector(component, page)
  }

  if (selector instanceof RegExp) {
    return selector.test(component)
  }

  if (typeof selector === 'string') {
    return selector === component
  }

  return false
}

/**
 * @param {Record<string, any>} data
 * @param {Record<string, any>} page
 * @param {SsrConfig} config
 * @returns {boolean}
 */
function shouldRenderSsr(data, page, config) {
  if (!config.enabled) return false
  if (typeof data.ssr === 'boolean') return data.ssr

  return matchesPageSelector(page.component, page, config.pages)
}

/**
 * @param {Record<string, any>} sails
 * @param {SsrConfig} config
 * @returns {string}
 */
function resolveBundlePath(sails, config) {
  if (path.isAbsolute(config.bundle)) return config.bundle

  return path.resolve(sails.config?.appPath || process.cwd(), config.bundle)
}

/**
 * @param {Record<string, any>} module
 * @returns {((page: Record<string, any>) => any)|null}
 */
function resolveRenderer(module) {
  if (typeof module.default === 'function') return module.default
  if (typeof module.render === 'function') return module.render
  if (typeof module.default?.default === 'function')
    return module.default.default
  if (typeof module.default?.render === 'function') return module.default.render

  return null
}

/**
 * @param {Record<string, any>} rendered
 * @returns {{ head: string[], body: string }|null}
 */
function normalizeRenderedPage(rendered) {
  if (!rendered) return null

  if (typeof rendered === 'string') {
    return {
      head: [],
      body: rendered
    }
  }

  return {
    head: Array.isArray(rendered.head) ? rendered.head : [],
    body: rendered.body || ''
  }
}

/**
 * @param {Record<string, any>} sails
 * @param {Error} error
 * @param {SsrConfig} config
 * @returns {null}
 */
function handleSsrError(sails, error, config) {
  if (!config.fallback) {
    throw error
  }

  sails.log?.warn?.(
    'inertia-sails: SSR failed; falling back to the client-rendered shell.',
    error.message || error
  )

  return null
}

/**
 * @param {Record<string, any>} sails
 * @param {Record<string, any>} page
 * @param {SsrConfig} config
 * @returns {Promise<{ head: string[], body: string }|null>}
 */
async function renderSsrPage(sails, page, config) {
  try {
    const bundlePath = resolveBundlePath(sails, config)
    const bundleStats = fs.statSync(bundlePath)
    const bundleUrl = `${pathToFileURL(bundlePath).href}?mtime=${
      bundleStats.mtimeMs
    }`
    const ssrModule = await import(bundleUrl)
    const renderer = resolveRenderer(ssrModule)

    if (!renderer) {
      throw new Error(`SSR bundle "${config.bundle}" must export a renderer`)
    }

    return normalizeRenderedPage(await renderer(page))
  } catch (error) {
    return handleSsrError(sails, /** @type {Error} */ (error), config)
  }
}

module.exports = {
  DEFAULT_SSR_CONFIG,
  matchesPageSelector,
  normalizeSsrConfig,
  renderSsrPage,
  shouldRenderSsr
}
