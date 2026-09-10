const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const root = path.resolve(__dirname, '../../..')
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name)
    return entry.isDirectory() ? files(target) : [target]
  })
}
test('UI stays application-owned and generic glyphs come from Klean', () => {
  const pkg = require(path.join(root, 'package.json'))
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies }
  for (const name of Object.keys(dependencies)) {
    assert.ok(
      !/^(klean-ui|primevue|primereact|primeicons|floating-vue|tailwindcss-primeui|@radix-ui\/|@base-ui\/)/.test(
        name
      ),
      `Unexpected UI runtime: ${name}`
    )
  }
  const artwork = require(path.join(root, 'ui-artwork.json'))
  const actual = {}
  for (const file of files(path.join(root, 'assets'))) {
    if (!/\.(js|jsx|vue|svelte|css)$/.test(file)) continue
    const source = fs.readFileSync(file, 'utf8')
    assert.ok(
      !/(?:from\s*['"](?:primevue|primereact|floating-vue)|@\/volt\/|primeicons\/|\bpi pi-|\bp-button(?:-|\b))/.test(
        source
      ),
      `Legacy UI reference: ${file}`
    )
    if (file.includes(`${path.sep}ui${path.sep}`)) continue
    const svgs = [...source.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map((match) =>
      createHash('sha256').update(match[0].replace(/\s/g, '')).digest('hex')
    )
    if (svgs.length)
      actual[path.relative(root, file).split(path.sep).join('/')] = svgs
  }
  assert.deepEqual(
    actual,
    Object.fromEntries(
      Object.entries(artwork).map(([file, entry]) => [file, entry.sha256])
    ),
    'Review and document intentional artwork; use Klean Icons for generic UI glyphs.'
  )
})
