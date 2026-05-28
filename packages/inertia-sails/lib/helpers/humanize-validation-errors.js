/**
 * @typedef {import('../types').BadRequestData} BadRequestData
 *
 * @typedef {Object} AnchorViolation
 * @property {string} [rule]
 * @property {string} [message]
 *
 * @typedef {Object} RttcViolation
 * @property {string} [code]
 * @property {Array<string|number>} [hops]
 * @property {*} [actual]
 * @property {*} [expected]
 * @property {string} [message]
 *
 * @typedef {Object} ParsedValidationProblem
 * @property {string} field
 * @property {string[]} messages
 * @property {string} [rule]
 */

/**
 * @param {*} value
 * @returns {value is Record<string, any>}
 */
function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/**
 * @param {string} field
 * @returns {string}
 */
function cleanFieldName(field) {
  return String(field)
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^\.+/, '')
}

/**
 * @param {string} field
 * @returns {string}
 */
function humanizeField(field) {
  const label = cleanFieldName(field)
    .replace(/\[(\d+)\]/g, ' $1 ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

  if (!label) {
    return 'This field'
  }

  return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * @param {string} message
 * @returns {string}
 */
function cleanMessage(message) {
  return String(message)
    .replace(/^\s*[·•]\s*/, '')
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')
    .trim()
}

/**
 * @param {string} message
 * @returns {string[]}
 */
function splitProblemMessages(message) {
  return String(message)
    .split(/\n\s*[·•]\s*/g)
    .map(cleanMessage)
    .filter(Boolean)
}

/**
 * @param {string} outerField
 * @param {string} innerField
 * @returns {string}
 */
function joinField(outerField, innerField) {
  const cleanOuter = cleanFieldName(outerField)
  const cleanInner = cleanFieldName(innerField)

  if (!cleanOuter) {
    return cleanInner
  }

  if (!cleanInner) {
    return cleanOuter
  }

  return `${cleanOuter}.${cleanInner}`
}

/**
 * @param {string} field
 * @param {string} message
 * @returns {ParsedValidationProblem[]}
 */
function parseFieldMessage(field, message) {
  const parsedMessages = splitProblemMessages(message)

  return parsedMessages.map((rawMessage) => {
    const nested = rawMessage.match(/^@\s*`([^`]+)`:\s*(.*)$/)

    if (nested) {
      return {
        field: joinField(field, nested[1]),
        messages: [nested[2]]
      }
    }

    return {
      field: cleanFieldName(field),
      messages: [rawMessage]
    }
  })
}

/**
 * @param {string} problem
 * @returns {ParsedValidationProblem[]}
 */
function parseStringProblem(problem) {
  const trimmedProblem = String(problem).trim()
  const invalidMatches = trimmedProblem.match(/^Invalid\s+(.+?):\s*([\s\S]*)$/i)

  if (invalidMatches) {
    return parseFieldMessage(invalidMatches[1], invalidMatches[2])
  }

  const quotedFieldMatches = trimmedProblem.match(/^"([^"]+)"\s+(.*)$/)

  if (quotedFieldMatches) {
    return parseFieldMessage(quotedFieldMatches[1], quotedFieldMatches[2])
  }

  const nestedMatches = trimmedProblem.match(/^@\s*`([^`]+)`:\s*(.*)$/)

  if (nestedMatches) {
    return parseFieldMessage(nestedMatches[1], nestedMatches[2])
  }

  return []
}

/**
 * @param {string|undefined} rule
 * @param {string} fieldLabel
 * @param {string} message
 * @returns {string|null}
 */
function formatKnownValidationRule(rule, fieldLabel, message) {
  const configuredNumberMatches = message.match(
    /configured (?:minimum|maximum)(?: length)? \(([^)]+)\)/i
  )
  const configuredValue = configuredNumberMatches?.[1]

  switch (rule) {
    case 'isBoolean':
      return `${fieldLabel} must be true or false`
    case 'isEmail':
      return 'Please enter a valid email address'
    case 'isInteger':
      return `${fieldLabel} must be an integer`
    case 'isNumber':
      return `${fieldLabel} must be a number`
    case 'isString':
      return `${fieldLabel} must be text`
    case 'isNotEmptyString':
      return `${fieldLabel} is required`
    case 'isURL':
      return `${fieldLabel} must be a valid URL`
    case 'isUUID':
      return `${fieldLabel} must be a valid UUID`
    case 'isIP':
      return `${fieldLabel} must be a valid IP address`
    case 'isCreditCard':
      return `${fieldLabel} must be a valid credit card`
    case 'isHexColor':
      return `${fieldLabel} must be a valid hex color`
    case 'isIn':
    case 'isNotIn':
      return `${fieldLabel} is not an allowed value`
    case 'min':
    case 'minLength':
      return configuredValue
        ? `${fieldLabel} must be at least ${configuredValue}${
            rule === 'minLength' ? ' characters' : ''
          }`
        : null
    case 'max':
    case 'maxLength':
      return configuredValue
        ? `${fieldLabel} must be at most ${configuredValue}${
            rule === 'maxLength' ? ' characters' : ''
          }`
        : null
    case 'regex':
    case 'custom':
      return `${fieldLabel} is invalid`
    default:
      return null
  }
}

/**
 * @param {string} fieldLabel
 * @param {string} message
 * @returns {string|null}
 */
function formatKnownValidationMessage(fieldLabel, message) {
  if (/valid email address/i.test(message)) {
    return 'Please enter a valid email address'
  }

  if (/valid URL/i.test(message)) {
    return `${fieldLabel} must be a valid URL`
  }

  if (/valid UUID/i.test(message)) {
    return `${fieldLabel} must be a valid UUID`
  }

  if (/valid IP address/i.test(message)) {
    return `${fieldLabel} must be a valid IP address`
  }

  if (/valid credit card/i.test(message)) {
    return `${fieldLabel} must be a valid credit card`
  }

  if (/valid hex color/i.test(message)) {
    return `${fieldLabel} must be a valid hex color`
  }

  if (/not a boolean/i.test(message)) {
    return `${fieldLabel} must be true or false`
  }

  if (/not an integer/i.test(message)) {
    return `${fieldLabel} must be an integer`
  }

  if (/not a number/i.test(message)) {
    return `${fieldLabel} must be a number`
  }

  if (/not a string/i.test(message)) {
    return `${fieldLabel} must be text`
  }

  if (
    /is required|not defined|empty string|cannot use ''|cannot use `null`|missing property/i.test(
      message
    )
  ) {
    return `${fieldLabel} is required`
  }

  const minLengthMatches = message.match(
    /shorter than the configured minimum length \(([^)]+)\)/i
  )

  if (minLengthMatches) {
    return `${fieldLabel} must be at least ${minLengthMatches[1]} characters`
  }

  const maxLengthMatches = message.match(
    /longer than the configured maximum length \(([^)]+)\)/i
  )

  if (maxLengthMatches) {
    return `${fieldLabel} must be at most ${maxLengthMatches[1]} characters`
  }

  const minMatches = message.match(
    /less than the configured minimum \(([^)]+)\)/i
  )

  if (minMatches) {
    return `${fieldLabel} must be at least ${minMatches[1]}`
  }

  const maxMatches = message.match(
    /greater than the configured maximum \(([^)]+)\)/i
  )

  if (maxMatches) {
    return `${fieldLabel} must be at most ${maxMatches[1]}`
  }

  if (/configured whitelist|configured blacklist/i.test(message)) {
    return `${fieldLabel} is not an allowed value`
  }

  if (/regular expression|failed custom validation/i.test(message)) {
    return `${fieldLabel} is invalid`
  }

  return null
}

