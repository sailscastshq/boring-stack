import { spinner } from '@clack/prompts'
import color from 'picocolors'
import degit from 'degit'

export default async function downloadProject(projectName, frontend) {
  const emitter = degit(`sailscastshq/boring-stack/${frontend}`)
  emitter.on('info', (info) => {
    console.log(info.message)
  })
  await emitter.clone(`${projectName}`).then(() => {})
}
