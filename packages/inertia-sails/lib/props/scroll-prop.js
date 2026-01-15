const MergeProp = require('./merge-prop')

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
   * @param {Function} callback - Callback returning the paginated data array
   * @param {Object} [options] - Pagination options
   * @param {number} [options.page=0] - Current page index (0-based for Waterline)
   * @param {number} [options.perPage=10] - Items per page
   * @param {number} [options.total=0] - Total number of items
   * @param {string} [options.pageName='page'] - Query parameter name for pagination
   * @param {string} [options.wrapper='data'] - Key to wrap the data in
   */
  constructor(callback, options = {}) {
    const {
      page = 0,
      perPage = 10,
      total = 0,
      pageName = 'page',
      wrapper = 'data'
    } = options

    // Calculate pagination metadata
    // Waterline uses 0-based pages, but Inertia expects 1-based for display
    const totalPages = Math.ceil(total / perPage) || 1
    const currentPage = page + 1 // Convert to 1-based for Inertia
    const hasNextPage = currentPage < totalPages
    const hasPreviousPage = currentPage > 1

    // Wrap the callback to return structured data with metadata
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

    // Store metadata for potential access
    this.page = page
    this.perPage = perPage
    this.total = total
    this.pageName = pageName
    this.wrapper = wrapper
    this.totalPages = totalPages
    this.currentPage = currentPage
  }
}

module.exports = ScrollProp
