const { test } = require('sounding')

test('getUserInitials returns initials for two names', async ({
  sails,
  expect
}) => {
  const initials = await sails.helpers.getUserInitials('Kelvin Omereshone')
  expect(initials).toBe('KO')
})

test('getUserInitials returns two initials for one name', async ({
  sails,
  expect
}) => {
  const initials = await sails.helpers.getUserInitials('Kelvin')
  expect(initials).toBe('KE')
})
