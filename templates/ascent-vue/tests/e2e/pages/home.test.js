const { test } = require('sounding')

test('home page returns the expected Inertia payload', async ({
  visit,
  expect
}) => {
  const page = await visit('/')

  expect(page).toHaveStatus(200)
  expect(page).toBeInertiaPage('index')
})
