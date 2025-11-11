module.exports = {
  friendlyName: 'Format relative date',
  description: 'Convert a timestamp to a human-readable relative time string.',
  inputs: {
    timestamp: {
      type: 'number',
      required: true,
      description: 'The timestamp (epoch ms) to format'
    }
  },
  exits: {
    success: {
      description: 'Formatted relative date string',
      outputType: 'string'
    }
  },
  fn: async function ({ timestamp }) {
    if (!timestamp) return 'Never'

    const now = Date.now()
    const diffMs = now - timestamp
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffSeconds < 60) return 'Just now'
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    if (diffWeeks < 4)
      return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`
  }
}
