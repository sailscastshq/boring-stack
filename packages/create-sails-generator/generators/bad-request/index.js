const path = require('path')
/**
 * Generates responses/badRequest.js file
 */
module.exports = {
  before: function (scope, done) {
    if (scope.force !== false) {
      scope.force = true
    }
    scope.relPath = 'badRequest.js'
    return done()
  },
  after: function (scope, done) {
    console.log()
    console.log(`Successfully generated ${scope.relPath}`)
    console.log(' •-', `api/responses/${scope.relPath}`)
    console.log()
    return done()
  },
  targets: {
    './api/responses/:relPath': { copy: 'badRequest.js' }
  },
  templatesDirectory: path.resolve(__dirname, './templates')
}
