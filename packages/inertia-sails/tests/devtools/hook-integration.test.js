const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('events')
const os = require('os')
const path = require('path')
const defineInertiaHook = require('../..')

describe('DevTools hook integration', function () {
  it('binds the DevTools entry route before the generic Inertia middleware', async function () {
    const emitter = new EventEmitter()
    /** @type {Array<{address: string, handler: any}>} */
    const bindings = []
    /** @type {any} */
    const sails = {
      config: {
        appPath: path.join(os.tmpdir(), 'inertia-sails-hook-test'),
        environment: 'development',
        inertia: {
          history: { encrypt: false },
          devtools: {}
        }
      },
      log: { warn() {} },
      router: {
        bind(/** @type {string} */ address, /** @type {any} */ handler) {
          bindings.push({ address, handler })
        }
      },
      on: emitter.on.bind(emitter)
    }
    const hook = defineInertiaHook(sails)

    await hook.initialize()
    emitter.emit('router:before')

    assert.equal(bindings[0].address, 'GET /_inertia/devtools/entries/:id')
    assert.equal(typeof bindings[0].handler, 'function')
    assert.equal(sails.inertia.devtools.config.enabled, true)
  })

  it('defaults DevTools off outside development', async function () {
    const emitter = new EventEmitter()
    /** @type {any} */
    const sails = {
      config: {
        appPath: path.join(os.tmpdir(), 'inertia-sails-hook-test'),
        environment: 'production',
        inertia: {
          history: { encrypt: false },
          devtools: {}
        }
      },
      log: { warn() {} },
      router: { bind() {} },
      on: emitter.on.bind(emitter)
    }
    const hook = defineInertiaHook(sails)

    await hook.initialize()

    assert.equal(sails.inertia.devtools.config.enabled, false)
  })
})
