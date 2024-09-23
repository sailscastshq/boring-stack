import { createInertiaApp } from '@inertiajs/svelte'
import '~/css/main.css'

createInertiaApp({
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props }) {
    new App({ target: el, props })
  },
  progress: {
    color: '#6C25C1'
  }
})
