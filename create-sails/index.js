#!/usr/bin/env node
import { intro, outro, spinner, cancel } from '@clack/prompts'
import minimist from 'minimist'
import color from 'picocolors'
import path from 'path'
import projectName from './actions/project-name.js'
import frontend from './actions/frontend.js'
import downloadProject from './actions/download-project.js'
import getCommand from './helpers/get-command.js'
import detectPackageManager from './helpers/detect-package-manager.js'
import injectDefaultDek from './actions/inject-default-dek.js'
import injectSessionSecret from './actions/inject-session-secret.js'
import directoryExists from './helpers/directory-exists.js'

async function main() {
  const cwd = process.cwd()
  intro(color.inverse('create-sails'))

  const argv = minimist(process.argv.slice(2), {
    boolean: true
  })
  let projectNameFromArgv = argv._[0]
  const s = spinner()

  const specifiedProjectName = await projectName(projectNameFromArgv)
  const root = path.join(cwd, specifiedProjectName)

  if (directoryExists(root)) {
    console.log()
    cancel(color.red(`${root} already exists.`))
    process.exit(1)
  }

  const specifiedFrontend = await frontend(argv)

  s.start('Copying project files.')
  await downloadProject(specifiedProjectName, { frontend: specifiedFrontend })
  s.stop(color.green('Template copied!'))

  injectDefaultDek(root)
  injectSessionSecret(root)

  console.log()
  console.log('Now run:')
  console.log()

  if (root !== cwd) {
    console.log(`  ${color.green(`cd ${path.relative(cwd, root)}`)}`)
  }
  const packageManager = detectPackageManager()
  console.log(`  ${color.green(getCommand(packageManager, 'install'))}`)
  console.log(`  ${color.green('sails lift')}`)

  outro(color.inverse('Enjoy your boring project.'))
  process.exit(0)
}

main().catch(console.error)
