import { createInertiaApp } from '@inertiajs/vue3'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

export default function render(page) {
  return createInertiaApp({
    page,
    render: renderToString,
    setup({ App, props, plugin }) {
      const app = createSSRApp({ render: () => h(App, props) })

      app.use(plugin)
      app.use(PrimeVue, {
        unstyled: true
      })
      app.use(ToastService)
      app.use(ConfirmationService)

      return app
    }
  })
}
