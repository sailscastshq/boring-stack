const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const ENTRY_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/

/**
 * @typedef {Object} RepositoryConfig
 * @property {string} path
 * @property {number} ttl
 * @property {number} pruneInterval
 * @property {number} limit
 * @property {number} circuitBreaker
 */

module.exports = class EntryRepository {
  /**
   * @param {RepositoryConfig} config
   * @param {{warn?: (...args: any[]) => void}} [logger]
   * @param {(entry: Record<string, any>) => Record<string, any>} [prepare]
   */
  constructor(config, logger = {}, prepare = (entry) => entry) {
    this.config = config
    this.logger = logger
    this.prepare = prepare
    this.disabledUntil = 0
    this.lastPrunedAt = 0
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  isValidId(id) {
    return ENTRY_ID_PATTERN.test(id)
  }

  ensureDirectory() {
    fs.mkdirSync(this.config.path, { recursive: true, mode: 0o700 })

    try {
      fs.chmodSync(this.config.path, 0o700)
    } catch {
      // Some development filesystems do not support POSIX modes.
    }

    const gitignore = path.join(this.config.path, '.gitignore')
    if (!fs.existsSync(gitignore)) {
      fs.writeFileSync(gitignore, '*\n', { mode: 0o600 })
    }
  }

  /**
   * @param {string} id
   * @returns {string}
   */
  entryPath(id) {
    return path.join(this.config.path, `${id}.json`)
  }

  /**
   * @param {Record<string, any>} entry
   * @returns {boolean}
   */
  record(entry) {
    if (Date.now() < this.disabledUntil) return false

    const prepared = this.prepare(entry)
    const id = prepared?.__meta?.id
    if (typeof id !== 'string' || !this.isValidId(id)) return false

    let temporaryPath = ''

    try {
      const encoded = JSON.stringify(prepared)
      this.ensureDirectory()
      temporaryPath = path.join(
        this.config.path,
        `.${id}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`
      )
      fs.writeFileSync(temporaryPath, encoded, { mode: 0o600 })
      fs.renameSync(temporaryPath, this.entryPath(id))

      try {
        fs.chmodSync(this.entryPath(id), 0o600)
      } catch {
        // Some development filesystems do not support POSIX modes.
      }

      const tabUuid = prepared.__meta.tabUuid
      if (typeof tabUuid === 'string' && tabUuid !== '') {
        this.enforceTabLimit(tabUuid, this.config.limit)
      }
      this.pruneIfDue()
      return true
    } catch (error) {
      if (temporaryPath !== '') {
        try {
          fs.unlinkSync(temporaryPath)
        } catch {
          // The atomic rename may already have consumed the temporary file.
        }
      }

      this.disabledUntil = Date.now() + this.config.circuitBreaker
      this.logger.warn?.(
        'inertia-sails: DevTools recording temporarily disabled after a storage failure:',
        error instanceof Error ? error.message : String(error)
      )
      return false
    }
  }

  /**
   * @param {string} id
   * @returns {Record<string, any>|null}
   */
  get(id) {
    if (!this.isValidId(id)) return null

    try {
      const decoded = JSON.parse(fs.readFileSync(this.entryPath(id), 'utf8'))
      if (!decoded?.__meta || decoded.__meta.id !== id) return null
      const cutoff = Date.now() / 1000 - this.config.ttl * 3600
      if (Number(decoded.__meta.utime) < cutoff) {
        fs.unlinkSync(this.entryPath(id))
        return null
      }
      return decoded
    } catch {
      return null
    }
  }

  /**
   * @returns {Array<{file: string, entry: Record<string, any>}>}
   */
  entriesFromDisk() {
    let files

    try {
      files = fs.readdirSync(this.config.path, { withFileTypes: true })
    } catch {
      return []
    }

    /** @type {Array<{file: string, entry: Record<string, any>}>} */
    const entries = []

    for (const file of files) {
      if (
        !file.isFile() ||
        !file.name.endsWith('.json') ||
        file.name.startsWith('.')
      ) {
        continue
      }

      const id = file.name.slice(0, -5)
      const entry = this.get(id)
      if (entry?.__meta) {
        entries.push({ file: this.entryPath(id), entry })
      }
    }

    return entries
  }

  /**
   * @param {string} tabUuid
   * @param {number} limit
   */
  enforceTabLimit(tabUuid, limit) {
    if (limit <= 0) return

    const matching = this.entriesFromDisk()
      .filter(({ entry }) => entry.__meta?.tabUuid === tabUuid)
      .sort(
        (left, right) =>
          Number(right.entry.__meta.utime || 0) -
          Number(left.entry.__meta.utime || 0)
      )

    for (const { file } of matching.slice(limit)) {
      try {
        fs.unlinkSync(file)
      } catch {
        // Entries are best-effort development diagnostics.
      }
    }
  }

  pruneIfDue() {
    const now = Date.now()
    if (
      this.config.pruneInterval > 0 &&
      now - this.lastPrunedAt < this.config.pruneInterval
    ) {
      return
    }

    this.lastPrunedAt = now
    this.prune(this.config.ttl)
  }

  /**
   * @param {number} hours
   */
  prune(hours) {
    if (hours < 0) return

    const cutoff = Date.now() / 1000 - hours * 3600

    for (const { file, entry } of this.entriesFromDisk()) {
      if (Number(entry.__meta?.utime || 0) >= cutoff) continue

      try {
        fs.unlinkSync(file)
      } catch {
        // Entries are best-effort development diagnostics.
      }
    }
  }
}

module.exports.ENTRY_ID_PATTERN = ENTRY_ID_PATTERN
