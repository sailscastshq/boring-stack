const { pluginTailwindcss } = require('@rsbuild/plugin-tailwindcss')
const { pluginSvelte } = require('@rsbuild/plugin-svelte')
const { pluginInertia } = require('rsbuild-plugin-inertia')

module.exports.shipwright = {
  build: {
    plugins: [pluginTailwindcss(), pluginSvelte(), pluginInertia()]
  }
}
