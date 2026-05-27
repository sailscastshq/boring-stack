const fs = require('fs')
const path = require('path')
const {
  transformPageResolution,
  normalizePageTransformOptions
} = require('./lib/page-resolution')

const PLUGIN_NAME = 'rsbuild-plugin-inertia'
const EXPOSED_API_ID = 'rsbuild-plugin-inertia'
const DEFAULT_SSR_ENTRY = 'assets/js/ssr.js'

/**
 * @typedef {Object} InertiaSsrOptions
 * @property {string} [entry]
 * @property {string} [name]
 * @property {string} [outDir]
 * @property {string} [filename]
 * @property {boolean} [autoExternal]
 *
 * @typedef {Object} InertiaPluginOptions
 * @property {boolean} [axios]
 * @property {boolean} [pages]
 * @property {boolean|string|InertiaSsrOptions} [ssr]
 *
 * @typedef {Object} NormalizedInertiaPluginOptions
 * @property {boolean} stubAxios
 * @property {boolean} pages
 * @property {'auto'|false|Required<InertiaSsrOptions>} ssr
 */

/**
 * @param {InertiaPluginOptions} [options]
 * @returns {NormalizedInertiaPluginOptions}
 */
function normalizeOptions(options) {
  const input = options || {}

  return {
    // Inertia v3 does not need axios by default, but the optional adapter import
    // can still be seen by bundlers. Stub it centrally instead of asking every
    // template to carry an app-level axios dependency.
    stubAxios: input.axios !== true,
    pages: input.pages !== false,
    ssr: input.ssr === undefined ? 'auto' : normalizeSsrOptions(input.ssr)
  }
}

/**
 * @param {InertiaPluginOptions['ssr']} ssr
 * @returns {false|Required<InertiaSsrOptions>}
 */
function normalizeSsrOptions(ssr) {
  if (!ssr) return false

  const input =
    ssr === true ? {} : typeof ssr === 'string' ? { entry: ssr } : ssr

  return {
    entry: input.entry || DEFAULT_SSR_ENTRY,
    name: input.name || 'inertia',
    outDir: input.outDir || '.tmp/ssr',
    filename: input.filename || '[name].mjs',
    autoExternal: input.autoExternal !== false
  }
}

/**
 * @param {'auto'|false|Required<InertiaSsrOptions>} ssr
 * @param {string} rootPath
 * @param {(file: string) => boolean} fileExists
 * @returns {false|Required<InertiaSsrOptions>}
 */
function resolveSsrOptions(ssr, rootPath, fileExists) {
  if (ssr !== 'auto') return ssr

  const defaultSsr = /** @type {Required<InertiaSsrOptions>} */ (
    normalizeSsrOptions(true)
  )
  const defaultEntry = path.resolve(rootPath, defaultSsr.entry)

  return fileExists(defaultEntry) ? defaultSsr : false
}

/**
 * @param {any} currentWriteToDisk
 * @param {Required<InertiaSsrOptions>} ssr
 * @param {string} rootPath
 */
function withSsrWriteToDisk(currentWriteToDisk, ssr, rootPath) {
  const ssrOutDir = path.resolve(rootPath, ssr.outDir)
  const ssrOutDirWithSeparator = `${ssrOutDir}${path.sep}`

  /**
   * @param {string} file
   */
  return function writeInertiaSsrToDisk(file) {
    const absoluteFile = path.resolve(file)

    if (
      absoluteFile === ssrOutDir ||
      absoluteFile.startsWith(ssrOutDirWithSeparator)
    ) {
      return true
    }

    if (typeof currentWriteToDisk === 'function') {
      return currentWriteToDisk(file)
    }

    if (typeof currentWriteToDisk === 'boolean') {
      return currentWriteToDisk
    }

    return false
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
 * @param {string} packageName
 * @param {string} rootPath
 * @param {(id: string, options?: { paths?: string[] }) => string} resolvePackage
 * @returns {boolean}
 */
function canResolvePackage(packageName, rootPath, resolvePackage) {
  try {
    resolvePackage(packageName, { paths: [rootPath] })
    return true
  } catch {
    return false
  }
}

/**
 * Keep browser entries in the web environment so the SSR environment does not
 * inherit and compile the client bundle as a private Node entry too.
 *
 * @param {Record<string, any>} config
 */
function moveBrowserEntryToWebEnvironment(config) {
  if (!config.source?.entry) return

  config.environments.web = config.environments.web || {}
  config.environments.web.source = config.environments.web.source || {}
  config.environments.web.source.entry =
    config.environments.web.source.entry || config.source.entry

  delete config.source.entry

  if (!Object.keys(config.source).length) {
    delete config.source
  }
}

/**
 * Output copy patterns are browser assets. Move them into the web environment
 * so Rsbuild does not also copy public files during the private Node build.
 *
 * @param {Record<string, any>} config
 */
function moveBrowserOutputToWebEnvironment(config) {
  if (!config.output?.copy) return

  config.environments.web = config.environments.web || {}
  config.environments.web.output = config.environments.web.output || {}
  config.environments.web.output.copy =
    config.environments.web.output.copy || config.output.copy

  delete config.output.copy

  if (!Object.keys(config.output).length) {
    delete config.output
  }
}

/**
 * @param {Record<string, any>} config
 * @param {NormalizedInertiaPluginOptions} options
 * @param {string} rootPath
 * @param {(id: string, options?: { paths?: string[] }) => string} [resolvePackage]
 * @param {(file: string) => boolean} [fileExists]
 */
function applyInertiaConfig(
  config,
  options,
  rootPath,
  resolvePackage,
  fileExists
) {
  const resolveFromRoot = resolvePackage || require.resolve
  const ssr = resolveSsrOptions(
    options.ssr,
    rootPath,
    fileExists || fs.existsSync
  )

  if (
    options.stubAxios &&
    !canResolvePackage('axios', rootPath, resolveFromRoot)
  ) {
    config.resolve = config.resolve || {}
    config.resolve.alias = withAxiosStub(config.resolve.alias)
  }

  if (ssr) {
    config.environments = config.environments || {}
    config.environments.web = config.environments.web || {}
    moveBrowserEntryToWebEnvironment(config)
    moveBrowserOutputToWebEnvironment(config)

    const nodeEnvironment = {
      source: {
        entry: {
          [ssr.name]: path.resolve(rootPath, ssr.entry)
        }
      },
      output: {
        manifest: false,
        target: 'node',
        autoExternal: ssr.autoExternal,
        emitAssets: false,
        copy: /** @type {any[]} */ ([]),
        distPath: {
          root: ssr.outDir,
          js: ''
        },
        filename: {
          js: ssr.filename
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

    config.dev = config.dev || {}
    config.dev.writeToDisk = withSsrWriteToDisk(
      config.dev.writeToDisk,
      ssr,
      rootPath
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
module.exports.resolveSsrOptions = resolveSsrOptions
module.exports.applyInertiaConfig = applyInertiaConfig
module.exports.canResolvePackage = canResolvePackage
module.exports.withSsrWriteToDisk = withSsrWriteToDisk
