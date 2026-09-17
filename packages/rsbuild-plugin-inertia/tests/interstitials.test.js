const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const inertiaPlugin = /** @type {any} */ (require('..'))
const {
  RUNTIME_PATH,
  injectInterstitialRuntime
} = require('../lib/interstitials')
const {
  STORAGE_KEY,
  LOOP_WINDOW_MS,
  shouldNavigate,
  resolveTarget,
  claimNavigation,
  installInterstitialNavigation
} = require('../runtime/interstitials')

const cloudflareChallenge = {
  status: 403,
  headers: {
    'content-type': 'text/html; charset=UTF-8',
    'cf-mitigated': 'challenge'
  }
}

function createStorage() {
  /** @type {Map<string, string>} */
  const values = new Map()

  return {
    values,
    /** @param {string} key */
    getItem(key) {
      return values.has(key) ? /** @type {string} */ (values.get(key)) : null
    },
    /**
     * @param {string} key
     * @param {string} value
     */
    setItem(key, value) {
      values.set(key, value)
    },
    /** @param {string} key */
    removeItem(key) {
      values.delete(key)
    }
  }
}

/**
 * @param {{ production?: boolean, storage?: any, href?: string }} [options]
 */
function createBrowser(options = {}) {
  /** @type {Map<string, Function[]>} */
  const listeners = new Map()
  /** @type {string[]} */
  const assigned = []

  const document = /** @type {any} */ ({
    /**
     * @param {string} name
     * @param {Function} listener
     */
    addEventListener(name, listener) {
      listeners.set(name, [...(listeners.get(name) || []), listener])
    }
  })

  const window = /** @type {any} */ ({
    location: {
      href: options.href || 'https://app.test/dashboard',
      /** @param {string} url */
      assign(url) {
        assigned.push(url)
      }
    }
  })

  if (options.storage === null) {
    Object.defineProperty(window, 'sessionStorage', {
      get() {
        throw new Error('SecurityError')
      }
    })
  } else {
    window.sessionStorage = options.storage || createStorage()
  }

  const installed = installInterstitialNavigation({
    document,
    window,
    production: options.production !== false,
    now: () => 1000
  })

  /**
   * @param {string} name
   * @param {any} detail
   */
  function dispatch(name, detail) {
    let defaultPrevented = false
    const event = {
      detail,
      preventDefault() {
        defaultPrevented = true
      }
    }

    for (const listener of listeners.get(name) || []) listener(event)

    return { defaultPrevented }
  }

  return {
    installed,
    window,
    assigned,
    dispatch,
    /**
     * @param {string} url
     * @param {string} [method]
     * @param {Record<string, any>} [extra]
     */
    visit(url, method = 'get', extra = {}) {
      dispatch('inertia:before', {
        visit: { url: new URL(url), method, ...extra }
      })
    },
    /** @param {any} response */
    fail(response) {
      return dispatch('inertia:httpException', { response })
    }
  }
}

describe('shouldNavigate', function () {
  it('navigates for a Cloudflare challenge in every environment', function () {
    assert.equal(
      shouldNavigate(cloudflareChallenge, { production: true }),
      true
    )
    assert.equal(
      shouldNavigate(cloudflareChallenge, { production: false }),
      true
    )
  })

  it('keeps the dialog for JSON responses', function () {
    const response = {
      status: 500,
      headers: { 'content-type': 'application/json' }
    }

    assert.equal(shouldNavigate(response, { production: true }), false)
    assert.equal(shouldNavigate(response, { production: false }), false)
  })

  it('keeps Inertia error responses away from the runtime', function () {
    const response = {
      status: 403,
      headers: { 'content-type': 'text/html', 'x-inertia': 'true' }
    }

    assert.equal(shouldNavigate(response, { production: true }), false)
  })

  it('navigates for any HTML page in production', function () {
    const response = { status: 500, headers: { 'content-type': 'text/html' } }

    assert.equal(shouldNavigate(response, { production: true }), true)
  })

  it('keeps the dialog for generic HTML errors in development', function () {
    const serverError = {
      status: 500,
      headers: { 'content-type': 'text/html' }
    }

    assert.equal(shouldNavigate(serverError, { production: false }), false)

    for (const status of [403, 429, 503]) {
      assert.equal(
        shouldNavigate(
          { status, headers: { 'content-type': 'text/html' } },
          { production: false }
        ),
        true
      )
    }
  })

  it('ignores malformed responses', function () {
    assert.equal(
      shouldNavigate(/** @type {any} */ (null), { production: true }),
      false
    )
    assert.equal(
      shouldNavigate(/** @type {any} */ ({}), { production: true }),
      false
    )
  })
})

