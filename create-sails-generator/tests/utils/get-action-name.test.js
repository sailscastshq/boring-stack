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
  it("returns 'user/view-user' when given 'users/user'", function () {
    assert.equal(getActionName('users/user'), 'user/view-user')
  })
  it("returns 'user/view-profile' when given 'users/profile'", function () {
    assert.equal(getActionName('users/profile'), 'user/view-profile')
  })
})
