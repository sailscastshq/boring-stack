const { pluginVue } = require('@rsbuild/plugin-vue')
const { pluginInertia } = require('rsbuild-plugin-inertia')

module.exports.shipwright = {
  build: {
    plugins: [pluginVue(), pluginInertia()]
  }
}
