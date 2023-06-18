import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import '~/css/main.css'

createInertiaApp({
  title: () => 'VITS stack',
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
  progress: {
    color: '#29d'
  }
})
