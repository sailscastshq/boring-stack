const FRAMEWORKS = {
  '@inertiajs/vue3': {
    extensions: ['.vue'],
    extractDefault: true
  },
  '@inertiajs/react': {
    extensions: ['.tsx', '.jsx'],
    extractDefault: true
  },
  '@inertiajs/svelte': {
    extensions: ['.svelte'],
    extractDefault: false
  }
}

const DEFAULT_PAGE_DIRECTORY = './pages'
const CREATE_INERTIA_APP_RE = /\bcreateInertiaApp\s*\(/

/**
 * @typedef {Object} PageTransformOptions
 * @property {boolean} enabled
 *
 * @typedef {Object} PageResolverConfig
 * @property {string[]} directories
 * @property {string[]} [extensions]
 * @property {boolean} lazy
 * @property {string} [transform]
 */

/**
 * @param {Partial<PageTransformOptions>} [options]
 * @returns {PageTransformOptions}
 */
function normalizePageTransformOptions(options) {
  return {
    enabled: options?.enabled !== false
  }
}

/**
 * @param {string} code
 */
function detectFramework(code) {
  return Object.entries(FRAMEWORKS).find(([packageName]) =>
    code.includes(packageName)
  )?.[1]
}

/**
 * @param {string[]} extensions
 */
function createExtensionPattern(extensions) {
  return extensions
    .map((extension) => extension.replace(/^\./, ''))
    .map((extension) => extension.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
}

/**
 * @param {string} directory
 */
function normalizeDirectory(directory) {
  if (directory.endsWith('/')) {
    return directory.slice(0, -1)
  }

  return directory
}

/**
 * @param {string} extension
 */
function normalizeExtension(extension) {
  return extension.startsWith('.') ? extension : `.${extension}`
}

/**
 * @param {string[]} extensions
 */
function normalizeExtensions(extensions) {
  return [...new Set(extensions.map(normalizeExtension))]
}

/**
 * @param {string[]} directories
 */
function normalizeDirectories(directories) {
  return [...new Set(directories.map(normalizeDirectory))]
}

/**
 * @param {string[]} directories
 * @param {string} extensionPattern
 * @param {boolean} lazy
 */
function createContextList(directories, extensionPattern, lazy) {
  const mode = lazy ? `, 'lazy'` : ''

  return directories
    .map((directory) => {
      return `require.context(${JSON.stringify(
        directory
      )}, true, /\\.(${extensionPattern})$/${mode})`
    })
    .join(',\n      ')
}

/**
 * @param {PageResolverConfig} config
 * @param {{ extensions: string[], extractDefault: boolean }} framework
 */
function createResolver(config, framework) {
  const directories = normalizeDirectories(config.directories)
  const extensions = normalizeExtensions(
    config.extensions || framework.extensions
  )
  const extensionPattern = createExtensionPattern(extensions)
  const contextList = createContextList(
    directories,
    extensionPattern,
    config.lazy
  )
  const resolverPrefix = config.lazy
    ? 'async (name, page) =>'
    : '(name, page) =>'
  const transformLine = config.transform
    ? `const resolvedName = (${config.transform})(name, page)`
    : 'const resolvedName = name'
  const moduleLoad = config.lazy
    ? 'const module = await pages(pagePath)'
    : 'const module = pages(pagePath)'
  const moduleReturn = framework.extractDefault
    ? 'return module.default ?? module'
    : 'return module'

  return `${resolverPrefix} {
    ${transformLine}
    const pageContexts = [
      ${contextList}
    ]

    for (const pages of pageContexts) {
      const pagePath = pages.keys().find((path) => {
        return path.replace(/^\\.\\//, '').replace(/\\.(${extensionPattern})$/, '') === resolvedName
      })

      if (!pagePath) {
        continue
      }

      ${moduleLoad}
      ${moduleReturn}
    }

    throw new Error(\`Inertia page not found: \${name}\`)
  }`
}

/**
 * @param {string} char
 */
function isIdentifierStart(char) {
  return /[A-Za-z_$]/.test(char)
}

/**
 * @param {string} char
 */
function isIdentifierPart(char) {
  return /[A-Za-z0-9_$]/.test(char)
}

/**
 * @param {string} code
 * @param {number} index
 */
function skipWhitespaceAndComments(code, index) {
  let cursor = index

  while (cursor < code.length) {
    if (/\s/.test(code[cursor])) {
      cursor += 1
      continue
    }

    if (code[cursor] === '/' && code[cursor + 1] === '/') {
      cursor += 2
      while (cursor < code.length && code[cursor] !== '\n') cursor += 1
      continue
    }

    if (code[cursor] === '/' && code[cursor + 1] === '*') {
      cursor += 2
      while (
        cursor < code.length &&
        !(code[cursor] === '*' && code[cursor + 1] === '/')
      ) {
        cursor += 1
      }
      cursor += 2
      continue
    }

    break
  }

  return cursor
}

/**
 * @param {string} code
 * @param {number} start
 */
function scanString(code, start) {
  const quote = code[start]
  let escaped = false

  for (let index = start + 1; index < code.length; index += 1) {
    const char = code[index]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === quote) {
      return index + 1
    }
  }

  return -1
}

/**
 * @param {string} code
 * @param {number} start
 */
function scanExpression(code, start) {
  let curlyDepth = 0
  let squareDepth = 0
  let parenDepth = 0
  let index = start

  while (index < code.length) {
    const char = code[index]

    if (char === '"' || char === "'" || char === '`') {
      const end = scanString(code, index)
      if (end === -1) return code.length
      index = end
      continue
    }

    if (char === '/' && code[index + 1] === '/') {
      index += 2
      while (index < code.length && code[index] !== '\n') index += 1
      continue
    }

    if (char === '/' && code[index + 1] === '*') {
      index += 2
      while (
        index < code.length &&
        !(code[index] === '*' && code[index + 1] === '/')
      ) {
        index += 1
      }
      index += 2
      continue
    }

    if (
      char === ',' &&
      curlyDepth === 0 &&
      squareDepth === 0 &&
      parenDepth === 0
    ) {
      return index
    }

    if (
      char === '}' &&
      curlyDepth === 0 &&
      squareDepth === 0 &&
      parenDepth === 0
    ) {
      return index
    }

    if (char === '{') curlyDepth += 1
    if (char === '}') curlyDepth -= 1
    if (char === '[') squareDepth += 1
    if (char === ']') squareDepth -= 1
    if (char === '(') parenDepth += 1
    if (char === ')') parenDepth -= 1

    index += 1
  }

  return code.length
}

/**
 * @param {string} code
 * @param {number} start
 */
function scanBalancedBraces(code, start) {
  let depth = 0
  let index = start

  while (index < code.length) {
    const char = code[index]

    if (char === '"' || char === "'" || char === '`') {
      const end = scanString(code, index)
      if (end === -1) return -1
      index = end
      continue
    }

    if (char === '/' && code[index + 1] === '/') {
      index += 2
      while (index < code.length && code[index] !== '\n') index += 1
      continue
    }

    if (char === '/' && code[index + 1] === '*') {
      index += 2
      while (
        index < code.length &&
        !(code[index] === '*' && code[index + 1] === '/')
      ) {
        index += 1
      }
      index += 2
      continue
    }

    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) return index + 1
    }

    index += 1
  }

  return -1
}

