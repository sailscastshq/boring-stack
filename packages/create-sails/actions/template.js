import { select, isCancel, cancel } from '@clack/prompts'
import color from 'picocolors'

export default async function template(argv, frontend) {
  if (argv.ascent) {
    return 'ascent'
  }

  const templateChoice = await select({
    message: 'Select a template variant. › - Use arrow-keys. Return to submit',
    options: [
      {
        value: 'mellow',
        label: 'Mellow (Default)',
        hint: 'Clean, minimal starter with Inertia.js, Tailwind CSS - perfect for most projects'
      },
      {
        value: 'ascent',
        label: 'Ascent (SaaS Ready)',
        hint: 'Production-ready SaaS template with auth, billing, admin panel, and more'
      }
    ]
  })

  if (isCancel(templateChoice)) {
    cancel('Operation cancelled. See you later, sailor!')
    process.exit(0)
  }

  if (templateChoice === 'ascent' && frontend !== 'react') {
    console.log()
    console.log(
      color.yellow(
        `🚧 Ascent ${
          frontend.charAt(0).toUpperCase() + frontend.slice(1)
        } template is not ready yet!`
      )
    )
    console.log()
    console.log(
      color.cyan('Want to help speed up development? Sponsor my work at:')
    )
    console.log(color.blue('https://github.com/sponsors/DominusKelvin'))
    console.log()
    cancel('Template not available yet. Please try React with Ascent for now.')
    process.exit(1)
  }

  return templateChoice
}
