const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { applyInertiaConfig, pluginInertia } = require('..')
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
  it('stubs the optional axios adapter by default', function () {
    const config = applyInertiaConfig(
      {},
      { stubAxios: true, pages: true, ssr: false },
      '/app'
    )

    assert.equal(config.resolve.alias.axios, false)
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
      {},
      {
        stubAxios: false,
        pages: true,
        ssr: {
          entry: 'assets/js/ssr.js',
          name: 'inertia',
          outDir: '.tmp/ssr',
          autoExternal: true
        }
      },
      '/app'
    )

    assert.equal(config.environments.node.output.target, 'node')
    assert.equal(config.environments.node.output.autoExternal, true)
    assert.equal(
      config.environments.node.source.entry.inertia,
      '/app/assets/js/ssr.js'
    )
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
