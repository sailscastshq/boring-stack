import { spinner } from '@clack/prompts'
import color from 'picocolors'
import degit from 'degit'
const s = spinner()

export default function downloadProject(projectName, frontend) {
  const emitter = degit(`sailscastshq/boring-stack/${frontend}`)
  s.start('Downloading your project.')

  emitter.on('info', (info) => {
    console.log(info.message)
  })

  emitter.clone(`${projectName}`).then(() => {
    s.stop(color.green('Project downloaded.'))
  })
}
