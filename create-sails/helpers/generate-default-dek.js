const crypto = require('crypto')

module.exports = function generateDefaultDEK() {
  return crypto.randomBytes(32).toString('base64')
}
