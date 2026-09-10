const { pluginTailwindcss } = require('@rsbuild/plugin-tailwindcss')
const { pluginReact } = require('@rsbuild/plugin-react')
const { pluginInertia } = require('rsbuild-plugin-inertia')

module.exports.shipwright = {
  build: {
    plugins: [pluginTailwindcss(), pluginReact(), pluginInertia()]
  }
}
