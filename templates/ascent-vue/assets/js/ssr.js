import Notifications from '@/components/Notifications.vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'

export default function render(page) {
  return createInertiaApp({
    page,
    render: renderToString,
    setup({ App, props, plugin }) {
      const app = createSSRApp({
        render: () => [h(App, props), h(Notifications)]
      })

      app.use(plugin)

      return app
    }
  })
}
