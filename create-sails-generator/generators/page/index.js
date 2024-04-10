const path = require('path')
const getUiFramework = require('../../utils/get-ui-framework')
const getComponentName = require('../../utils/get-component-name')
const getFileExtensionForUi = require('../../utils/get-file-extension-for-ui')
const getActionName = require('../../utils/get-action-name')
/**
 * Generates responses/inertia.js file
 */

module.exports = {
  before: function (scope, done) {
    const appPackageJSON = require(`${scope.topLvlRootPath}/package.json`)
    const uiFramework = getUiFramework(appPackageJSON)
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

    scope.pageRelPath = roughName.replace(/\.+/g, '/')
    scope.pagePath = scope.pageRelPath
    console.log(scope.pagePath)
    scope.pageRelPath += getFileExtensionForUi(uiFramework)
    scope.uiFramework = uiFramework
    if (uiFramework == 'react') {
      scope.componentName = getComponentName(roughName)
    }

    scope.actionRelPath = getActionName(roughName)
    scope.actionRelPath += '.js'
    scope.actionFriendlyName = `View ${scope.pagePath}`
    scope.actionDescription = `Display ${scope.pagePath} page`

    return done()
  },
  after: function (scope, done) {
    console.log()

    console.log(`Successfully generated ${scope.pageRelPath}`)
    console.log(' •-', `assets/js/pages/${scope.pageRelPath}`)

    console.log(`Successfully generated ${scope.actionRelPath}`)
    console.log(' •-', `api/controllers/${scope.actionRelPath}`)

    console.log()
    return done()
  },
  targets: {
    './assets/js/pages/:pageRelPath': { template: 'page.template' },
    './api/controllers/:actionRelPath': { template: 'action.template' }
  },
  templatesDirectory: path.resolve(__dirname, './templates')
}
