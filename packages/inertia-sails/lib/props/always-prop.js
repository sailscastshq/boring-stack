const MergeableProp = require('./mergeable-prop')

module.exports = class AlwaysProp extends MergeableProp {
  constructor(callback) {
    super()
    this.callback = callback
  }
}
