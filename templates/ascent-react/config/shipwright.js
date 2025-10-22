const { pluginReact } = require('@rsbuild/plugin-react')
module.exports.shipwright = {
  build: {
    plugins: [pluginReact()]
  }
}
