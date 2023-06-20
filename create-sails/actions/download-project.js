import { execSync } from 'child_process'
import { spinner } from '@clack/prompts'
import color from 'picocolors'

const s = spinner()
export default function downloadProject(projectName, frontend) {
  const repositoryUrl = 'https://github.com/sailscastshq/boring-stack.git'
  try {
    s.start(`Downloading your boring project...`)
    execSync(
      `git clone --depth 1 --filter=tree:create-sails ${repositoryUrl} ${projectName}`
    )
    s.stop(color.green(`Successfully downloaded your boring project.`))
  } catch (error) {
    s.stop(color.red(error.message))
    process.exit(0)
  }
}
