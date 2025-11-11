import { createInertiaApp } from '@inertiajs/svelte'
import { mount } from 'svelte'
import '~/css/app.css'

createInertiaApp({
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props }) {
    mount(App, { target: el, props })
  },
  progress: {
    color: '#6C25C1'
  }
})
