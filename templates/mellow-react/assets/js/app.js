import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import '~/css/app.css'

createInertiaApp({
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
  progress: {
    color: '#6C25C1'
  }
})
