const { test } = require('sounding')

test('capitalize capitalizes a single word correctly', async ({
  sails,
  expect
}) => {
  const capitalized = await sails.helpers.capitalize('hello')
  expect(capitalized).toBe('Hello')
})

test('capitalize capitalizes multiple words correctly', async ({
  sails,
  expect
}) => {
  const capitalized = await sails.helpers.capitalize('the quick brown fox')
  expect(capitalized).toBe('The quick brown fox')
})
