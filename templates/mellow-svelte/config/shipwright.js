const { pluginSvelte } = require('@rsbuild/plugin-svelte')
module.exports.shipwright = {
  build: {
    plugins: [pluginSvelte()]
  }
}
