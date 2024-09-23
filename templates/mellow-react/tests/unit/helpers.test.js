const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const Sails = require('sails').constructor

describe('sails.helpers.capitalize()', () => {
  let sails
  let sailsApp = new Sails()

  before(async () => {
    sails = await new Promise((resolve, reject) => {
      sailsApp.load(
        { environment: 'testing', hooks: { shipwright: false } },
        (err, sailsInstance) => {
          if (err) {
            return reject(err)
          }
          resolve(sailsInstance)
        }
      )
    })
  })

  after(async () => {
    await new Promise((resolve, reject) => {
      sailsApp.lower((err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
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

describe('sails.helpers.getUserIntials()', () => {
  let sails
  let sailsApp = new Sails()

  before(async () => {
    sails = await new Promise((resolve, reject) => {
      sailsApp.load(
        { environment: 'testing', hooks: { shipwright: false } },
        (err, sailsInstance) => {
          if (err) {
            return reject(err)
          }
          resolve(sailsInstance)
        }
      )
    })
  })

  after(async () => {
    await new Promise((resolve, reject) => {
      sailsApp.lower((err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
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
