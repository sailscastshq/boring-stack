import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api'
import Tailwind from 'primereact/passthrough/tailwind'
import '~/css/app.css'
import 'primeicons/primeicons.css'

createInertiaApp({
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props }) {
    createRoot(el).render(
      <PrimeReactProvider
        value={{
          unstyled: true,
          pt: Tailwind,
          ptOptions: { mergeProps: true, mergeSections: true }
        }}
      >
        <App {...props} />
      </PrimeReactProvider>
    )
  },
  progress: {
    color: '#0EA5E9'
  }
})
