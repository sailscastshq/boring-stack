const { Sails } = require(process.cwd() + '/node_modules/sails')
const crypto = require('node:crypto')
const path = require('node:path')
const os = require('node:os')
const fs = require('node:fs')
const database = path.join(
  os.tmpdir(),
  `boring-template-smoke-${process.pid}.sqlite`
)
const app = new Sails()
let failed = false
for (const stream of [process.stdout, process.stderr]) {
  const write = stream.write.bind(stream)
  stream.write = (chunk, ...args) => {
    if (
      String(chunk).includes('Build failed') ||
      String(chunk).includes('SSR failed; falling back')
    )
      failed = true
    return write(chunk, ...args)
  }
}
app.lift(
  {
    environment: 'production',
    port: 0,
    host: '127.0.0.1',
    hooks: { grunt: false },
    models: {
      migrate: 'safe',
      dataEncryptionKeys: { default: crypto.randomBytes(32).toString('base64') }
    },
    datastores: { default: { adapter: 'sails-sqlite', url: database } },
    session: {
      secret: crypto.randomBytes(32).toString('hex'),
      cookie: { secure: false }
    },
    mail: { default: 'log', mailers: { log: { transport: 'log' } } },
    log: { level: 'warn' }
  },
  async (error) => {
    if (error) {
      console.error(error)
      process.exit(1)
    }
    try {
      const port = app.hooks.http.server.address().port
      for (const route of ['/', '/login']) {
        const response = await fetch(`http://127.0.0.1:${port}${route}`)
        const html = await response.text()
        if (response.status !== 200 || !html.includes('<html'))
          throw Error(route + ' did not render HTML: ' + response.status)
        const ssr = app.config.inertia.ssr
        if (
          route === '/login' &&
          (ssr === true || ssr?.enabled) &&
          !html.includes('<form')
        )
          throw Error('SSR login response did not contain the rendered form')
        const assets = [
          ...html.matchAll(/(?:src|href)="([^\"]+\.(?:js|css)(?:\?[^\"]*)?)"/g)
        ]
          .map((m) => m[1])
          .filter((s) => s.startsWith('/'))
        if (!assets.length) throw Error('No built assets on ' + route)
        for (const asset of assets) {
          const res = await fetch(`http://127.0.0.1:${port}${asset}`)
          if (res.status !== 200) throw Error('Missing asset ' + asset)
        }
        console.log(
          'PRODUCTION_OK',
          path.basename(process.cwd()),
          route,
          assets.length
        )
      }
      if (failed) throw Error('Build failure was logged')
    } catch (e) {
      console.error(e)
      failed = true
    }
    await new Promise((resolve) => app.lower(resolve))
    for (const suffix of ['', '-wal', '-shm'])
      fs.rmSync(database + suffix, { force: true })
    process.exit(failed ? 1 : 0)
  }
)