/**
 * @param {string} message
 * @returns {string}
 */
function stripInspectedValue(message) {
  return message
    .replace(/^Value\s+\([^)]*\)\s+/i, '')
    .replace(/^Value\s+`[^`]*`\s+/i, '')
    .replace(/^Value\s+"[^"]*"\s+/i, '')
    .replace(/^Value\s+'[^']*'\s+/i, '')
    .replace(/^Value\s+/i, '')
    .trim()
}

/**
 * @param {string} message
 * @returns {string}
 */
function sentenceCase(message) {
  if (!message) {
    return message
  }

  return message.charAt(0).toUpperCase() + message.slice(1)
}

/**
 * @param {string} field
 * @param {string} message
 * @param {string} [rule]
 * @returns {string}
 */
function formatValidationMessage(field, message, rule) {
  const sanitizedMessage = cleanMessage(message)
  const fieldLabel = humanizeField(field)
  const ruleMessage = formatKnownValidationRule(
    rule,
    fieldLabel,
    sanitizedMessage
  )

  if (ruleMessage) {
    return ruleMessage
  }

  const knownMessage = formatKnownValidationMessage(
    fieldLabel,
    sanitizedMessage
  )

  if (knownMessage) {
    return knownMessage
  }

  const withoutValue = stripInspectedValue(sanitizedMessage)

  if (withoutValue && withoutValue !== sanitizedMessage) {
    return sentenceCase(`${fieldLabel} ${withoutValue}`.replace(/\.$/, ''))
  }

  return sentenceCase(sanitizedMessage)
}

/**
 * @param {Record<string, string[]>} errors
 * @param {string} field
 * @param {string} message
 * @param {string} [rule]
 * @returns {void}
 */
function addError(errors, field, message, rule) {
  const cleanField = cleanFieldName(field)
  const sanitizedMessage = formatValidationMessage(cleanField, message, rule)

  if (!errors[cleanField]) {
    errors[cleanField] = [sanitizedMessage]
    return
  }

  if (!errors[cleanField].includes(sanitizedMessage)) {
    errors[cleanField].push(sanitizedMessage)
  }
}

/**
 * @param {Record<string, any>} value
 * @returns {value is AnchorViolation}
 */
function isAnchorViolation(value) {
  return typeof value.message === 'string' && typeof value.rule === 'string'
}

/**
 * @param {*} expected
 * @returns {string}
 */
function expectedTypeLabel(expected) {
  if (expected === 'string') {
    return 'text'
  }

  if (expected === 'boolean') {
    return 'true or false'
  }

  if (expected === 'number') {
    return 'a number'
  }

  if (expected === 'json') {
    return 'valid JSON'
  }

  if (Array.isArray(expected)) {
    return 'a list'
  }

  if (isPlainObject(expected)) {
    return 'an object'
  }

  return String(expected || 'a valid value')
}

/**
 * @param {Record<string, string[]>} errors
 * @param {RttcViolation} violation
 * @param {string} [fallbackField]
 * @returns {void}
 */
function addRttcError(errors, violation, fallbackField) {
  const hops = Array.isArray(violation.hops)
    ? violation.hops.map(String).filter(Boolean)
    : []
  const field = hops.length > 0 ? hops.join('.') : fallbackField || '_error'
  const fieldLabel = humanizeField(field)

  if (violation.actual === undefined) {
    addError(errors, field, `${fieldLabel} is required`)
    return
  }

  addError(
    errors,
    field,
    `${fieldLabel} must be ${expectedTypeLabel(violation.expected)}`
  )
}

/**
 * @param {Record<string, string[]>} errors
 * @param {string} field
 * @param {*} value
 * @returns {void}
 */
function addErrorValue(errors, field, value) {
  if (Array.isArray(value)) {
    value.forEach((entry) => addErrorValue(errors, field, entry))
    return
  }

  if (isPlainObject(value) && isAnchorViolation(value)) {
    addError(errors, field, value.message || '', value.rule)
    return
  }

  if (isPlainObject(value) && Array.isArray(value.hops)) {
    addRttcError(errors, /** @type {RttcViolation} */ (value), field)
    return
  }

  addError(errors, field, String(value))
}

/**
 * @param {Record<string, string|string[]|any>} errorsObject
 * @returns {Record<string, string[]>}
 */
function humanizeErrorsObject(errorsObject) {
  /** @type {Record<string, string[]>} */
  const errors = {}

  Object.keys(errorsObject).forEach((field) => {
    addErrorValue(errors, field, errorsObject[field])
  })

  return errors
}

/**
 * @param {Record<string, string[]>} errors
 * @param {Record<string, any>} problem
 * @returns {void}
 */
function addObjectProblem(errors, problem) {
  if (typeof problem.field === 'string') {
    const value =
      problem.messages !== undefined ? problem.messages : problem.message

    if (value !== undefined) {
      addErrorValue(errors, problem.field, value)
    }

    return
  }

  if (isAnchorViolation(problem)) {
    addError(errors, '_error', problem.message || '', problem.rule)
    return
  }

  if (Array.isArray(problem.hops)) {
    addRttcError(errors, /** @type {RttcViolation} */ (problem))
    return
  }

  Object.keys(problem).forEach((field) => {
    addErrorValue(errors, field, problem[field])
  })
}

/**
 * @param {Record<string, string[]>} errors
 * @param {Array<RttcViolation>} rttcErrors
 * @returns {void}
 */
function addRttcErrors(errors, rttcErrors) {
  rttcErrors.forEach((violation) => addRttcError(errors, violation))
}

/**
 * @param {BadRequestData|Record<string, any>|Error|undefined} optionalData
 * @returns {Record<string, string[]>}
 */
function humanizeValidationErrors(optionalData) {
  const data = /** @type {Record<string, any>|undefined} */ (optionalData)

  if (!data) {
    return {}
  }

  if (Array.isArray(data.errors)) {
    /** @type {Record<string, string[]>} */
    const errors = {}
    addRttcErrors(errors, data.errors)

    if (Object.keys(errors).length > 0) {
      return errors
    }
  }

  if (isPlainObject(data.errors)) {
    return humanizeErrorsObject(data.errors)
  }

  if (!Array.isArray(data.problems)) {
    return {}
  }

  /** @type {Record<string, string[]>} */
  const errors = {}

  data.problems.forEach((problem) => {
    if (isPlainObject(problem)) {
      addObjectProblem(errors, problem)
      return
    }

    parseStringProblem(String(problem)).forEach((parsed) => {
      parsed.messages.forEach((message) => {
        addError(errors, parsed.field, message, parsed.rule)
      })
    })
  })

  return errors
}

module.exports = humanizeValidationErrors
