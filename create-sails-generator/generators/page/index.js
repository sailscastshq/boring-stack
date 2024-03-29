const path = require('path')
const getUiFramework = require('../../utils/get-ui-framework')
const getComponentName = require('../../utils/get-component-name')
const getFileExtensionForUi = require('../../utils/get-file-extension-for-ui')
const copy = require('../../utils/copy')
/**
 * Generates responses/inertia.js file
 */

module.exports = {
  before: function (scope, done) {
    const appPackageJSON = require(`${scope.topLvlRootPath}/package.json`)
    const uiFramework = getUiFramework(appPackageJSON)
    scope.templateName = `${uiFramework}.template`
    let roughName

    if (scope.name) {
      roughName = scope.name
    }

    if (scope.args[0] && typeof scope.args[0] == 'string') {
      roughName = scope.args[0]
    }

    if (!roughName) {
      return done(
        new Error(
          'Missing argument: Please provide a name for the new page.\n' +
            '(e.g. `profile` or `sign-up`).'
        )
      )
    }

    // Replace backslashes with proper slashes.
    // (This is crucial for Windows compatibility.)
    roughName = roughName.replace(/\\/g, '/')

    scope.relPath = roughName.replace(/\.+/g, '/')
    scope.relPath += getFileExtensionForUi(uiFramework)
    if (uiFramework == 'react') {
      scope.componentName = getComponentName(roughName)
    }
    console.log(scope)
    return done()
  },
  after: function (scope, done) {
    console.log()
    console.log(`Successfully generated ${scope.relPath}`)
    console.log(' •-', `assets/js/pages/${scope.relPath}`)
    console.log()
    return done()
  },
  targets: {
    './assets/js/pages/:relPath': {
      exec: function (scope, done) {
        scope.templatePath = `./${scope.templateName}`
        copy(scope, function (err) {
          if (err) {
            return done(err)
          }
          return done()
        })
      }
    }
    // './api/controllers/:actionRelPath': {
    //   exec: function (scope, done) {
    //     scope.templatePath = `./action.template`
    //     copy(scope, function (err) {
    //       if (err) {
    //         return done(err)
    //       }
    //       return done()
    //     })
    //   }
    // }
  },
  templatesDirectory: path.resolve(__dirname, './templates')
}