/**
 * @param {string} code
 * @param {number} index
 */
function readPropertyKey(code, index) {
  const cursor = skipWhitespaceAndComments(code, index)
  const char = code[cursor]

  if (char === '"' || char === "'" || char === '`') {
    const end = scanString(code, cursor)
    if (end === -1) return null

    return {
      key: code.slice(cursor + 1, end - 1),
      end
    }
  }

  if (!isIdentifierStart(char)) return null

  let end = cursor + 1
  while (end < code.length && isIdentifierPart(code[end])) end += 1

  return {
    key: code.slice(cursor, end),
    end
  }
}

/**
 * @param {string} code
 * @param {number} objectStart
 * @param {string[]} propertyNames
 */
function findTopLevelObjectProperty(code, objectStart, propertyNames) {
  const objectEnd = scanBalancedBraces(code, objectStart)
  if (objectEnd === -1) return null

  let cursor = objectStart + 1

  while (cursor < objectEnd - 1) {
    cursor = skipWhitespaceAndComments(code, cursor)
    if (cursor >= objectEnd - 1) break

    const propertyStart = cursor
    const key = readPropertyKey(code, cursor)

    if (!key) {
      cursor += 1
      continue
    }

    cursor = skipWhitespaceAndComments(code, key.end)

    if (code[cursor] !== ':') {
      cursor = skipWhitespaceAndComments(code, scanExpression(code, cursor))
      if (code[cursor] === ',') cursor += 1
      continue
    }

    const valueStart = skipWhitespaceAndComments(code, cursor + 1)
    const valueEnd = scanExpression(code, valueStart)
    let propertyEnd = skipWhitespaceAndComments(code, valueEnd)
    const hasTrailingComma = code[propertyEnd] === ','

    if (hasTrailingComma) {
      propertyEnd += 1
    }

    if (propertyNames.includes(key.key)) {
      return {
        key: key.key,
        start: propertyStart,
        end: propertyEnd,
        valueStart,
        valueEnd,
        rawValue: code.slice(valueStart, valueEnd).trim(),
        hasTrailingComma
      }
    }

    cursor = propertyEnd
  }

  return null
}

/**
 * @param {string} rawValue
 */
function extractString(rawValue) {
  const value = rawValue.trim()
  const quote = value[0]

  if (quote !== '"' && quote !== "'" && quote !== '`') return undefined

  const end = scanString(value, 0)
  if (end === -1) return undefined

  return value.slice(1, end - 1)
}

/**
 * @param {string} rawValue
 */
