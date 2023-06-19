#!/usr/bin/env node
import { intro, outro, select, isCancel, cancel } from '@clack/prompts'

intro('create-sails')

const ui = await select({
  message: 'Select your preferred UI framework.',
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

if (isCancel(ui)) {
  cancel('Scaffolding cancelled.')
  process.exit(0)
}
outro(`Scaffolded your boring JavaScript project 🥱`)
