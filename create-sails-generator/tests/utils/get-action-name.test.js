const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const getActionName = require('../../utils/get-action-name')

describe('getActionName', function () {
  it("returns 'view-dashboard' when given 'dashboard'", function () {
    assert.equal(getActionName('dashboard'), 'view-dashboard')
  })
  it("returns 'user/view-users' when given 'users/index'", function () {
    assert.equal(getActionName('users/index'), 'user/view-users')
  })
})
