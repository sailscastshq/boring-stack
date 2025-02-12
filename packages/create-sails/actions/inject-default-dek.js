import fs from 'fs'
import path from 'path'

import { generateDefaultDEK } from '../helpers/security.js'

export default function injectDefaultDek(root) {
  const modelsConfigPath = path.resolve(root, 'config/models.js')
  const modelsConfigContent = fs.readFileSync(modelsConfigPath, 'utf8')
  fs.writeFileSync(
    modelsConfigPath,
    modelsConfigContent.replace('$defaultDEK', generateDefaultDEK())
  )
}
