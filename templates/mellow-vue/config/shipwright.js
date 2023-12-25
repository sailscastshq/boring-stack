const { pluginVue } = require('@rsbuild/plugin-vue')
module.exports.shipwright = {
  build: {
    plugins: [pluginVue()]
  }
}
