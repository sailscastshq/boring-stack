import Notifications from '@/components/Notifications.vue'
import { createApp, createSSRApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import '~/css/app.css'

createInertiaApp({
  setup({ el, App, props, plugin }) {
    const createVueApp = el.hasAttribute('data-server-rendered')
      ? createSSRApp
      : createApp
    const app = createVueApp({
      render: () => [h(App, props), h(Notifications)]
    })

    app.use(plugin)

    app.mount(el)
  },
  progress: {
    color: '#0EA5E9'
  }
})
