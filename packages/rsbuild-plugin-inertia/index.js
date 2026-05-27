const path = require('path')
const {
  transformPageResolution,
  normalizePageTransformOptions
} = require('./lib/page-resolution')

const PLUGIN_NAME = 'rsbuild-plugin-inertia'
const EXPOSED_API_ID = 'rsbuild-plugin-inertia'

/**
 * @typedef {Object} InertiaSsrOptions
 * @property {string} [entry]
 * @property {string} [name]
 * @property {string} [outDir]
 * @property {boolean} [autoExternal]
 *
 * @typedef {Object} InertiaPluginOptions
 * @property {boolean} [axios]
 * @property {boolean} [pages]
 * @property {false|string|InertiaSsrOptions} [ssr]
 */

/**
 * @param {InertiaPluginOptions} [options]
 */
function normalizeOptions(options) {
  const input = options || {}

  return {
    // Inertia v3 does not need axios by default, but the optional adapter import
    // can still be seen by bundlers. Stub it centrally instead of asking every
    // template to carry an app-level axios dependency.
    stubAxios: input.axios !== true,
    pages: input.pages !== false,
    ssr: normalizeSsrOptions(input.ssr)
  }
}

/**
 * @param {InertiaPluginOptions['ssr']} ssr
 * @returns {false|Required<InertiaSsrOptions>}
 */
function normalizeSsrOptions(ssr) {
  if (!ssr) return false

  const input = typeof ssr === 'string' ? { entry: ssr } : ssr

  return {
    entry: input.entry || 'assets/js/ssr.js',
    name: input.name || 'inertia',
    outDir: input.outDir || '.tmp/ssr',
    autoExternal: input.autoExternal !== false
  }
}

/**
 * @param {Record<string, any>} target
 * @param {Record<string, any>} source
 */
function mergePlainObject(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      mergePlainObject(target[key], value)
    } else {
      target[key] = value
    }
  }

  return target
}

/**
 * @param {any} alias
 */
function withAxiosStub(alias) {
  if (Array.isArray(alias)) {
    return [...alias, { name: 'axios', alias: false }]
  }

  return {
    ...(alias || {}),
    axios: false
  }
}

/**
 * @param {Record<string, any>} config
 * @param {ReturnType<typeof normalizeOptions>} options
 * @param {string} rootPath
 */
function applyInertiaConfig(config, options, rootPath) {
  if (options.stubAxios) {
    config.resolve = config.resolve || {}
    config.resolve.alias = withAxiosStub(config.resolve.alias)
  }

  if (options.ssr) {
    config.environments = config.environments || {}
    config.environments.web = config.environments.web || {}

    const nodeEnvironment = {
      source: {
        entry: {
          [options.ssr.name]: path.resolve(rootPath, options.ssr.entry)
        }
      },
      output: {
        target: 'node',
        autoExternal: options.ssr.autoExternal,
        distPath: {
          root: options.ssr.outDir,
          js: ''
        },
        filename: {
          js: '[name].js'
        }
      },
      tools: {
        htmlPlugin: false
      }
    }

    config.environments.node = mergePlainObject(
      config.environments.node || {},
      nodeEnvironment
    )
  }

  return config
}

/**
 * @param {InertiaPluginOptions} [options]
 */
function pluginInertia(options) {
  const normalized = normalizeOptions(options)
  const pageTransformOptions = normalizePageTransformOptions({
    enabled: normalized.pages
  })

  return {
    name: PLUGIN_NAME,
    /**
     * @param {any} api
     */
    setup(api) {
      api.expose?.(EXPOSED_API_ID, {
        options: normalized
      })

      api.modifyRsbuildConfig((/** @type {Record<string, any>} */ config) => {
        return applyInertiaConfig(config, normalized, api.context.rootPath)
      })

      api.transform(
        {
          test: /\.[cm]?[jt]sx?$/,
          order: 'pre'
        },
        (
          /** @type {{ code: string, resourcePath: string }} */
          transformContext
        ) => {
          const { code, resourcePath } = transformContext
          const transformed = transformPageResolution(
            code,
            resourcePath,
            pageTransformOptions
          )

          if (transformed === code) return null

          return transformed
        }
      )
    }
  }
}

module.exports = pluginInertia
module.exports.default = pluginInertia
module.exports.pluginInertia = pluginInertia
module.exports.normalizeOptions = normalizeOptions
module.exports.applyInertiaConfig = applyInertiaConfig
