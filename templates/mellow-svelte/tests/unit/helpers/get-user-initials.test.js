const { test } = require('sounding')

test('getUserInitials returns initials for two names', async ({
  sails,
  expect
}) => {
  const initials = await sails.helpers.getUserInitials('Kelvin Omereshone')
  expect(initials).toBe('KO')
})

test('getUserInitials returns a single initial for one name', async ({
  sails,
  expect
}) => {
  const initials = await sails.helpers.getUserInitials('Kelvin')
  expect(initials).toBe('K')
})
