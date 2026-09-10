const crypto = require('crypto')
const { INERTIA } = require('../helpers/inertia-headers')
const classifyProp = require('./prop-classifier')
const { readHeader } = require('./prop-classifier')
const buildEntry = require('./entry-builder')
const { HEADERS } = require('./constants')
const { isPrefetch } = require('./entry-builder')

module.exports = class RequestRecorder {
  /**
   * @param {Object} options
   * @param {any} options.req
   * @param {any} options.res
   * @param {any} options.repository
   * @param {any} options.sourceLocator
   * @param {any} options.redactor
   * @param {any} options.config
   * @param {Record<string, {file: string, line: number}>} [options.shareSources]
   */
  constructor({
    req,
    res,
    repository,
    sourceLocator,
    redactor,
    config,
    shareSources = {}
  }) {
    this.req = req
    this.res = res
    this.repository = repository
    this.sourceLocator = sourceLocator
    this.redactor = redactor
    this.config = config
    this.id = crypto.randomUUID()
    this.startedAt = process.hrtime.bigint()
    this.batchId = readHeader(req, HEADERS.PARENT)
    this.parentOut = isPrefetch(req) ? this.id : this.batchId || this.id
    this.shareSources = { ...shareSources }
    this.payload = null
    this.collector = /** @type {{
     * component: string,
     * sharedKeys: Set<string>,
     * props: Record<string, Record<string, any>>,
     * propValues: Record<string, any>
     * }|null} */ (null)
    this.rawResponse = { value: undefined, streamed: false }
    this.finalized = false
    this.tagInjected = false
  }

  start() {
    this.setHeader(HEADERS.ID, this.id)
    this.setHeader(HEADERS.PARENT_OUT, this.parentOut)
    this.wrapResponse()

    if (typeof this.res.once === 'function') {
      this.res.once('finish', () => this.finalize())
    }
  }

  /**
   * @param {string} name
   * @param {string} value
   */
  setHeader(name, value) {
    if (typeof this.res.set === 'function') {
      this.res.set(name, value)
    } else if (typeof this.res.setHeader === 'function') {
      this.res.setHeader(name, value)
    }
  }

  wrapResponse() {
    const recorder = this

    if (typeof this.res.write === 'function') {
      const originalWrite = this.res.write
      this.res.write = function wrappedDevToolsWrite(
        /** @type {any[]} */ ...args
      ) {
        if (recorder.rawResponse.value === undefined) {
          recorder.rawResponse.streamed = true
        }
        return Reflect.apply(originalWrite, this, args)
      }
    }

    if (typeof this.res.send === 'function') {
      const originalSend = this.res.send
      this.res.send = function wrappedDevToolsSend(/** @type {any} */ body) {
        const injected = recorder.injectInitialTag(body)
        recorder.rawResponse.value = injected
        return Reflect.apply(originalSend, this, [injected])
      }
    }

    if (typeof this.res.end === 'function') {
      const originalEnd = this.res.end
      this.res.end = function wrappedDevToolsEnd(/** @type {any[]} */ ...args) {
        if (
          typeof args[0] === 'string' ||
          Buffer.isBuffer(args[0]) ||
          args[0] === null
        ) {
          args[0] = recorder.injectInitialTag(args[0])
          recorder.rawResponse.value = args[0]
        }
        return Reflect.apply(originalEnd, this, args)
      }
    }
  }

  /**
   * @param {any} body
   * @returns {any}
   */
  injectInitialTag(body) {
    if (
      this.tagInjected ||
      this.res.headersSent ||
      this.rawResponse.streamed ||
      readHeader(this.req, INERTIA) !== null ||
      Number(this.res.statusCode || 200) !== 200 ||
      typeof this.payload?.component !== 'string'
    ) {
      return body
    }

    const isBuffer = Buffer.isBuffer(body)
    if (!isBuffer && typeof body !== 'string') return body

    const contentType =
      typeof this.res.getHeader === 'function'
        ? String(this.res.getHeader('Content-Type') || '').toLowerCase()
        : ''
    if (contentType !== '' && !contentType.includes('text/html')) return body

    const content = isBuffer ? body.toString('utf8') : body
    const closingBody = content.lastIndexOf('</body>')
    if (closingBody === -1) return body

    const tag = `<script data-inertia-devtools-id type="application/json">${JSON.stringify(
      this.id
    )}</script>`
    const injected =
      content.slice(0, closingBody) + tag + content.slice(closingBody)
    this.tagInjected = true

    if (typeof this.res.removeHeader === 'function') {
      this.res.removeHeader('Content-Length')
    }

    return isBuffer ? Buffer.from(injected) : injected
  }

  /**
   * @param {string[]} keys
   * @param {{file: string, line: number}} source
   */
  propsShared(keys, source) {
    for (const key of keys) {
      this.shareSources[key] = {
        file: source.file,
        line:
          this.sourceLocator.findPropKeyLine(source.file, source.line, key) ||
          source.line
      }
    }
  }

  /**
   * @param {string} component
   * @param {string[]} sharedKeys
   */
  pageRendering(component, sharedKeys) {
    this.collector = {
      component,
      sharedKeys: new Set(sharedKeys),
      props: {},
      propValues: {}
    }
  }

  /**
   * @param {string} path
   * @param {any} prop
   * @param {any} value
   */
  propResolved(path, prop, value) {
    if (this.collector === null) return

    /** @type {Record<string, any>} */
    const meta = {
      shared: this.collector.sharedKeys.has(path),
      ...classifyProp(path, prop, this.req)
    }
    const shareSource = this.shareSources[path]
    if (shareSource) meta.shareSource = shareSource

    this.collector.props[path] = meta
    this.collector.propValues[path] = value
  }

  /**
   * @param {string} path
   * @param {any} prop
   */
  propRescued(path, prop) {
    if (this.collector === null) return

    /** @type {Record<string, any>} */
    const meta = {
      shared: this.collector.sharedKeys.has(path),
      ...classifyProp(path, prop, this.req),
      rescued: true
    }
    const shareSource = this.shareSources[path]
    if (shareSource) meta.shareSource = shareSource

    this.collector.props[path] = meta
  }

  /**
   * @param {Record<string, any>} page
   */
  pageRendered(page) {
    if (this.collector === null) return

    let clientProps = page.props || {}
    try {
      clientProps = JSON.parse(JSON.stringify(clientProps))
    } catch {
      // The entry builder will safely sanitize any values JSON could not encode.
    }

    for (const path of Object.keys(this.collector.props)) {
      if (Object.prototype.hasOwnProperty.call(clientProps, path)) {
        this.collector.propValues[path] = clientProps[path]
      } else {
        delete this.collector.propValues[path]
      }
    }

    for (const [path, value] of Object.entries(clientProps)) {
      if (this.collector.props[path]) continue
      this.collector.props[path] = {
        shared: this.collector.sharedKeys.has(path),
        inertiaType: null
      }
      this.collector.propValues[path] = value
    }

    const renderSource = this.sourceLocator.resolveRenderSource(
      this.req,
      this.collector.component
    )

    for (const [path, meta] of Object.entries(this.collector.props)) {
      if (meta.shared || meta.shareSource || renderSource === null) continue

      const line = this.sourceLocator.findPropKeyLine(
        renderSource.file,
        renderSource.line,
        path
      )
      if (line !== null) {
        meta.renderSource = { file: renderSource.file, line }
      }
    }

    this.payload = {
      schemaVersion: 1,
      component: this.collector.component,
      props: this.collector.props,
      propValues: this.collector.propValues,
      route: this.sourceLocator.resolveRoute(this.req),
      renderSource,
      componentPath: this.sourceLocator.resolveComponentPath(
        this.collector.component
      ),
      responseBody: page
    }
  }

  /**
   * Build and persist the entry. All failures are intentionally swallowed because
   * DevTools is a passive development observer.
   *
   * @returns {Record<string, any>|null}
   */
  finalize() {
    if (this.finalized) return null
    this.finalized = true

    try {
      const entry = buildEntry({
        req: this.req,
        res: this.res,
        id: this.id,
        batchId: this.batchId,
        startedAt: this.startedAt,
        payload: this.payload,
        rawResponse: this.rawResponse,
        sourceLocator: this.sourceLocator,
        redactor: this.redactor,
        bodyLimit: this.config.bodyLimit
      })
      this.repository.record(entry)
      return entry
    } catch {
      return null
    }
  }
}
