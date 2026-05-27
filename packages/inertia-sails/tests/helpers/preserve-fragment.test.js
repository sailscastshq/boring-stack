const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const defineInertiaHook = require('../..')
const requestContext = require('../../lib/helpers/request-context')

/**
 * @param {Record<string, any>} object
 * @param {string} key
 * @returns {boolean}
 */
function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

function createHook() {
  /** @type {Record<string, any>} */
  const sails = {
    config: {
      inertia: {
        history: {
          encrypt: false
        }
      }
    },
    log: {
      warn() {}
    }
  }
  const hook = defineInertiaHook(/** @type {any} */ (sails))
  sails.inertia = hook
  return hook
}

/**
 * @param {Record<string, any>} req
 * @param {() => Promise<any>} callback
 * @returns {Promise<any>}
 */
function runWithContext(req, callback) {
  return new Promise((resolve, reject) => {
    requestContext.run(
      /** @type {any} */ (req),
      /** @type {any} */ ({}),
      async () => {
        try {
          resolve(await callback())
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

describe('preserveFragment', function () {
  it('does not preserve fragments unless explicitly requested', async function () {
    const hook = createHook()
    const req = { session: {} }

    await runWithContext(req, async () => {
      assert.equal(requestContext.getPreserveFragment(), false)
      assert.equal(hook.consumePreserveFragment(req), false)
      assert.equal(hasOwn(req.session, '_inertiaPreserveFragment'), false)
    })
  })

  it('stores preserveFragment in request context and session', async function () {
    const hook = createHook()
    /** @type {{ session: Record<string, any> }} */
    const req = { session: {} }

    await runWithContext(req, async () => {
      hook.preserveFragment()

      assert.equal(requestContext.getPreserveFragment(), true)
      assert.equal(req.session._inertiaPreserveFragment, true)
    })
  })

  it('keeps the chainable helper shape when passed a boolean', async function () {
    const hook = createHook()
    /** @type {{ session: Record<string, any> }} */
    const req = { session: {} }

    await runWithContext(req, async () => {
      assert.equal(hook.preserveFragment(true), hook)
    })
  })

  it('consumes and clears session-backed preserveFragment metadata', async function () {
    const hook = createHook()
    const req = {
      session: {
        _inertiaPreserveFragment: true
      }
    }

    assert.equal(hook.consumePreserveFragment(req), true)
    assert.equal(hasOwn(req.session, '_inertiaPreserveFragment'), false)
  })

  it('can clear preserveFragment before it is consumed', async function () {
    const hook = createHook()
    const req = {
      session: {
        _inertiaPreserveFragment: true
      }
    }

    await runWithContext(req, async () => {
      hook.preserveFragment(false)

      assert.equal(requestContext.getPreserveFragment(), false)
      assert.equal(hasOwn(req.session, '_inertiaPreserveFragment'), false)
      assert.equal(hook.consumePreserveFragment(req), false)
    })
  })
})
