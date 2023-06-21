#!/usr/bin/env node
import { intro, outro, spinner } from '@clack/prompts'
import minimist from 'minimist'
import color from 'picocolors'
import projectName from './actions/project-name.js'
import frontend from './actions/frontend.js'
import downloadProject from './actions/download-project.js'

async function main() {
  intro(color.inverse('create-sails'))

  const argv = minimist(process.argv.slice(2), {
    boolean: true
  })
  let projectNameFromArgv = argv._[0]

  const specifiedProjectName = await projectName(projectNameFromArgv)
  const specifiedFrontend = await frontend(argv)

  downloadProject(specifiedProjectName, specifiedFrontend)

  // outro(`Scaffolded your boring JavaScript project 🥱`)
}

main().catch(console.error)
