module.exports = class MergeableProp {
  constructor() {
    this.shouldMerge = false
  }

  merge() {
    this.shouldMerge = true
    return this
  }
}
