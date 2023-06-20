#!/usr/bin/env node
import { intro, outro } from '@clack/prompts'
import minimist from 'minimist'
import color from 'picocolors'
import { execSync } from 'child_process'
import projectName from './actions/project-name.js'
import frontend from './actions/frontend.js'
async function main() {
  const argv = minimist(process.argv.slice(2), {
    boolean: true
  })
  let projectNameFromArgv = argv._[0]
  intro(color.inverse('create-sails'))

  const specifiedProjectName = await projectName(projectNameFromArgv)
  const specifiedFrontend = await frontend(argv)

  outro(`Scaffolded your boring JavaScript project 🥱`)
}

main().catch(console.error)
