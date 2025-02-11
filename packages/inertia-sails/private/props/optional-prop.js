const ignoreFirstLoadSymbol = require('../helpers/ignore-first-load-symbol')

module.exports = class OptionalProp {
  constructor(callback) {
    this.callback = callback
    this[ignoreFirstLoadSymbol] = true
  }
}
