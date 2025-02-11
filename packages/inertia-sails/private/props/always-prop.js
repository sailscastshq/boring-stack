const MergeableProp = require('../props/mergeable-prop')

module.exports = class AlwaysProp extends MergeableProp {
  constructor(callback) {
    super()
    this.callback = callback
  }
}
