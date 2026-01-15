const { describe, it, before } = require('node:test')
const assert = require('node:assert/strict')
const { getSails } = require('../../util/get-sails')

describe('sails.helpers.capitalize()', () => {
  let sails

  before(async () => {
    sails = await getSails()
  })

  it('capitalizes single word correctly', async () => {
    const capitalized = sails.helpers.capitalize('hello')
    assert.equal(capitalized, 'Hello')
  })

  it('capitalizes multiple words correctly', async () => {
    const capitalized = sails.helpers.capitalize('the quick brown fox')
    assert.equal(capitalized, 'The quick brown fox')
  })
})
