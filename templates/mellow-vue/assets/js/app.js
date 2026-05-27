import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import '~/css/app.css'

createInertiaApp({
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
  progress: {
    color: '#6C25C1'
  }
})
