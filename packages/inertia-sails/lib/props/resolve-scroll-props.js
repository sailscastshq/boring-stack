const ScrollProp = require('./scroll-prop')

/**
 * @typedef {import('../types').InertiaProps} InertiaProps
 *
 * @typedef {Object} ScrollPropsMetadata
 * @property {Record<string, {
 *   pageName: string,
 *   currentPage: number,
 *   previousPage: number|null,
 *   nextPage: number|null,
 *   reset: boolean
 * }>} [scrollProps]
 */

/**
 * Resolve scroll props metadata for the page response.
 * Extracts ScrollProp instances and builds the scrollProps object
 * expected by Inertia's <InfiniteScroll> component.
 *
 * @param {InertiaProps} pageProps - The page props
 * @returns {ScrollPropsMetadata} - Object with scrollProps if any exist
 *
 * @example
 * // Input props with ScrollProp instance:
 * { invoices: ScrollProp { pageName: 'page', currentPage: 1, ... } }
 *
 * // Output:
 * {
 *   scrollProps: {
 *     invoices: {
 *       pageName: 'page',
 *       currentPage: 1,
 *       previousPage: null,
 *       nextPage: 2,
 *       reset: false
 *     }
 *   }
 * }
 */
module.exports = function resolveScrollProps(pageProps) {
  /** @type {NonNullable<ScrollPropsMetadata['scrollProps']>} */
  const scrollProps = {}

  for (const [key, value] of Object.entries(pageProps || {})) {
    if (value instanceof ScrollProp) {
      // Build scroll prop metadata in the format Inertia.js expects
      const hasNextPage = value.currentPage < value.totalPages
      const hasPreviousPage = value.currentPage > 1

      scrollProps[key] = {
        pageName: value.pageName,
        currentPage: value.currentPage,
        previousPage: hasPreviousPage ? value.currentPage - 1 : null,
        nextPage: hasNextPage ? value.currentPage + 1 : null,
        reset: false
      }
    }
  }

  if (Object.keys(scrollProps).length === 0) {
    return {}
  }

  return { scrollProps }
}
