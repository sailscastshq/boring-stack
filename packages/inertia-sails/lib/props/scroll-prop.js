const MergeProp = require('./merge-prop')

/**
 * @typedef {import('../types').PropCallback} PropCallback
 *
 * @typedef {Object} ScrollPropOptions
 * @property {number} [page=0] - Current page index (0-based for Waterline)
 * @property {number} [perPage=10] - Items per page
 * @property {number} [total=0] - Total number of items
 * @property {string} [pageName='page'] - Query parameter name for pagination
 * @property {string} [wrapper='data'] - Key to wrap the data in
 * @property {string|null} [matchOn] - Optional field used to match items when merging
 */

/**
 * ScrollProp - Configures paginated data for infinite scrolling.
 *
 * Wraps paginated data with proper merge behavior and normalizes
 * Waterline pagination metadata for Inertia's <InfiniteScroll> component.
 *
 * @example
 * // Basic usage with Waterline .paginate()
 * const users = await User.find().paginate(page, perPage)
 * const total = await User.count()
 *
 * return {
 *   page: 'users/index',
 *   props: {
 *     users: sails.inertia.scroll(() => users, { page, perPage, total })
 *   }
 * }
 */
class ScrollProp extends MergeProp {
  /**
   * @param {PropCallback} callback - Callback returning the paginated data array
   * @param {ScrollPropOptions} [options] - Pagination options
   */
  constructor(callback, options = {}) {
    const {
      page = 0,
      perPage = 10,
      total = 0,
      pageName = 'page',
      wrapper = 'data',
      matchOn = null
    } = options

    // Calculate pagination metadata
    // Waterline uses 0-based pages, but Inertia expects 1-based for display
    const totalPages = Math.ceil(total / perPage) || 1
    const currentPage = page + 1 // Convert to 1-based for Inertia
    const hasNextPage = currentPage < totalPages
    const hasPreviousPage = currentPage > 1

    // Wrap the callback to return structured data with metadata
    /** @type {() => Promise<any>} */
    const wrappedCallback = async () => {
      const data = typeof callback === 'function' ? await callback() : callback

      return {
        [wrapper]: data,
        meta: {
          current_page: currentPage,
          per_page: perPage,
          total: total,
          last_page: totalPages,
          // Next/previous page numbers (1-based) or null
          next_page: hasNextPage ? currentPage + 1 : null,
          prev_page: hasPreviousPage ? currentPage - 1 : null,
          // For URL building
          page_name: pageName
        }
      }
    }

    super(wrappedCallback)

    // InfiniteScroll uses request headers to decide append vs prepend.
    /** @type {import('../types').MergeOperation[]} */
    this.mergeOperations = []

    // Store metadata for potential access
    /** @type {number} */
    this.page = page
    /** @type {number} */
    this.perPage = perPage
    /** @type {number} */
    this.total = total
    /** @type {string} */
    this.pageName = pageName
    /** @type {string} */
    this.wrapper = wrapper
    /** @type {string|null} */
    this.matchOnPath = matchOn
    /** @type {number} */
    this.totalPages = totalPages
    /** @type {number} */
    this.currentPage = currentPage
  }
}

module.exports = ScrollProp
