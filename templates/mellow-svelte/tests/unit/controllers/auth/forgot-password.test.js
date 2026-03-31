const test = require('node:test')
const assert = require('node:assert/strict')

const forgotPassword = require('../../../../api/controllers/auth/forgot-password')

function restoreGlobal(name, value) {
  if (value === undefined) {
    delete global[name]
    return
  }

  global[name] = value
}

test(
  'forgot password checks the submitted email instead of the session email',
  async () => {
    const originalUser = global.User
    const originalSails = global.sails
    let countCriteria

    global.User = {
      count: async criteria => {
        countCriteria = criteria
        return 0
      }
    }

    global.sails = {}

    try {
      const result = await forgotPassword.fn.call(
        {
          req: {
            session: {
              userEmail: 'stale@example.com'
            }
          }
        },
        { email: 'fresh@example.com' }
      )

      assert.deepStrictEqual(countCriteria, { email: 'fresh@example.com' })
      assert.strictEqual(result, '/check-email')
    } finally {
      restoreGlobal('User', originalUser)
      restoreGlobal('sails', originalSails)
    }
  }
)
