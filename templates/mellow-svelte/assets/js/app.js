import { createInertiaApp } from '@inertiajs/svelte'
import '~/css/main.css'

// @ts-ignore
createInertiaApp({
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props }) {
    new App({ target: el, props })
  }
})
