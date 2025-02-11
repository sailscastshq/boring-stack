const ignoreFirstLoadSymbol = require('../helpers/ignore-first-load-symbol')
const MergeableProp = require('../props/mergeable-prop')

module.exports = class DeferProp extends MergeableProp {
  constructor(callback, group) {
    super()
    this.callback = callback
    this.group = group
    this[ignoreFirstLoadSymbol] = true
  }

  getGroup() {
    return this.group
  }
}
