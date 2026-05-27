const { pluginSvelte } = require('@rsbuild/plugin-svelte')
const { pluginInertia } = require('rsbuild-plugin-inertia')

module.exports.shipwright = {
  build: {
    plugins: [pluginSvelte(), pluginInertia()]
  }
}
