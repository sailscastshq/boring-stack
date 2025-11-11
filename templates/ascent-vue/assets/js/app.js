import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import '~/css/app.css'
import 'primeicons/primeicons.css'

createInertiaApp({
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props, plugin }) {
    const app = createApp({ render: () => h(App, props) })

    app.use(plugin)
    app.use(PrimeVue, {
      unstyled: true
    })
    app.use(ToastService)
    app.use(ConfirmationService)
    app.use(FloatingVue)

    app.mount(el)
  },
  progress: {
    color: '#0EA5E9'
  }
})
