/**
 * Utilities for describing how mergeable props should be merged by the client.
 */

function createDefaultMergeOperation() {
  return {
    direction: 'append',
    path: null,
    matchOn: null,
    isDefault: true
  }
}

function normalizeMergeOptions(options) {
  return typeof options === 'string' ? { matchOn: options } : options || {}
}

function normalizeMergeTargets(paths, options = {}) {
  const normalizedOptions = normalizeMergeOptions(options)

  if (paths === null || paths === undefined) {
    return [
      {
        path: null,
        matchOn: normalizedOptions.matchOn || null
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
      matchOn
    }))
  }

  return [
    {
      path: normalizePath(paths),
      matchOn: resolveTargetMatchOn(paths, normalizedOptions)
    }
  ]
}

function normalizePath(path) {
  return path === '' ? null : path
}

function resolveTargetMatchOn(path, options) {
  if (!options.matchOn) return null
  if (typeof options.matchOn === 'object') return options.matchOn[path] || null
  return options.matchOn
}

function resolvePropPath(key, path) {
  return path ? `${key}.${path}` : key
}

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
