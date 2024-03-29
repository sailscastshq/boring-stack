const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const getComponentName = require('../../utils/get-component-name')

describe('getComponentName', function () {
  it("returns 'Profile' when given 'profile'", function () {
    assert.equal(getComponentName('profile'), 'Profile')
  })
  it("returns 'UserDashboard' when given 'user-dashboard'", function () {
    assert.equal(getComponentName('user-dashboard'), 'UserDashboard')
  })
})
