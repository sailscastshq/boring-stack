const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const inertiaPlugin = /** @type {any} */ (require('..'))
const { applyInertiaConfig, normalizeOptions, pluginInertia } = inertiaPlugin
const { transformPageResolution } = require('../lib/page-resolution')

describe('transformPageResolution', function () {
  it('replaces Vue pages shorthand with a resolver', function () {
    const code = `
      import { createInertiaApp } from '@inertiajs/vue3'

      createInertiaApp({
        pages: './pages',
        setup() {}
      })
    `

    const transformed = transformPageResolution(code, '/app/assets/js/app.js')

    assert.match(transformed, /resolve: async \(name, page\) =>/)
    assert.match(
      transformed,
      /require\.context\("\.\/pages", true, \/\\\.\(vue\)\$\/, 'lazy'\)/
    )
    assert.match(transformed, /const module = await pages\(pagePath\)/)
    assert.match(transformed, /return module\.default \?\? module/)
    assert.doesNotMatch(transformed, /\bpages\s*:/)
  })

  it('returns Svelte modules directly', function () {
    const code = `
      import { createInertiaApp } from '@inertiajs/svelte'

      createInertiaApp({
        pages: './pages',
        setup() {}
      })
    `

    const transformed = transformPageResolution(code, '/app/assets/js/app.js')

    assert.match(
      transformed,
      /require\.context\("\.\/pages", true, \/\\\.\(svelte\)\$\/, 'lazy'\)/
    )
    assert.match(transformed, /return module\s+\}/)
    assert.doesNotMatch(transformed, /return module\.default/)
  })

  it('supports eager page loading with lazy: false', function () {
    const code = `
      import { createInertiaApp } from '@inertiajs/vue3'

      createInertiaApp({
        pages: {
          path: './pages',
          lazy: false
        },
        setup() {}
      })
    `

    const transformed = transformPageResolution(code, '/app/assets/js/app.js')

    assert.match(transformed, /resolve: \(name, page\) =>/)
    assert.match(
      transformed,
      /require\.context\("\.\/pages", true, \/\\\.\(vue\)\$\/\)/
    )
    assert.doesNotMatch(transformed, /'lazy'/)
    assert.match(transformed, /const module = pages\(pagePath\)/)
  })

  it('supports custom paths, extensions, and name transforms', function () {
    const code = `
      import { createInertiaApp } from '@inertiajs/react'

      createInertiaApp({
        pages: {
          path: './screens',
          extension: ['.jsx', '.tsx'],
          transform: (name, page) => page.component || name
        },
        setup() {}
      })
    `

    const transformed = transformPageResolution(code, '/app/assets/js/app.js')

    assert.match(
      transformed,
      /require\.context\("\.\/screens", true, \/\\\.\(jsx\|tsx\)\$\/, 'lazy'\)/
    )
    assert.match(
      transformed,
      /const resolvedName = \(\(name, page\) => page\.component \|\| name\)\(name, page\)/
    )
  })

  it('injects a default resolver when createInertiaApp has no resolver', function () {
    const code = `
      import { createInertiaApp } from '@inertiajs/react'

      createInertiaApp({
        setup() {}
      })
    `

    const transformed = transformPageResolution(code, '/app/assets/js/app.js')

    assert.match(transformed, /resolve: async \(name, page\) =>/)
    assert.match(
      transformed,
      /require\.context\("\.\/pages", true, \/\\\.\(tsx\|jsx\)\$\/, 'lazy'\)/
    )
  })

  it('injects options when createInertiaApp is called without arguments', function () {
    const code = `
      import { createInertiaApp } from '@inertiajs/vue3'

      createInertiaApp()
    `

    const transformed = transformPageResolution(code, '/app/assets/js/app.js')

    assert.match(transformed, /createInertiaApp\(\{ resolve:/)
  })

  it('leaves existing explicit resolve functions alone', function () {
    const code = `
      import { createInertiaApp } from '@inertiajs/react'

      createInertiaApp({
        resolve: (name) => require(\`./pages/\${name}\`),
        setup() {}
      })
    `

    assert.equal(transformPageResolution(code, '/app/assets/js/app.js'), code)
  })

  it('can be disabled', function () {
    const code = `
      import { createInertiaApp } from '@inertiajs/react'

      createInertiaApp({
        pages: './pages',
        setup() {}
      })
    `

    assert.equal(
      transformPageResolution(code, '/app/assets/js/app.js', {
        enabled: false
      }),
      code
    )
  })
})

describe('pluginInertia', function () {
  it('auto-detects the SSR entry by default', function () {
    const options = normalizeOptions()

    assert.equal(options.ssr, 'auto')
  })

  it('stubs the optional axios adapter by default', function () {
    const config = applyInertiaConfig(
      {},
      { stubAxios: true, pages: true, ssr: false },
      '/app',
      () => {
        throw new Error('missing')
      }
    )

    assert.equal(config.resolve.alias.axios, false)
  })

  it('does not stub axios when the app has installed it', function () {
    const config = applyInertiaConfig(
      {},
      { stubAxios: true, pages: true, ssr: false },
      '/app',
      () => '/app/node_modules/axios/index.js'
    )

    assert.equal(config.resolve, undefined)
  })

  it('keeps axios resolvable when requested', function () {
    const config = applyInertiaConfig(
      {},
      { stubAxios: false, pages: true, ssr: false },
      '/app'
    )

    assert.equal(config.resolve, undefined)
  })

  it('adds a node environment when SSR is configured', function () {
    const config = applyInertiaConfig(
      {
        source: {
          entry: {
            app: '/app/assets/js/app.js'
          }
        },
        output: {
          manifest: true,
          copy: [{ from: '/app/assets' }]
        }
      },
      {
        stubAxios: false,
        pages: true,
        ssr: {
          entry: 'assets/js/ssr.js',
          name: 'inertia',
          outDir: '.tmp/ssr',
          filename: '[name].mjs',
          autoExternal: true
        }
      },
      '/app'
    )

    assert.equal(config.environments.node.output.target, 'node')
    assert.equal(config.environments.node.output.autoExternal, true)
    assert.equal(config.environments.node.output.manifest, false)
    assert.equal(config.environments.node.output.emitAssets, false)
    assert.deepEqual(config.environments.node.output.copy, [])
    assert.equal(
      config.environments.node.source.entry.inertia,
      '/app/assets/js/ssr.js'
    )
    assert.deepEqual(config.environments.node.source.entry, {
      inertia: '/app/assets/js/ssr.js'
    })
    assert.deepEqual(config.environments.web.source.entry, {
      app: '/app/assets/js/app.js'
    })
    assert.deepEqual(config.environments.web.output.copy, [
      { from: '/app/assets' }
    ])
    assert.equal(config.source, undefined)
    assert.equal(config.output.copy, undefined)
  })

  it('adds a node environment when the conventional SSR entry exists', function () {
    const config = applyInertiaConfig(
      {
        source: {
          entry: {
            app: '/app/assets/js/app.js'
          }
        }
      },
      {
        stubAxios: false,
        pages: true,
        ssr: 'auto'
      },
      '/app',
      undefined,
      /**
       * @param {string} file
       */
      (file) => file === '/app/assets/js/ssr.js'
    )

    assert.equal(
      config.environments.node.source.entry.inertia,
      '/app/assets/js/ssr.js'
    )
    assert.equal(config.environments.node.output.filename.js, '[name].mjs')
    assert.equal(config.dev.writeToDisk('/app/.tmp/ssr/inertia.mjs'), true)
  })

  it('skips the node environment when auto SSR has no entry', function () {
    const config = applyInertiaConfig(
      {
        source: {
          entry: {
            app: '/app/assets/js/app.js'
          }
        }
      },
      {
        stubAxios: false,
        pages: true,
        ssr: 'auto'
      },
      '/app',
      undefined,
      /**
       * @returns {boolean}
       */
      () => false
    )

    assert.equal(config.environments, undefined)
    assert.deepEqual(config.source.entry, {
      app: '/app/assets/js/app.js'
    })
  })

  it('supports true as the default SSR build configuration', function () {
    const options = normalizeOptions({ ssr: true })

    assert.deepEqual(options.ssr, {
      entry: 'assets/js/ssr.js',
      name: 'inertia',
      outDir: '.tmp/ssr',
      filename: '[name].mjs',
      autoExternal: true
    })
  })

  it('writes SSR output to disk while preserving existing write rules', function () {
    const config = applyInertiaConfig(
      {
        dev: {
          /**
           * @param {string} file
           */
          writeToDisk(file) {
            return file.endsWith('manifest.json')
          }
        }
      },
      {
        stubAxios: false,
        pages: true,
        ssr: {
          entry: 'assets/js/ssr.js',
          name: 'inertia',
          outDir: '.tmp/ssr',
          filename: '[name].mjs',
          autoExternal: true
        }
      },
      '/app'
    )

    assert.equal(config.dev.writeToDisk('/app/.tmp/ssr/inertia.mjs'), true)
    assert.equal(config.dev.writeToDisk('/app/.tmp/public/manifest.json'), true)
    assert.equal(config.dev.writeToDisk('/app/.tmp/public/js/app.js'), false)
  })

  it('registers Rsbuild hooks', function () {
    /** @type {any[]} */
    const hooks = []
    /** @type {Map<string, any>} */
    const exposed = new Map()

    pluginInertia().setup({
      context: { rootPath: '/app' },
      /**
       * @param {string} id
       * @param {any} api
       */
      expose(id, api) {
        exposed.set(id, api)
      },
      /**
       * @param {any} handler
       */
      modifyRsbuildConfig(handler) {
        hooks.push(['modifyRsbuildConfig', handler])
      },
      /**
       * @param {any} descriptor
       * @param {any} handler
       */
      transform(descriptor, handler) {
        hooks.push(['transform', descriptor, handler])
      }
    })

    assert.equal(exposed.has('rsbuild-plugin-inertia'), true)
    assert.equal(hooks.length, 2)
    assert.equal(hooks[0][0], 'modifyRsbuildConfig')
    assert.equal(hooks[1][0], 'transform')
  })
})
