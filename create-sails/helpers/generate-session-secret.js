import crypto from 'crypto'

export function generateSessionSecret() {
  // Now bake up a session secret to inject into our `config/session.js` file.

  // Combine random and case-specific factors into a base string
  // (creation date, random number, and Node.js version string)
  let baseStringToHash = ''
  baseStringToHash += Date.now()
  baseStringToHash += crypto.randomBytes(64).toString('hex')
  baseStringToHash += process.version

  // Now cook up some hash using the base string.
  // > This will be used as the session secret we inject into the `config/session.js` file.
  return crypto.createHash('md5').update(baseStringToHash).digest('hex')
}
