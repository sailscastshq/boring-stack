/**
 * Shared JSDoc typedefs for inertia-sails.
 *
 * These keep editor type-checking useful without turning the package into
 * TypeScript. The shapes intentionally stay permissive because Sails request,
 * response, and hook objects are extended by applications and other hooks.
 *
 * @typedef {Record<string, any>} InertiaProps
 *
 * @typedef {Object} SailsLike
 * @property {Record<string, any>} config
 * @property {{ info?: (...args: any[]) => void, warn?: (...args: any[]) => void, error?: (...args: any[]) => void }} [log]
 * @property {Record<string, any>} [inertia]
 * @property {{ bind?: (...args: any[]) => any }} [router]
 * @property {(event: string, callback: (...args: any[]) => any) => any} [on]
 *
 * @typedef {Object} InertiaRequest
 * @property {SailsLike} _sails
 * @property {string} [method]
 * @property {string} [url]
 * @property {string} [originalUrl]
 * @property {Record<string, any>} [query]
 * @property {Record<string, any>} [headers]
 * @property {Record<string, any>} [session]
 * @property {boolean} [isSocket]
 * @property {(name: string) => any} get
 * @property {(name: string) => any} [header]
 * @property {(key: string, value?: any) => any[]} [flash]
 *
 * @typedef {Object} InertiaResponse
 * @property {Record<string, any>} [headers]
 * @property {(name: string, value: any) => InertiaResponse} [set]
 * @property {(code: number) => InertiaResponse} [status]
 * @property {(code: number) => any} [sendStatus]
 * @property {(body?: any) => any} [send]
 * @property {(body: any) => any} [json]
 * @property {(...args: any[]) => any} [redirect]
 * @property {(view: string, data?: any, callback?: (err: Error | null, html: string) => any) => any} [view]
 * @property {(type: string) => InertiaResponse} [type]
 * @property {() => any} [end]
 *
 * @typedef {() => any | Promise<any>} PropCallback
 *
 * @typedef {Object} MergeOperation
 * @property {'append'|'prepend'|string} direction
 * @property {string|null} path
 * @property {string|null} matchOn
 * @property {boolean} [isDefault]
 *
 * @typedef {Object} MergeOptions
 * @property {string|Record<string, string|null>} [matchOn]
 *
 * @typedef {Object} ResolvedPageProps
 * @property {InertiaProps} props
 * @property {string[]} rescuedProps
 *
 * @typedef {Object} BadRequestData
 * @property {Array<string|Record<string, any>>} [problems]
 * @property {Record<string, string|string[]>|Array<Record<string, any>>} [errors]
 *
 * @typedef {Object} ErrorHtmlData
 * @property {number} statusCode
 * @property {string} errorName
 * @property {string} errorMessage
 * @property {string} errorStack
 * @property {string} url
 * @property {string} method
 */

module.exports = {}
