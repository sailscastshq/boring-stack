const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const getFileExtensionForUI = require('../../utils/get-file-extension-for-ui')

describe('getFileExtensionForUI', function () {
  it("returns '.vue' when given 'vue'", function () {
    assert.equal(getFileExtensionForUI('vue'), '.vue')
  })
  it("returns '.jsx' when given 'react'", function () {
    assert.equal(getFileExtensionForUI('react'), '.jsx')
  })
  it("returns '.svelte' when given 'svelte'", function () {
    assert.equal(getFileExtensionForUI('svelte'), '.svelte')
  })
})
