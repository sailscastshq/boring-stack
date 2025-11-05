module.exports = {
  friendlyName: 'Calculate password strength',
  description:
    'Calculate password strength score and label based on various criteria.',
  inputs: {
    password: {
      type: 'string',
      required: true,
      description: 'The plaintext password to analyze'
    }
  },
  exits: {
    success: {
      description: 'Password strength analysis',
      outputType: {
        score: 'number',
        label: 'string',
        color: 'string',
        feedback: ['string']
      }
    }
  },
  fn: async function ({ password }) {
    let score = 0
    const feedback = []

    // Length scoring (0-25 points)
    if (password.length >= 8) score += 10
    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 5
    else if (password.length < 8) feedback.push('Use at least 8 characters')

    // Character variety (0-40 points)
    if (/[a-z]/.test(password)) score += 5
    else feedback.push('Include lowercase letters')

    if (/[A-Z]/.test(password)) score += 5
    else feedback.push('Include uppercase letters')

    if (/\d/.test(password)) score += 10
    else feedback.push('Include numbers')

    if (/[^\w\s]/.test(password)) score += 20
    else feedback.push('Include special characters')

    // Pattern checks (0-35 points)
    if (!/(..).*\1/.test(password)) score += 10
    else feedback.push('Avoid repeated patterns')

    if (!/(?:abc|123|qwe|asd|zxc)/i.test(password)) score += 10
    else feedback.push('Avoid common sequences')

    if (!/^[a-zA-Z]+$/.test(password)) score += 15
    else feedback.push('Mix letters with numbers/symbols')

    // Determine label and color
    let label, color
    if (score >= 85) {
      label = 'very strong'
      color = 'success'
    } else if (score >= 70) {
      label = 'strong'
      color = 'success'
    } else if (score >= 50) {
      label = 'good'
      color = 'warning'
    } else if (score >= 30) {
      label = 'fair'
      color = 'warning'
    } else {
      label = 'weak'
      color = 'danger'
    }

    return {
      score: Math.min(score, 100),
      label,
      color,
      feedback: feedback.slice(0, 3)
    }
  }
}
