import { text } from '@clack/prompts'

import {
  toValidPackageName,
  isValidPackageName
} from '../helpers/package-name.js'

export default async function projectName(projectNameFromArgv) {
  let projectName = projectNameFromArgv
  if (!projectName) {
    projectName = await text({
      message: 'What is the name of your new project?',
      placeholder: 'boring-app',
      defaultValue: 'boring-app'
    })

    if (isCancel(projectName)) {
      cancel('Scaffoling canceled.')
      return process.exit(0)
    }
  }

  if (!isValidPackageName(projectName)) {
    projectName = toValidPackageName(projectName)
  }

  return projectName
}
