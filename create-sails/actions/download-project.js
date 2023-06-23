import { downloadTemplate } from 'giget'
import { cancel } from '@clack/prompts'
export default async function downloadProject(
  projectName,
  { frontend, template }
) {
  const templateToCopy = getTemplate(frontend, template)
  try {
    const { source, dir } = await downloadTemplate(
      `github:sailscastshq/boring-stack/templates/${templateToCopy}#main`,
      {
        dir: projectName,
        repo: 'sailscastshq/boring-stack',
        ref: 'main',
        subdir: templateToCopy,
        force: true,
        cwd: '.'
      }
    )
    return { source, dir }
  } catch (error) {
    if (error instanceof Error) {
      cancel(error.message)
      process.exit(1)
    } else {
      cancel('Unable to clone template.')
      process.exit(1)
    }
  }
}

function getTemplate(frontend, template = 'mellow') {
  return `${template}-${frontend}`
}
