import { select, isCancel, cancel } from '@clack/prompts'
import color from 'picocolors'

export default async function frontend(argv) {
  const supportedFrontends = ['vue', 'react', 'svelte']
  const countOfFrontendFlagsPassed = supportedFrontends.filter(
    (frontend) => argv[frontend]
  ).length
  let frontend

  if (countOfFrontendFlagsPassed == 0) {
    frontend = await select({
      message: 'Select a framework. › - Use arrow-keys. Return to submit',
      options: [
        {
          value: 'vue',
          label: 'Vue',
          hint: 'https://vuejs.org'
        },
        {
          value: 'react',
          label: 'React',
          hint: 'https://react.dev'
        },
        {
          value: 'svelte',
          label: 'Svelte',
          hint: 'https://svelte.dev'
        }
      ]
    })

    if (isCancel(frontend)) {
      cancel('Operation cancelled. See you later, sailor!')
      process.exit(0)
    }
  } else if (countOfFrontendFlagsPassed == 1) {
    frontend = supportedFrontends.find((key) => argv[key])
  } else {
    console.log()
    cancel(
      color.red(
        'Please provide only one of the following flags: --vue, --react, --svelte'
      )
    )
    process.exit(0)
  }

  return frontend
}