function extractStringArray(rawValue) {
  const value = rawValue.trim()
  if (!value.startsWith('[')) return undefined

  /** @type {string[]} */
  const strings = []
  const stringRe = /(['"`])([^'"`]+)\1/g
  let match

  while ((match = stringRe.exec(value))) {
    strings.push(match[2])
  }

  return strings.length > 0 ? strings : undefined
}

/**
 * @param {string} rawValue
 */
function extractStringList(rawValue) {
  const stringValue = extractString(rawValue)
  if (stringValue) return [stringValue]

  return extractStringArray(rawValue)
}

/**
 * @param {string} rawObject
 * @param {string[]} propertyNames
 */
function extractObjectProperty(rawObject, propertyNames) {
  if (!rawObject.trim().startsWith('{')) return undefined

  const property = findTopLevelObjectProperty(rawObject, 0, propertyNames)
  return property?.rawValue
}

/**
 * @param {string} rawValue
 * @param {string[]} defaultExtensions
 * @returns {PageResolverConfig|null}
 */
function extractPagesConfig(rawValue, defaultExtensions) {
  const stringValue = extractString(rawValue)

  if (stringValue) {
    return {
      directories: [stringValue],
      extensions: defaultExtensions,
      lazy: true
    }
  }

  const rawObject = rawValue.trim()
  if (!rawObject.startsWith('{')) return null

  const rawDirectory =
    extractObjectProperty(rawObject, ['path']) ||
    extractObjectProperty(rawObject, ['directory'])
  const rawExtension = extractObjectProperty(rawObject, ['extension'])
  const rawTransform = extractObjectProperty(rawObject, ['transform'])
  const rawLazy = extractObjectProperty(rawObject, ['lazy'])
  const directories = rawDirectory
    ? extractStringList(rawDirectory)
    : [DEFAULT_PAGE_DIRECTORY]
  const extensions = rawExtension
    ? extractStringList(rawExtension)
    : defaultExtensions
  const lazy = rawLazy ? rawLazy.trim() !== 'false' : true

  if (!directories || !extensions) return null

  return {
    directories,
    extensions,
    lazy,
    transform: rawTransform?.trim()
  }
}

/**
 * @param {string} code
 */
function findCreateInertiaAppCall(code) {
  const match = CREATE_INERTIA_APP_RE.exec(code)
  if (!match) return null

  const argsStart = code.indexOf('(', match.index) + 1
  const firstArg = skipWhitespaceAndComments(code, argsStart)

  if (code[firstArg] === ')') {
    return {
      options: null,
      insertAt: firstArg
    }
  }

  if (code[firstArg] !== '{') return null

  const objectEnd = scanBalancedBraces(code, firstArg)
  if (objectEnd === -1) return null

  return {
    options: {
      start: firstArg,
      end: objectEnd,
      isEmpty: code.slice(firstArg + 1, objectEnd - 1).trim().length === 0
    },
    insertAt: firstArg + 1
  }
}

/**
 * @param {string} code
 * @param {NonNullable<ReturnType<typeof findCreateInertiaAppCall>>} call
 * @param {string} resolver
 */
function injectResolver(code, call, resolver) {
  if (!call.options) {
    return `${code.slice(0, call.insertAt)}{ ${resolver} }${code.slice(
      call.insertAt
    )}`
  }

  if (call.options.isEmpty) {
    return `${code.slice(0, call.options.start)}{ ${resolver} }${code.slice(
      call.options.end
    )}`
  }

  return `${code.slice(0, call.insertAt)} ${resolver},${code.slice(
    call.insertAt
  )}`
}

/**
 * @param {string} code
 * @param {string} resourcePath
 * @param {PageTransformOptions} [options]
 */
function transformPageResolution(code, resourcePath, options) {
  const normalized = normalizePageTransformOptions(options)

  if (!normalized.enabled) return code
  if (!CREATE_INERTIA_APP_RE.test(code)) return code

  const framework = detectFramework(code)
  if (!framework) return code

  const call = findCreateInertiaAppCall(code)
  if (!call) return code

  const optionsStart = call.options?.start
  const existingResolver =
    typeof optionsStart === 'number'
      ? findTopLevelObjectProperty(code, optionsStart, ['resolve'])
      : null

  if (existingResolver) return code

  const pagesProperty =
    typeof optionsStart === 'number'
      ? findTopLevelObjectProperty(code, optionsStart, ['pages'])
      : null
  const config = pagesProperty
    ? extractPagesConfig(pagesProperty.rawValue, framework.extensions)
    : {
        directories: [DEFAULT_PAGE_DIRECTORY],
        extensions: framework.extensions,
        lazy: true
      }

  if (!config) return code

  const resolver = createResolver(config, framework)

  if (!pagesProperty) {
    return injectResolver(code, call, `resolve: ${resolver}`)
  }

  const replacement = `resolve: ${resolver}${
    pagesProperty.hasTrailingComma ? ',' : ''
  }`

  return (
    code.slice(0, pagesProperty.start) +
    replacement +
    code.slice(pagesProperty.end)
  )
}

module.exports = {
  FRAMEWORKS,
  DEFAULT_PAGE_DIRECTORY,
  createResolver,
  normalizePageTransformOptions,
  transformPageResolution
}
