const fs = require('fs')
const path = require('path')

/**
 * @typedef {{file: string, line: number}} SourceLocation
 */

/**
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

module.exports = class SourceLocator {
  /**
   * @param {any} sails
   * @param {{paths: string[], extensions: string[]}} pages
   */
  constructor(sails, pages) {
    this.sails = sails
    this.pages = pages
    this.appPath = sails.config?.appPath || process.cwd()
    this.adapterPath = path.resolve(__dirname, '..', '..')
  }

  /**
   * Capture the first application frame outside inertia-sails and Node internals.
   *
   * @returns {SourceLocation|null}
   */
  captureCallerSource() {
    const stack = new Error().stack
    if (typeof stack !== 'string') return null

    for (const frame of stack.split('\n').slice(1)) {
      const match =
        frame.match(/\((.*):(\d+):(\d+)\)$/) ||
        frame.match(/at (.*):(\d+):(\d+)$/)
      if (!match) continue

      const file = path.resolve(match[1])
      if (
        file.startsWith(this.adapterPath + path.sep) ||
        file.startsWith('node:') ||
        file.includes(`${path.sep}node_modules${path.sep}sails${path.sep}`)
      ) {
        continue
      }

      return { file, line: Number(match[2]) }
    }

    return null
  }

  /**
   * @param {string} file
   * @param {number} startLine
   * @param {string} key
   * @returns {number|null}
   */
  findPropKeyLine(file, startLine, key) {
    let lines

    try {
      lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
    } catch {
      return null
    }

    const escaped = escapeRegExp(key.split('.')[0])
    const pattern = new RegExp(
      `(?:^|[,{\\s])(?:['"\`]${escaped}['"\`]|${escaped})\\s*:`
    )
    const start = Math.max(0, startLine - 1)
    const end = Math.min(lines.length, start + 180)

    for (let index = start; index < end; index += 1) {
      if (pattern.test(lines[index])) return index + 1
    }

    return null
  }

  /**
   * @param {any} req
   * @returns {string|null}
   */
  resolveActionFile(req) {
    const action = req.options?.action
    const controllersPath =
      this.sails.config?.paths?.controllers ||
      path.join(this.appPath, 'api/controllers')

    if (typeof action !== 'string' || action === '') return null

    const normalizedAction = action.replace(/\./g, '/')
    const root = path.resolve(controllersPath)
    const candidate = path.resolve(root, `${normalizedAction}.js`)

    if (!candidate.startsWith(root + path.sep)) return null

    try {
      return fs.statSync(candidate).isFile() ? candidate : null
    } catch {
      return null
    }
  }

  /**
   * @param {any} req
   * @returns {SourceLocation|null}
   */
  resolveActionSource(req) {
    const file = this.resolveActionFile(req)
    if (file === null) return null

    let lines

    try {
      lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
    } catch {
      return null
    }

    const index = lines.findIndex((line) => /\bfn\s*:\s*/.test(line))
    return { file, line: index === -1 ? 1 : index + 1 }
  }

  /**
   * @param {any} req
   * @param {string} component
   * @returns {SourceLocation|null}
   */
  resolveRenderSource(req, component) {
    const actionSource = this.resolveActionSource(req)
    if (actionSource === null) return null

    let lines

    try {
      lines = fs.readFileSync(actionSource.file, 'utf8').split(/\r?\n/)
    } catch {
      return actionSource
    }

    const componentPattern = new RegExp(
      `\\bpage\\s*:\\s*['"\`]${escapeRegExp(component)}['"\`]`
    )
    let index = lines.findIndex((line) => componentPattern.test(line))

    if (index === -1) {
      index = lines.findIndex((line) => /\bpage\s*:/.test(line))
    }

    return index === -1
      ? actionSource
      : { file: actionSource.file, line: index + 1 }
  }

  /**
   * @param {string} component
   * @returns {string|null}
   */
  resolveComponentPath(component) {
    const hasKnownExtension = this.pages.extensions.some((extension) =>
      component.endsWith(extension)
    )
    const componentNames = hasKnownExtension
      ? [component]
      : this.pages.extensions.map((extension) => `${component}${extension}`)

    for (const configuredRoot of this.pages.paths) {
      const root = path.resolve(this.appPath, configuredRoot)

      for (const componentName of componentNames) {
        const candidate = path.resolve(root, componentName)
        if (candidate !== root && !candidate.startsWith(root + path.sep)) {
          continue
        }

        try {
          if (!fs.statSync(candidate).isFile()) continue

          const realRoot = fs.realpathSync(root)
          const realCandidate = fs.realpathSync(candidate)
          if (
            realCandidate !== realRoot &&
            realCandidate.startsWith(realRoot + path.sep)
          ) {
            return realCandidate
          }
        } catch {
          // Keep trying the remaining roots and extensions.
        }
      }
    }

    return null
  }

  /**
   * @param {any} req
   * @returns {{name: null, uri: string, action: string|null, actionSource?: SourceLocation}}
   */
  resolveRoute(req) {
    const routePath = req.route?.path
    const uri =
      typeof routePath === 'string'
        ? routePath.startsWith('/')
          ? routePath
          : `/${routePath}`
        : String(req.path || req.originalUrl || req.url || '/').split('?')[0]
    const action =
      typeof req.options?.action === 'string' ? req.options.action : null
    const actionSource = this.resolveActionSource(req)
    /** @type {{name: null, uri: string, action: string|null}} */
    const route = { name: null, uri, action }

    return actionSource ? { ...route, actionSource } : route
  }
}
