const { describe, it, before } = require('node:test')
const assert = require('node:assert/strict')
const { getSails } = require('../../util/get-sails')

describe('sails.helpers.getUserInitials()', () => {
  let sails

  before(async () => {
    sails = await getSails()
  })

  it('gets user initials from first name and last name', async () => {
    const initials = sails.helpers.getUserInitials('Kelvin Omereshone')
    assert.equal(initials, 'KO')
  })

  it('gets user initials from just name', async () => {
    const initials = sails.helpers.getUserInitials('Kelvin')
    assert.equal(initials, 'KE')
  })
})
