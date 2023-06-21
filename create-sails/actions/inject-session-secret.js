import fs from 'fs'
import path from 'path'
import { generateSessionSecret } from '../helpers/security.js'

export default function injectSessionSecret(root) {
  const sessionConfigPath = path.resolve(root, 'config/session.js')
  const sessionConfigContent = fs.readFileSync(sessionConfigPath, 'utf8')
  fs.writeFileSync(
    sessionConfigPath,
    sessionConfigContent.replace('$secret', generateSessionSecret())
  )
}