describe('resolveTarget', function () {
  it('replays GET visits at their own URL', function () {
    assert.equal(
      resolveTarget(
        { url: 'https://app.test/pricing', method: 'get' },
        'https://app.test/dashboard'
      ),
      'https://app.test/pricing'
    )
  })

  it('reloads the current page for non-GET visits', function () {
    assert.equal(
      resolveTarget(
        { url: 'https://app.test/login', method: 'post' },
        'https://app.test/login-page'
      ),
      'https://app.test/login-page'
    )
  })

  it('reloads the current page for background requests', function () {
    assert.equal(
      resolveTarget(
        { url: 'https://app.test/?page=2', method: 'get', background: true },
        'https://app.test/'
      ),
      'https://app.test/'
    )
  })

  it('reloads the current page when no visit was tracked', function () {
    assert.equal(
      resolveTarget(null, 'https://app.test/dashboard'),
      'https://app.test/dashboard'
    )
  })
})

describe('claimNavigation', function () {
  it('refuses a repeat navigation to the same URL inside the loop window', function () {
    const storage = createStorage()

    assert.equal(claimNavigation(storage, 'https://app.test/a', 0), true)
    assert.equal(claimNavigation(storage, 'https://app.test/a', 1000), false)
    assert.equal(storage.values.has(STORAGE_KEY), false)
  })

  it('allows the same URL again after the loop window', function () {
    const storage = createStorage()

    assert.equal(claimNavigation(storage, 'https://app.test/a', 0), true)
    assert.equal(
      claimNavigation(storage, 'https://app.test/a', LOOP_WINDOW_MS),
      true
    )
  })

  it('allows a different URL inside the loop window', function () {
    const storage = createStorage()

    assert.equal(claimNavigation(storage, 'https://app.test/a', 0), true)
    assert.equal(claimNavigation(storage, 'https://app.test/b', 10), true)
  })

  it('recovers from a corrupted record', function () {
    const storage = createStorage()
    storage.setItem(STORAGE_KEY, '{nope')

    assert.equal(claimNavigation(storage, 'https://app.test/a', 0), true)
  })
})

describe('installInterstitialNavigation', function () {
  it('navigates to the visited page instead of showing the dialog', function () {
    const browser = createBrowser()

    browser.visit('https://app.test/pricing')
    const event = browser.fail(cloudflareChallenge)

    assert.equal(event.defaultPrevented, true)
    assert.deepEqual(browser.assigned, ['https://app.test/pricing'])
  })

  it('ignores prefetch visits when choosing the target', function () {
    const browser = createBrowser()

    browser.visit('https://app.test/pricing')
    browser.visit('https://app.test/hovered', 'get', { prefetch: true })
    browser.fail(cloudflareChallenge)

    assert.deepEqual(browser.assigned, ['https://app.test/pricing'])
  })

  it('reloads the current page when infinite scroll is challenged', function () {
    const browser = createBrowser({ href: 'https://app.test/' })

    browser.visit('https://app.test/?page=2', 'get', { preserveUrl: true })
    browser.fail(cloudflareChallenge)

    assert.deepEqual(browser.assigned, ['https://app.test/'])
  })

  it('reloads the current page when router.reload() is challenged', function () {
    const browser = createBrowser({ href: 'https://app.test/' })

    browser.visit('https://app.test/?tab=live', 'get', { async: true })
    browser.fail(cloudflareChallenge)

    assert.deepEqual(browser.assigned, ['https://app.test/'])
  })

  it('reloads the current page when a form submission is challenged', function () {
    const browser = createBrowser({ href: 'https://app.test/signup' })

    browser.visit('https://app.test/signup', 'post')
    browser.fail(cloudflareChallenge)

    assert.deepEqual(browser.assigned, ['https://app.test/signup'])
  })

  it('leaves JSON errors to the dialog', function () {
    const browser = createBrowser({ production: false })

    browser.visit('https://app.test/pricing')
    const event = browser.fail({
      status: 500,
      headers: { 'content-type': 'application/json' }
    })

    assert.equal(event.defaultPrevented, false)
    assert.deepEqual(browser.assigned, [])
  })

  it('cannot loop when the full page load keeps hitting the interstitial', function () {
    const storage = createStorage()
    const first = createBrowser({ storage })

    first.visit('https://app.test/dashboard')
    assert.equal(first.fail(cloudflareChallenge).defaultPrevented, true)

    // The full page load boots the app again, then a deferred props request
    // for the same page is challenged too.
    const second = createBrowser({ storage })
    second.visit('https://app.test/dashboard')
    const event = second.fail(cloudflareChallenge)

    assert.equal(event.defaultPrevented, false)
    assert.deepEqual(second.assigned, [])
  })

  it('keeps the dialog when sessionStorage is unavailable', function () {
    const browser = createBrowser({ storage: null })

    browser.visit('https://app.test/pricing')
    const event = browser.fail(cloudflareChallenge)

    assert.equal(event.defaultPrevented, false)
    assert.deepEqual(browser.assigned, [])
  })

  it('installs only once per window', function () {
    const browser = createBrowser()
    const again = installInterstitialNavigation({
      document: /** @type {any} */ ({ addEventListener() {} }),
      window: browser.window,
      production: true
    })

    assert.equal(browser.installed, true)
    assert.equal(again, false)
  })
})

