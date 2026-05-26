/**
 * Utilities for describing how mergeable props should be merged by the client.
 *
 * @typedef {import('../types').MergeOperation} MergeOperation
 * @typedef {import('../types').MergeOptions} MergeOptions
 * @typedef {string|string[]|Record<string, string|null>|null} MergeTargetInput
 */

/**
 * @returns {MergeOperation}
 */
function createDefaultMergeOperation() {
  return {
    direction: 'append',
    path: null,
    matchOn: null,
    isDefault: true
  }
}

/**
 * @param {MergeOptions|string|null|undefined} options
 * @returns {MergeOptions}
 */
function normalizeMergeOptions(options) {
  return typeof options === 'string' ? { matchOn: options } : options || {}
}

/**
 * @param {MergeTargetInput} paths
 * @param {MergeOptions|string} [options]
 * @returns {Array<{ path: string|null, matchOn: string|null }>}
 */
function normalizeMergeTargets(paths, options = {}) {
  const normalizedOptions = normalizeMergeOptions(options)

  if (paths === null || paths === undefined) {
    return [
      {
        path: null,
        matchOn:
          typeof normalizedOptions.matchOn === 'string'
            ? normalizedOptions.matchOn
            : null
      }
    ]
  }

  if (Array.isArray(paths)) {
    return paths.map((path) => ({
      path: normalizePath(path),
      matchOn: resolveTargetMatchOn(path, normalizedOptions)
    }))
  }

  if (typeof paths === 'object') {
    return Object.entries(paths).map(([path, matchOn]) => ({
      path: normalizePath(path),
      matchOn: matchOn || null
    }))
  }

  return [
    {
      path: normalizePath(paths),
      matchOn: resolveTargetMatchOn(paths, normalizedOptions)
    }
  ]
}

/**
 * @param {string} path
 * @returns {string|null}
 */
function normalizePath(path) {
  return path === '' ? null : path
}

/**
 * @param {string} path
 * @param {MergeOptions} options
 * @returns {string|null}
 */
function resolveTargetMatchOn(path, options) {
  if (!options.matchOn) return null
  if (typeof options.matchOn === 'object') return options.matchOn[path] || null
  return options.matchOn
}

/**
 * @param {string} key
 * @param {string|null} path
 * @returns {string}
 */
function resolvePropPath(key, path) {
  return path ? `${key}.${path}` : key
}

/**
 * @template T
 * @param {T[]} values
 * @returns {T[]}
 */
function unique(values) {
  return [...new Set(values)]
}

module.exports = {
  createDefaultMergeOperation,
  normalizeMergeOptions,
  normalizeMergeTargets,
  resolvePropPath,
  unique
}
