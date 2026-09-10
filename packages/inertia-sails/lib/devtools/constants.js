/**
 * Inertia DevTools protocol constants.
 *
 * @see https://inertiajs.com/docs/v3/advanced/devtools-protocol
 */

const HEADERS = Object.freeze({
  ID: 'X-Inertia-Devtools-Id',
  PARENT_OUT: 'X-Inertia-Devtools-Parent-Out',
  PARENT: 'X-Inertia-Devtools-Parent',
  TAB: 'X-Inertia-Devtools-Tab',
  VISIT: 'X-Inertia-Devtools-Visit',
  DEFERRED: 'X-Inertia-Devtools-Deferred',
  POLL: 'X-Inertia-Devtools-Poll'
})

const REQUEST_TYPES = Object.freeze({
  NAVIGATE: 'navigate',
  PARTIAL: 'partial',
  DEFERRED: 'deferred',
  POLL: 'poll',
  PREFETCH: 'prefetch',
  INITIAL: 'initial',
  HTTP: 'http',
  PRECOGNITION: 'precognition'
})

const PROP_TYPES = Object.freeze({
  ALWAYS: 'always',
  DEFER: 'defer',
  OPTIONAL: 'optional',
  MERGE: 'merge',
  SCROLL: 'scroll',
  ONCE: 'once'
})

const BODY_OMISSION_REASONS = Object.freeze({
  NON_INERTIA_RESPONSE: 'non-inertia-response',
  NON_INERTIA_REQUEST: 'non-inertia-request',
  NON_TEXTUAL: 'non-textual',
  STREAMED: 'streamed',
  TOO_LARGE: 'too-large',
  UNSERIALIZABLE: 'unserializable',
  BINARY: 'binary'
})

const ENTRY_ROUTE = '/_inertia/devtools/entries/:id'

module.exports = {
  BODY_OMISSION_REASONS,
  ENTRY_ROUTE,
  HEADERS,
  PROP_TYPES,
  REQUEST_TYPES
}
