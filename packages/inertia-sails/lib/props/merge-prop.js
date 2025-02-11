const MergeableProp = require('./mergeable-prop')

module.exports = class MergeProp extends MergeableProp {
  constructor(callback) {
    super()
    this.callback = callback
    this.shouldMerge = true
  }
}