describe('injectInterstitialRuntime', function () {
  const appCode = `import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'

createInertiaApp({
  setup() {}
})
`

  it('appends the runtime import to the browser module that boots Inertia', function () {
    const transformed = injectInterstitialRuntime(
      appCode,
      '/app/assets/js/app.js',
      { enabled: true, target: 'web' }
    )

    assert.equal(transformed.startsWith(appCode), true)
    assert.equal(
      transformed.slice(appCode.length),
      `import ${JSON.stringify(RUNTIME_PATH)}\n`
    )
  })

  it('does not inject into the SSR (node) build', function () {
    assert.equal(
      injectInterstitialRuntime(appCode, '/app/assets/js/ssr.js', {
        enabled: true,
        target: 'node'
      }),
      appCode
    )
  })

  it('does not inject when disabled', function () {
    assert.equal(
      injectInterstitialRuntime(appCode, '/app/assets/js/app.js', {
        enabled: false,
        target: 'web'
      }),
      appCode
    )
  })

  it('skips modules that do not boot Inertia', function () {
    const code = `import { router } from '@inertiajs/vue3'\nrouter.visit('/')\n`

    assert.equal(
      injectInterstitialRuntime(code, '/app/assets/js/other.js', {
        enabled: true,
        target: 'web'
      }),
      code
    )
  })

  it('skips dependencies', function () {
    assert.equal(
      injectInterstitialRuntime(
        appCode,
        '/app/node_modules/some-lib/index.js',
        { enabled: true, target: 'web' }
      ),
      appCode
    )
  })

  it('injects only once', function () {
    const options = { enabled: true, target: 'web' }
    const once = injectInterstitialRuntime(
      appCode,
      '/app/assets/js/app.js',
      options
    )

    assert.equal(
      injectInterstitialRuntime(once, '/app/assets/js/app.js', options),
      once
    )
  })
})

describe('pluginInertia interstitials option', function () {
  it('is enabled by default and can be opted out of', function () {
    assert.equal(inertiaPlugin.normalizeOptions().interstitials, true)
    assert.equal(
      inertiaPlugin.normalizeOptions({ interstitials: false }).interstitials,
      false
    )
  })

  /**
   * @param {any} options
   * @param {string} target
   */
  function runTransform(options, target) {
    /** @type {any} */
    let transformHandler

    inertiaPlugin.pluginInertia(options).setup({
      context: { rootPath: '/app' },
      modifyRsbuildConfig() {},
      /**
       * @param {any} _descriptor
       * @param {any} handler
       */
      transform(_descriptor, handler) {
        transformHandler = handler
      }
    })

    return transformHandler({
      code: `import { createInertiaApp } from '@inertiajs/vue3'\ncreateInertiaApp({ setup() {} })\n`,
      resourcePath: '/app/assets/js/app.js',
      environment: { config: { output: { target } } }
    })
  }

  it('injects the runtime through the transform hook for web builds', function () {
    assert.match(
      runTransform(undefined, 'web'),
      /runtime[\\/]+interstitials\.js/
    )
    assert.doesNotMatch(runTransform(undefined, 'node'), /interstitials\.js/)
    assert.doesNotMatch(
      runTransform({ interstitials: false }, 'web'),
      /interstitials\.js/
    )
  })
})
